<?php
/**
 * Football Galaxy proxy configuration for Hostinger.
 *
 * Copy to the home directory of the hosting account, NEXT TO public_html
 * (not inside it), as `football-galaxy-config.php`:
 *
 *   /home/<user>/football-galaxy-config.php   ← this file
 *   /home/<user>/public_html/api/live.php      ← the proxy
 *
 * Environment variables with the same names take precedence.
 */
return [
    // football-data.org free-tier key: https://www.football-data.org/client/register
    'FOOTBALL_DATA_API_KEY' => '',

    // Only needed when another origin (e.g. a staging domain) calls the proxy.
    // Same-origin requests from the app itself always pass.
    'ALLOWED_ORIGINS' => '',

    // Optional: cache/rate-limit directory, ideally outside public_html.
    // Default: public_html/api/cache (denied by api/.htaccess).
    'FG_PROXY_DATA_DIR' => '',
];
