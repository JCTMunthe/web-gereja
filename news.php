<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = db()->query('SELECT id, title, published_at, file_url FROM news WHERE published = 1 ORDER BY published_at DESC LIMIT 20');
    respond(['data' => $statement->fetchAll()]);
}

require_admin();
$body = request_body();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $statement = db()->prepare('INSERT INTO news (title, published_at, file_url) VALUES (?, ?, ?)');
    $statement->execute([trim((string)($body['title'] ?? '')), $body['published_at'] ?? date('Y-m-d'), trim((string)($body['file_url'] ?? '')) ?: null]);
    respond(['id' => (int)db()->lastInsertId()], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $statement = db()->prepare('DELETE FROM news WHERE id = ?');
    $statement->execute([$id]);
    respond(['deleted' => true]);
}

respond(['error' => 'Method tidak diizinkan.'], 405);