<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'gpib_cipeucang';
const DB_USER = 'root';
const DB_PASS = '';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function request_body(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function require_admin(): void
{
    if (empty($_SESSION['admin_id'])) {
        respond(['error' => 'Akses admin diperlukan.'], 401);
    }
}