<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$action = $_POST['action'] ?? '';
$name = trim($_POST['name'] ?? '');
$contact = trim($_POST['contact'] ?? '');
$password = (string)($_POST['password'] ?? '');
if ($action === 'register') {
    if ($name === '' || $contact === '' || strlen($password) < 8) {
        http_response_code(422);
        echo json_encode(['ok'=>false,'message'=>'Lengkapi data dan gunakan kata sandi minimal 8 karakter.']); exit;
    }
    $_SESSION['registered_users'][$contact] = ['name'=>$name, 'password'=>password_hash($password, PASSWORD_DEFAULT)];
    $_SESSION['registration_success'] = true;
    echo json_encode(['ok'=>true,'message'=>'Pendaftaran berhasil. Silakan login.','redirect'=>'registrasi.php?mode=login']); exit;
}
if ($action === 'login_user') {
    $user = $_SESSION['registered_users'][$contact] ?? null;
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['ok'=>false,'message'=>'Akun tidak ditemukan atau kata sandi salah. Silakan registrasi terlebih dahulu.']); exit;
    }
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_contact'] = $contact;
    echo json_encode(['ok'=>true,'message'=>'Login berhasil!','redirect'=>'index.php']); exit;
}
if ($action === 'login_admin') {
    if ($contact === '' || $password === '') {
        http_response_code(422); echo json_encode(['ok'=>false,'message'=>'ID Admin dan kata sandi wajib diisi.']); exit;
    }
    // Simulasi autentikasi admin untuk praktikum; ganti dengan verifikasi database untuk produksi.
    $_SESSION['admin_name'] = $contact;
    echo json_encode(['ok'=>true,'message'=>'Admin berhasil login!','redirect'=>'admin.php']); exit;
}
http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Permintaan tidak dikenali.']);
