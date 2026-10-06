<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
$_SESSION = [];
session_destroy();
respond(['authenticated' => false]);