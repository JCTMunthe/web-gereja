<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$fixed_times = ['06:00:00', '09:00:00', '17:00:00'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = db()->query("SELECT id, service_date, service_time, title, minister, featured FROM schedules WHERE published = 1 AND service_time IN ('06:00:00', '09:00:00', '17:00:00') ORDER BY service_date ASC, service_time ASC LIMIT 20");
    respond(['data' => $statement->fetchAll()]);
}

require_admin();
$body = request_body();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $service_time = (string)($body['service_time'] ?? '');
    if (!in_array($service_time, $fixed_times, true)) {
        respond(['error' => 'Jam ibadah harus 06:00, 09:00, atau 17:00.'], 422);
    }
    $statement = db()->prepare('INSERT INTO schedules (service_date, service_time, title, minister, featured) VALUES (?, ?, ?, ?, ?)');
    $statement->execute([$body['service_date'] ?? '', $service_time, trim((string)($body['title'] ?? '')), trim((string)($body['minister'] ?? '')), !empty($body['featured']) ? 1 : 0]);
    respond(['id' => (int)db()->lastInsertId()], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $statement = db()->prepare('DELETE FROM schedules WHERE id = ?');
    $statement->execute([$id]);
    respond(['deleted' => true]);
}

respond(['error' => 'Method tidak diizinkan.'], 405);