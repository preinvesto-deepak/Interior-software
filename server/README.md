# MySQL backend (PHP API)

Replaces the app's old `localStorage` persistence with MySQL. The whole app
state (projects, sub-projects, prices, templates, material models, wardrobe
records, etc.) is still one JSON object client-side — this API just stores
that object in MySQL (one row per top-level key, in `app_state`) instead of
the browser.

## Files

- `schema.sql` — creates the database + `app_state` table, seeds empty defaults.
- `config.php` — DB credentials, API key, CORS. Edit this (or set the matching env vars on your host).
- `state.php` — the only endpoint: `GET` loads the whole state, `POST` saves it.

## Setup

1. Create the database and table:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. Edit `config.php` (or set env vars `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `API_KEY`, `ALLOWED_ORIGINS`) with your real credentials.
3. Set a real `API_KEY` — there's no login system in this app, so this key is what stops a stranger who finds the URL from reading/overwriting your data. Put the same value in the React app's `.env` as `VITE_API_KEY`.
4. Run the PHP server. For local development:
   ```bash
   php -S localhost:8000 -t server
   ```
   In production, point your web server (Apache/Nginx/IIS) at the `server/` folder, or copy it into your PHP host's document root.
5. In the React app's `.env` (copy `.env.example`), set:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_KEY=<same value as config.php's API_KEY>
   ```
6. Restart `npm run dev` so Vite picks up the new env vars.

## Requirements

- PHP 7.4+ with the `pdo_mysql` extension enabled.
- MySQL 5.7+ / MariaDB 10.2+ (needs native `JSON`-capable `utf8mb4` support; the columns are stored as `LONGTEXT` so any reasonably recent version works).

## Notes

- `state.php` whitelists the exact keys the app uses (see `DEFAULTS` in that file) — a `POST` with an unknown key is rejected with `400`, so this can't be used to write arbitrary rows.
- Saves are debounced client-side (800ms after the last change) — see `AppDataContext.jsx` — so typing doesn't spam the API.
- If you later want per-user data instead of one shared blob, the natural extension is adding a `user_id` column to `app_state` (composite key `(user_id, data_key)`) and an auth layer in front of `state.php` — out of scope for this pass, since the app currently has no login system at all.
