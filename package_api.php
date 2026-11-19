<?php
require_once __DIR__ . '/koneksi.php';
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['admin_id'])) { http_response_code(401); echo json_encode(['ok'=>false,'message'=>'Silakan login sebagai admin.']); exit; }
function out($ok,$data=null,$message='') { echo json_encode(['ok'=>$ok,'data'=>$data,'message'=>$message]); exit; }
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $result = $koneksi->query('SELECT package_id,package_name,description,duration_days,price_per_person,min_participants,max_participants,package_status FROM tour_packages ORDER BY package_id DESC');
    out(true, $result->fetch_all(MYSQLI_ASSOC));
}
$action = $_POST['action'] ?? '';
if ($action === 'delete') {
    $id = filter_input(INPUT_POST, 'package_id', FILTER_VALIDATE_INT);
    if (!$id) { http_response_code(422); out(false,null,'ID paket tidak valid.'); }
    $stmt=$koneksi->prepare('DELETE FROM tour_packages WHERE package_id=?');
    $stmt->bind_param('i',$id); $stmt->execute();
    out(true,null,'Paket wisata berhasil dihapus.');
}
$name=trim($_POST['package_name']??'');
$desc=trim($_POST['description']??'');
$duration=(int)($_POST['duration_days']??0);
$price=(float)($_POST['price_per_person']??0);
$min=(int)($_POST['min_participants']??1);
$max=($_POST['max_participants']??'')===''?null:(int)$_POST['max_participants'];
$status=($_POST['package_status']??'active')==='inactive'?'inactive':'active';
if ($name==='' || $duration<1 || $price<=0 || $min<1 || ($max!==null && $max<$min)) { http_response_code(422); out(false,null,'Periksa nama, durasi, harga, dan jumlah peserta.'); }
if ($action==='create') {
    $stmt=$koneksi->prepare('INSERT INTO tour_packages(package_name,description,duration_days,price_per_person,min_participants,max_participants,package_status) VALUES(?,?,?,?,?,?,?)');
    $stmt->bind_param('ssidiis', $name,$desc,$duration,$price,$min,$max,$status);
} elseif ($action==='update') {
    $id=(int)($_POST['package_id']??0);
    if(!$id){http_response_code(422);out(false,null,'ID paket tidak valid.');}
    $stmt=$koneksi->prepare('UPDATE tour_packages SET package_name=?,description=?,duration_days=?,price_per_person=?,min_participants=?,max_participants=?,package_status=? WHERE package_id=?');
    $stmt->bind_param('ssidiisi',$name,$desc,$duration,$price,$min,$max,$status,$id);
} else { http_response_code(400); out(false,null,'Aksi tidak dikenal.'); }
try { $stmt->execute(); out(true,null,$action==='create'?'Paket wisata berhasil ditambahkan.':'Paket wisata berhasil diperbarui.'); }
catch (mysqli_sql_exception $e) { http_response_code(500); out(false,null,'Gagal menyimpan paket wisata.'); }
