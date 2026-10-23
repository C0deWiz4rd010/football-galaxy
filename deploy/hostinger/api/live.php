<?php
/**
 * Football Galaxy live-data proxy for shared hosting (PHP 8.1+, curl).
 *
 * Implements proxy/SPEC.md with the rules in rules.json (copied next to this
 * file by `npm run build:hostinger`): host allowlist, origin check, per-IP
 * rate limit, a shared football-data.org budget, a file cache with per-route
 * TTLs and stale-on-error. The football-data.org key never reaches the browser.
 */

declare(strict_types=1);

// JSON compresses 10–25×; let PHP do it unless the server already does.
if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
    ob_start('ob_gzhandler');
}

$rules = json_decode((string) @file_get_contents(__DIR__ . '/rules.json'), true);
if (!is_array($rules)) {
    fg_error(500, 'Proxy rules are missing.');
}
$config = fg_config();
$dataDir = $config['FG_PROXY_DATA_DIR'] !== '' ? $config['FG_PROXY_DATA_DIR'] : __DIR__ . '/cache';
if (!is_dir($dataDir) && !@mkdir($dataDir, 0750, true) && !is_dir($dataDir)) {
    fg_error(500, 'Proxy cache is not writable.');
}

// --- CORS and method ---------------------------------------------------------

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', $config['ALLOWED_ORIGINS'])));
$corsHeaders = ['Vary: Origin'];
if ($origin !== '') {
    if (!in_array($origin, $allowedOrigins, true)) {
        fg_error(403, 'Origin is not allowed.', $corsHeaders);
    }
    $corsHeaders[] = 'Access-Control-Allow-Origin: ' . $origin;
    $corsHeaders[] = 'Access-Control-Allow-Methods: GET, OPTIONS';
    $corsHeaders[] = 'Access-Control-Allow-Headers: content-type';
    $corsHeaders[] = 'Access-Control-Expose-Headers: ' . implode(', ', $rules['exposedHeaders']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    fg_send(204, '', $corsHeaders);
}
if ($method !== 'GET') {
    fg_error(405, 'Only GET is supported.', $corsHeaders);
}

if (isset($_GET['health'])) {
    fg_send(200, '{"status":"ok"}', array_merge($corsHeaders, ['Content-Type: application/json', 'Cache-Control: no-store']));
}

// --- Client rate limit -------------------------------------------------------

$clientLimit = $rules['clientRateLimit'];
$clientKey = 'rl-' . sha1((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$wait = fg_take_slot($dataDir, $clientKey, (int) $clientLimit['limit'], (int) $clientLimit['windowSeconds']);
if ($wait > 0) {
    fg_error(429, 'Too many requests.', array_merge($corsHeaders, ['Retry-After: ' . $wait]));
}

// --- Target ------------------------------------------------------------------

$target = isset($_GET['target']) && is_string($_GET['target']) ? $_GET['target'] : '';
if ($target === '') {
    fg_error(400, 'Missing target query parameter.', $corsHeaders);
}
$parts = parse_url($target);
if (!is_array($parts) || ($parts['scheme'] ?? '') === '' || ($parts['host'] ?? '') === '') {
    fg_error(400, 'Target must be an absolute URL.', $corsHeaders);
}
$host = strtolower($parts['host']);
if (
    strtolower($parts['scheme']) !== 'https'
    || !in_array($host, $rules['hosts'], true)
    || isset($parts['user'])
    || isset($parts['pass'])
    || isset($parts['port'])
) {
    fg_error(403, 'Target host is not allowed.', $corsHeaders);
}
$pathAndQuery = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');
$ttl = fg_ttl($rules, $host, $pathAndQuery);

// --- Cache -------------------------------------------------------------------

$cacheKey = 'c-' . hash('sha256', $target);
$cached = fg_cache_read($dataDir, $cacheKey);
$age = $cached ? time() - $cached['storedAt'] : PHP_INT_MAX;
if ($cached && $age < $ttl) {
    fg_send(200, $cached['body'], array_merge($corsHeaders, [
        'Content-Type: ' . $cached['contentType'],
        'Cache-Control: public, max-age=' . max(0, $ttl - $age),
        'X-Proxy-Cache: hit',
    ]));
}
$stale = $cached && $age < (int) $rules['maxStaleSeconds'] ? $cached : null;

// --- Upstream budget (shared by every visitor) -------------------------------

$budget = $rules['upstreamBudget'][$host] ?? null;
if (is_array($budget)) {
    $budgetWait = fg_take_slot($dataDir, 'budget-' . sha1($host), (int) $budget['limit'], (int) $budget['windowSeconds']);
    if ($budgetWait > 0) {
        if ($stale) {
            fg_send_stale($stale, $corsHeaders);
        }
        fg_error(429, 'Upstream rate limit reached.', array_merge($corsHeaders, ['Retry-After: ' . $budgetWait]));
    }
}

// --- Upstream call -----------------------------------------------------------

$upstream = fg_fetch($target, $host, $config, $rules);
if ($upstream['status'] === 200) {
    fg_cache_write($dataDir, $cacheKey, $upstream['body'], $upstream['contentType']);
    fg_maybe_prune($dataDir, (int) $rules['maxStaleSeconds']);
    fg_send(200, $upstream['body'], array_merge($corsHeaders, [
        'Content-Type: ' . $upstream['contentType'],
        'Cache-Control: public, max-age=' . $ttl,
        'X-Proxy-Cache: miss',
    ]));
}
$failed = $upstream['status'] === 0 || $upstream['status'] === 429 || $upstream['status'] >= 500;
if ($failed && $stale) {
    fg_send_stale($stale, $corsHeaders);
}
if ($upstream['status'] === 0) {
    fg_error(502, $upstream['error'] ?? 'Failed to reach the upstream provider.', $corsHeaders);
}
$extra = $upstream['retryAfter'] !== '' ? ['Retry-After: ' . $upstream['retryAfter']] : [];
fg_error($upstream['status'], 'Upstream returned ' . $upstream['status'] . '.', array_merge($corsHeaders, $extra));

// =============================================================================

function fg_config(): array
{
    $file = [];
    foreach ([dirname(__DIR__, 2) . '/football-galaxy-config.php', __DIR__ . '/config.php'] as $path) {
        if (is_file($path)) {
            $loaded = include $path;
            if (is_array($loaded)) {
                $file = $loaded;
                break;
            }
        }
    }
    $config = [];
    foreach (['FOOTBALL_DATA_API_KEY', 'ALLOWED_ORIGINS', 'FG_PROXY_DATA_DIR'] as $name) {
        $env = getenv($name);
        $config[$name] = trim(is_string($env) && $env !== '' ? $env : (string) ($file[$name] ?? ''));
    }
    return $config;
}

function fg_ttl(array $rules, string $host, string $pathAndQuery): int
{
    foreach ($rules['ttl'] as $rule) {
        if ($rule['host'] === $host && preg_match('#' . $rule['path'] . '#', $pathAndQuery) === 1) {
            return (int) $rule['seconds'];
        }
    }
    return (int) $rules['defaultTtlSeconds'];
}

/**
 * Sliding window stored as a JSON list of timestamps, guarded by flock.
 * Returns 0 when a slot was taken, otherwise the seconds until one frees up.
 */
function fg_take_slot(string $dir, string $key, int $limit, int $windowSeconds): int
{
    $handle = @fopen($dir . '/' . $key . '.json', 'c+');
    if ($handle === false) {
        return 0;
    }
    try {
        flock($handle, LOCK_EX);
        $now = microtime(true);
        $stamps = json_decode((string) stream_get_contents($handle), true);
        $stamps = array_values(array_filter(is_array($stamps) ? $stamps : [], static fn ($stamp) => is_numeric($stamp) && $stamp > $now - $windowSeconds));
        if (count($stamps) >= $limit) {
            return max(1, (int) ceil($stamps[count($stamps) - $limit] + $windowSeconds - $now));
        }
        $stamps[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($stamps));
        return 0;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function fg_cache_read(string $dir, string $key): ?array
{
    $meta = json_decode((string) @file_get_contents($dir . '/' . $key . '.meta'), true);
    $body = @file_get_contents($dir . '/' . $key . '.body');
    if (!is_array($meta) || !is_string($body)) {
        return null;
    }
    return ['storedAt' => (int) $meta['storedAt'], 'contentType' => (string) $meta['contentType'], 'body' => $body];
}

function fg_cache_write(string $dir, string $key, string $body, string $contentType): void
{
    // Write to temp files and rename, so a concurrent reader never sees half a body.
    $suffix = '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (@file_put_contents($dir . '/' . $key . '.body' . $suffix, $body) === false) {
        return;
    }
    @rename($dir . '/' . $key . '.body' . $suffix, $dir . '/' . $key . '.body');
    @file_put_contents($dir . '/' . $key . '.meta' . $suffix, json_encode(['storedAt' => time(), 'contentType' => $contentType]));
    @rename($dir . '/' . $key . '.meta' . $suffix, $dir . '/' . $key . '.meta');
}

/** Roughly every 200th successful fetch removes cache files past the stale limit. */
function fg_maybe_prune(string $dir, int $maxStaleSeconds): void
{
    if (random_int(1, 200) !== 1) {
        return;
    }
    foreach (glob($dir . '/c-*') ?: [] as $file) {
        if (@filemtime($file) < time() - $maxStaleSeconds) {
            @unlink($file);
        }
    }
}

function fg_fetch(string $target, string $host, array $config, array $rules): array
{
    $headers = ['Accept: application/json', 'User-Agent: FootballGalaxyProxy/2.0'];
    if ($host === 'api.football-data.org' && $config['FOOTBALL_DATA_API_KEY'] !== '') {
        $headers[] = 'X-Auth-Token: ' . $config['FOOTBALL_DATA_API_KEY'];
    }
    $maxBytes = (int) $rules['maxBodyBytes'];
    $body = '';
    $tooLarge = false;
    $responseHeaders = [];
    $curl = curl_init($target);
    curl_setopt_array($curl, [
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_TIMEOUT => (int) $rules['timeoutSeconds'],
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_ENCODING => '',
        CURLOPT_HEADERFUNCTION => static function ($curl, string $line) use (&$responseHeaders): int {
            $pair = explode(':', $line, 2);
            if (count($pair) === 2) {
                $responseHeaders[strtolower(trim($pair[0]))] = trim($pair[1]);
            }
            return strlen($line);
        },
        CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$body, &$tooLarge, $maxBytes): int {
            if (strlen($body) + strlen($chunk) > $maxBytes) {
                $tooLarge = true;
                return 0;
            }
            $body .= $chunk;
            return strlen($chunk);
        },
    ]);
    $ok = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
    if ($tooLarge) {
        return ['status' => 0, 'error' => 'Upstream response is too large.', 'body' => '', 'contentType' => '', 'retryAfter' => ''];
    }
    if ($ok === false || $status === 0) {
        return ['status' => 0, 'error' => null, 'body' => '', 'contentType' => '', 'retryAfter' => ''];
    }
    $retryAfter = $responseHeaders['retry-after'] ?? ($responseHeaders['x-requestcounter-reset'] ?? '');
    return [
        'status' => $status,
        'error' => null,
        'body' => $body,
        'contentType' => $responseHeaders['content-type'] ?? 'application/json',
        'retryAfter' => preg_match('/^\d+$/', $retryAfter) === 1 ? $retryAfter : '',
    ];
}

function fg_send_stale(array $cached, array $corsHeaders): never
{
    fg_send(200, $cached['body'], array_merge($corsHeaders, [
        'Content-Type: ' . $cached['contentType'],
        'Cache-Control: no-store',
        'X-Proxy-Cache: stale',
    ]));
}

function fg_error(int $status, string $message, array $headers = []): never
{
    fg_send($status, (string) json_encode(['error' => $message]), array_merge($headers, ['Content-Type: application/json', 'Cache-Control: no-store']));
}

function fg_send(int $status, string $body, array $headers): never
{
    http_response_code($status);
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    foreach ($headers as $header) {
        header($header);
    }
    echo $body;
    exit;
}
