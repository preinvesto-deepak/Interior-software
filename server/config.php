<?php
/**
 * Database + API connection settings.
 *
 * Fill in your real MySQL credentials below (or, better, set them as real
 * environment variables on your host and leave the getenv() fallback as-is).
 * This file is deliberately NOT committed with real secrets — treat it the
 * same way you'd treat a .env file.
 */

// ---- MySQL connection -------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'interior_quotation_app');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// ---- API access key -----------------------------------------------------
// The app has no login system (it's a single-workspace tool), so this key
// is the only thing stopping a stranger who finds the URL from reading or
// overwriting your data. Set a long random value here AND the matching
// VITE_API_KEY in the React app's .env file. Leave both blank only for
// local development on a machine nobody else can reach.
define('API_KEY', getenv('API_KEY') ?: '');

// ---- CORS -----------------------------------------------------------
// Comma-separated list of origins allowed to call this API, e.g.
// "http://localhost:5173,https://quotes.yourdomain.com". "*" allows any
// origin (fine for local dev, not recommended once API_KEY is set for real
// use, since "*" cannot be combined with credentials).
define('ALLOWED_ORIGINS', getenv('ALLOWED_ORIGINS') ?: '*');

function get_pdo(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/** Common CORS + JSON headers, and API-key gate, shared by every endpoint. */
function api_bootstrap(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = array_map('trim', explode(',', ALLOWED_ORIGINS));
    if (in_array('*', $allowed, true)) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (API_KEY !== '') {
        $provided = $_SERVER['HTTP_X_API_KEY'] ?? '';
        if (!hash_equals(API_KEY, $provided)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or missing API key']);
            exit;
        }
    }
}

/** Send a JSON error response and stop. */
function api_fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}
