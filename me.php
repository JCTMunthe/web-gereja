<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
respond(['authenticated' => !empty($_SESSION['admin_id']), 'email' => $_SESSION['admin_email'] ?? null]);