<?php session_start(); if (empty($_SESSION['admin_name'])) { header('Location: login.php'); exit; } ?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin Dashboard - MalangVenture</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/admin.css">
</head>
<body>
<div class="app">
  <aside class="side" id="side">
    <div class="brand">Malang<span>Venture</span></div>
    <a href="#dash" class="on"><span class="i">dashboard</span>Dashboard</a>
    <a href="#pesanan"><span class="i">receipt_long</span>Pesanan</a>
    <a href="#armada"><span class="i">directions_car</span>Armada</a>
    <a href="#wisata"><span class="i">terrain</span>Paket Wisata</a>
    <a href="#dash"><span class="i">group</span>Pelanggan</a>
    <a href="#dash"><span class="i">support_agent</span>Driver</a>
    <a href="logout.php" class="out"><span class="i">logout</span>Keluar</a>
  </aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="burger" id="burger" aria-label="Menu"><span class="i">menu</span></button>
      <h1>Operational Fleet Control<small id="date"></small><small>Admin: <?= htmlspecialchars($_SESSION["admin_name"] ?? "Admin", ENT_QUOTES, "UTF-8") ?></small></h1>
      <div class="me"><span>admin@malangventure.id</span><div class="av">A</div></div>
    </header>

    <section id="dash">
      <div class="grid stats">
        <div class="card stat"><div class="ico"><span class="i">receipt_long</span></div><div><span>Total Pesanan</span><b id="sTotal">0</b></div></div>
        <div class="card stat"><div class="ico"><span class="i">hourglass_top</span></div><div><span>Menunggu Konfirmasi</span><b id="sPend">0</b></div></div>
        <div class="card stat"><div class="ico"><span class="i">payments</span></div><div><span>Pendapatan</span><b id="sRev">Rp 0</b><i class="up">▲ 12% bulan ini</i></div></div>
        <div class="card stat"><div class="ico"><span class="i">directions_car</span></div><div><span>Armada Siap</span><b id="sFleet">0</b></div></div>
      </div>
      <div class="grid two">
        <div class="card"><h2>Pendapatan 7 Bulan Terakhir</h2><p class="sub">Dalam juta rupiah</p><div class="bars" id="bars"></div></div>
        <div class="card"><h2>Komposisi Layanan</h2><p class="sub">Berdasarkan jumlah pesanan</p>
          <div class="pie"><div class="donut"></div>
          <ul class="leg"><li style="--c:var(--sec)">Paket Wisata 52%</li><li style="--c:var(--ter)">Rental Driver 25%</li><li style="--c:var(--ok)">Lepas Kunci 23%</li></ul></div></div>
      </div>
    </section>

    <section id="pesanan" class="card" style="margin-bottom:16px">
      <div class="head"><div><h2>Kelola Pesanan</h2><p class="sub">Tambah, ubah, hapus, serta setujui atau tolak booking pelanggan.</p></div><button class="btn ok" data-a="add" data-e="orders"><span class="i">add</span>Tambah Pesanan</button></div>
      <div class="bar">
        <input class="in" id="q" placeholder="Cari kode / nama pelanggan…">
        <select class="in" id="f"><option value="">Semua Status</option><option value="pending">Menunggu</option><option value="approved">Disetujui</option><option value="done">Selesai</option><option value="cancel">Dibatalkan</option></select>
      </div>
      <div class="tw"><table>
        <thead><tr><th>Kode</th><th>Pelanggan</th><th>Layanan</th><th>Tanggal</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody id="tb"></tbody>
      </table></div>
    </section>

    <section id="armada" class="card">
      <div class="head"><div><h2>Status Armada</h2><p class="sub">Garasi Arjosari · Malang</p></div><button class="btn ok" data-a="add" data-e="fleet"><span class="i">add</span>Tambah Armada</button></div>
      <div class="grid fleet" id="fleet"></div>
    </section>

    <section id="wisata" class="card" style="margin-top:16px">
      <div class="head"><div><h2>Paket Wisata</h2><p class="sub">Kelola paket tour yang tampil di website.</p></div><button class="btn ok" data-a="add" data-e="tours"><span class="i">add</span>Tambah Paket</button></div>
      <div class="grid fleet" id="tours"></div>
    </section>
  </div>
</div>
<dialog id="dlg"></dialog>
<div class="toast" id="toast"></div>

<script src="js/admin.js"></script>
</body>
</html>
