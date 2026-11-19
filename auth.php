<?php
require_once __DIR__ . '/koneksi.php';
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header('Content-Type: application/json; charset=utf-8');

function respond($ok, $message, $redirect = null, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok'=>$ok, 'message'=>$message, 'redirect'=>$redirect]);
    exit;
}
$action = $_POST['action'] ?? '';
$name = trim($_POST['name'] ?? '');
$contact = trim($_POST['contact'] ?? '');
$password = (string)($_POST['password'] ?? '');

if ($action === 'register') {
    if ($name === '' || $contact === '' || strlen($password) < 8) respond(false, 'Lengkapi data dan gunakan kata sandi minimal 8 karakter.', null, 422);
    $email = filter_var($contact, FILTER_VALIDATE_EMAIL) ? $contact : null;
    $phone = $email === null ? preg_replace('/[\s\-]/', '', $contact) : null;
    if ($email === null && !preg_match('/^\+?[0-9]{9,15}$/', $phone)) respond(false, 'Masukkan email valid atau nomor telepon 9–15 digit.', null, 422);
    try {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $koneksi->prepare('INSERT INTO users (full_name,email,phone,password_hash,role,account_status) VALUES (?,?,?,?,"customer","active")');
        $stmt->bind_param('ssss', $name, $email, $phone, $hash);
        $stmt->execute();
        respond(true, 'Pendaftaran berhasil. Silakan login.', 'registrasi.php?mode=login');
    } catch (mysqli_sql_exception $e) {
        if ((int)$e->getCode() === 1062) respond(false, 'Email atau nomor telepon sudah terdaftar.', null, 409);
        respond(false, 'Registrasi gagal. Periksa kembali data dan koneksi database.', null, 500);
    }
}
if ($action === 'login_user' || $action === 'login_admin') {
    if ($contact === '' || $password === '') respond(false, 'Kontak dan kata sandi wajib diisi.', null, 422);
    // Akun admin praktikum dibuat otomatis sekali jika belum ada.
    if ($action === 'login_admin') {
        $adminEmail = 'admin@malangventure.id';
        $check = $koneksi->prepare("SELECT user_id FROM users WHERE email=? AND role='admin' LIMIT 1");
        $check->bind_param('s', $adminEmail); $check->execute();
        if (!$check->get_result()->fetch_assoc()) {
            $adminHash = password_hash('Admin@12345', PASSWORD_DEFAULT);
            $ins = $koneksi->prepare("INSERT INTO users(full_name,email,password_hash,role,account_status) VALUES('Administrator MalangVenture',?,?, 'admin','active')");
            $ins->bind_param('ss', $adminEmail, $adminHash); $ins->execute();
        }
    }
    $stmt = $koneksi->prepare('SELECT user_id,full_name,email,phone,password_hash,role,account_status FROM users WHERE email=? OR phone=? LIMIT 1');
    $stmt->bind_param('ss', $contact, $contact); $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $roleNeeded = $action === 'login_admin' ? 'admin' : 'customer';
    if (!$user || $user['role'] !== $roleNeeded || $user['account_status'] !== 'active' || !password_verify($password, $user['password_hash'])) {
        respond(false, 'Akun tidak ditemukan, tidak aktif, atau kata sandi salah.', null, 401);
    }
    session_regenerate_id(true);
    if ($roleNeeded === 'admin') {
        $_SESSION['admin_id'] = (int)$user['user_id'];
        $_SESSION['admin_name'] = $user['full_name'];
        respond(true, 'Login admin berhasil.', 'admin.php');
    }
    $_SESSION['user_id'] = (int)$user['user_id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_contact'] = $user['email'] ?: $user['phone'];
    respond(true, 'Login berhasil. Selamat datang di MalangVenture.', 'index.php');
}
respond(false, 'Permintaan tidak dikenali.', null, 400);
