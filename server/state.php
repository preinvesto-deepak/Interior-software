<?php
/**
 * GET  /server/state.php  -> the whole app state, as one JSON object
 *                            shaped exactly like the old localStorage blob:
 *                            { projects: [...], subProjects: [...], ... }
 * POST /server/state.php  -> body is that same shape; each key is upserted
 *                            into its own row in app_state. Unknown keys are
 *                            rejected (whitelist below) so this endpoint
 *                            can't be used to smuggle arbitrary rows in.
 */

require __DIR__ . '/config.php';
api_bootstrap();

// Every key AppDataContext.jsx persists, with its default value used when
// a row is missing (fresh database, or a key added after some data already
// existed). Keep this list in sync with defaultData in AppDataContext.jsx.
const DEFAULTS = [
    'projects' => [],
    'subProjects' => [],
    'dimensions' => [],
    'prices' => [],
    'materialModelRates' => [],
    'materialModelProfitPercent' => ['economy' => 0, 'standard' => 0, 'premium' => 0],
    'templates' => [],
    'selectedTemplateId' => '',
    'generatedParts' => [],
    'configuredWardrobe' => null,
    'wardrobeRecords' => [],
    'editingWardrobeRecordId' => null,
    'materialStockSettings' => [],
    'kerfWidth' => 0,
];

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = get_pdo();

    if ($method === 'GET') {
        $rows = $pdo->query('SELECT data_key, data_json FROM app_state')->fetchAll();
        $byKey = [];
        foreach ($rows as $row) {
            $byKey[$row['data_key']] = json_decode($row['data_json'], true);
        }

        $result = [];
        foreach (DEFAULTS as $key => $default) {
            $result[$key] = array_key_exists($key, $byKey) ? $byKey[$key] : $default;
        }

        echo json_encode($result);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            api_fail(400, 'Request body must be a JSON object');
        }

        $unknown = array_diff(array_keys($body), array_keys(DEFAULTS));
        if (!empty($unknown)) {
            api_fail(400, 'Unknown key(s): ' . implode(', ', $unknown));
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'INSERT INTO app_state (data_key, data_json) VALUES (:k, :v)
             ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)'
        );
        foreach ($body as $key => $value) {
            $stmt->execute([':k' => $key, ':v' => json_encode($value)]);
        }
        $pdo->commit();

        echo json_encode(['ok' => true]);
        exit;
    }

    api_fail(405, 'Method not allowed');
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Don't leak DB internals to the client — log server-side, return a
    // generic message.
    error_log('state.php DB error: ' . $e->getMessage());
    api_fail(500, 'Database error');
}
