<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'db_malangventure';
try {
    $koneksi = new mysqli($host, $user, $pass, $db);
    $koneksi->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    die('Koneksi database gagal. Pastikan MySQL Laragon aktif dan database db_malangventure sudah di-import. Detail: ' . htmlspecialchars($e->getMessage()));
}
