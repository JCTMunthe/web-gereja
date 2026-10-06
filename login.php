<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method tidak diizinkan.'], 405);
}

$body = request_body();
$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($email === '' || $password === '') {
    respond(['error' => 'Email dan password wajib diisi.'], 422);
}

$statement = db()->prepare('SELECT id, email, password_hash FROM admins WHERE email = ? AND active = 1 LIMIT 1');
$statement->execute([$email]);
$admin = $statement->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    respond(['error' => 'Email atau password salah.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int)$admin['id'];
$_SESSION['admin_email'] = $admin['email'];
respond(['authenticated' => true, 'email' => $admin['email']]);