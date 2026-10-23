# Deploy auf Hostinger (Shared Hosting)

Die App ist ein statisches Frontend. Daten laufen über einen kleinen PHP-Proxy auf derselben Domain
(`/api/live.php`), der den football-data.org-Schlüssel serverseitig hält, das gemeinsame Rate-Limit
einhält und Antworten zwischenspeichert. Spezifikation: [`proxy/SPEC.md`](../proxy/SPEC.md).

## Voraussetzungen

- Hostinger-Webhosting mit **PHP 8.1 oder neuer** und der Erweiterung **curl** (Standard bei Hostinger).
- Domain mit SSL (Hostinger stellt es kostenlos aus); die `.htaccess` leitet auf HTTPS um.
- Ein kostenloser football-data.org-Schlüssel.

## 1. Paket bauen

Entweder das ZIP aus dem GitHub-Release nehmen (`football-galaxy-hostinger-vX.Y.Z.zip`, entsteht bei jedem
Push auf `develop`) oder lokal bauen:

```bash
npm run build:hostinger
```

Ergebnis: `dist-hostinger/` mit `index.html`, `assets/`, `.htaccess` und `api/` (`live.php`, `rules.json`,
`.htaccess`).

## 2. Hochladen

1. hPanel → **Dateimanager** → `public_html/`.
2. Den **Inhalt** von `dist-hostinger/` (bzw. des ZIPs) nach `public_html/` hochladen. Versteckte Dateien
   (`.htaccess`) mit hochladen.
3. Alte Dateien aus `public_html/assets/` vorher löschen oder nach dem Upload aufräumen (die Namen enthalten Hashes).

## 3. Schlüssel hinterlegen (außerhalb des Webroots)

1. [`deploy/football-galaxy-config.sample.php`](../deploy/football-galaxy-config.sample.php) kopieren als
   `football-galaxy-config.php` **ins Home-Verzeichnis neben `public_html`** (nicht hinein):

   ```
   /home/<user>/football-galaxy-config.php
   /home/<user>/public_html/api/live.php
   ```

2. `FOOTBALL_DATA_API_KEY` eintragen. Fertig — der Proxy liest die Datei bei jeder Anfrage.

Fallback, falls das Home-Verzeichnis nicht beschreibbar ist: `public_html/api/config.php` (wird von
`api/.htaccess` gesperrt).

## 4. Prüfen

| Prüfung | Erwartung |
|---|---|
| `https://<domain>/api/live.php?health=1` | `{"status":"ok"}` |
| `https://<domain>/api/rules.json` | `403` |
| `https://<domain>/premier-league` (direkt aufrufen) | App lädt (SPA-Fallback) |
| Browser-Netzwerk → Antwort von `live.php` | Header `x-proxy-cache: miss`, beim zweiten Aufruf `hit` |
| `curl -I https://<domain>/` | `content-security-policy`, `strict-transport-security`, `x-content-type-options` |
| `curl -I https://<domain>/assets/<datei>.js` | `cache-control: public, max-age=31536000, immutable` |

Der Cache liegt in `public_html/api/cache/` (gesperrt). Er darf jederzeit gelöscht werden.

## Hinweise

- **Rate-Limits:** pro Besucher-IP 240 Anfragen/Minute; football-data.org insgesamt 10/Minute. Ist das Budget
  erschöpft, liefert der Proxy die gespeicherte Kopie (die App zeigt dann „Gespeicherter Stand“).
- **Andere Origin** (z. B. GitHub Pages ruft den Hostinger-Proxy auf): `ALLOWED_ORIGINS` in der Config-Datei
  setzen, z. B. `https://c0dewiz4rd010.github.io`.
- **CSP:** Der Build trägt den Hash des Inline-Theme-Skripts in die `.htaccess` ein. Wer `index.html` von Hand
  ändert, muss neu bauen.
