-- =========================================================
-- DATABASE PROJECT MALANGVENTURE
-- Sistem Pemesanan Paket Wisata dan Rental Mobil
-- MySQL 8.0+ / MariaDB 10.4+
-- =========================================================

CREATE DATABASE IF NOT EXISTS db_malangventure
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_malangventure;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS package_destinations;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS tour_packages;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Akun pelanggan dan admin
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NULL UNIQUE,
    phone VARCHAR(20) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    account_status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
) ENGINE=InnoDB;

-- 2. Paket wisata yang ditawarkan
CREATE TABLE tour_packages (
    package_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    duration_days TINYINT UNSIGNED NOT NULL DEFAULT 1,
    price_per_person DECIMAL(12,2) NOT NULL,
    min_participants SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    max_participants SMALLINT UNSIGNED NULL,
    package_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_status (package_status)
) ENGINE=InnoDB;

-- 3. Destinasi wisata
CREATE TABLE destinations (
    destination_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    destination_name VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL DEFAULT 'Malang',
    address VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relasi many-to-many paket wisata dan destinasi
CREATE TABLE package_destinations (
    package_id BIGINT UNSIGNED NOT NULL,
    destination_id BIGINT UNSIGNED NOT NULL,
    visit_order TINYINT UNSIGNED NOT NULL DEFAULT 1,
    visit_duration_hours DECIMAL(4,1) NULL,
    PRIMARY KEY (package_id, destination_id),
    CONSTRAINT fk_pd_package FOREIGN KEY (package_id)
        REFERENCES tour_packages(package_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pd_destination FOREIGN KEY (destination_id)
        REFERENCES destinations(destination_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Armada rental mobil
CREATE TABLE vehicles (
    vehicle_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_name VARCHAR(120) NOT NULL,
    brand VARCHAR(80) NULL,
    vehicle_type VARCHAR(60) NOT NULL,
    plate_number VARCHAR(15) NOT NULL UNIQUE,
    capacity TINYINT UNSIGNED NOT NULL,
    transmission ENUM('manual','automatic') NULL,
    price_per_day DECIMAL(12,2) NOT NULL,
    vehicle_status ENUM('available','rented','maintenance','inactive') NOT NULL DEFAULT 'available',
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicle_availability (vehicle_status, vehicle_type)
) ENGINE=InnoDB;

-- 5. Transaksi pemesanan paket wisata atau rental mobil
CREATE TABLE bookings (
    booking_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    service_type ENUM('paket_wisata','rental_mobil') NOT NULL,
    package_id BIGINT UNSIGNED NULL,
    vehicle_id BIGINT UNSIGNED NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date DATETIME NOT NULL,
    end_date DATETIME NULL,
    pickup_location VARCHAR(255) NULL,
    participant_count SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    customer_note TEXT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(14,2) NOT NULL,
    booking_status ENUM('pending','confirmed','paid','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_booking_package FOREIGN KEY (package_id)
        REFERENCES tour_packages(package_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_booking_user_date (user_id, booking_date),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_schedule (start_date, end_date)
) ENGINE=InnoDB;

-- 6. Pembayaran untuk transaksi
CREATE TABLE payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    payment_code VARCHAR(40) NOT NULL UNIQUE,
    payment_date DATETIME NULL,
    amount DECIMAL(14,2) NOT NULL,
    payment_method ENUM('transfer_bank','e_wallet','qris','cash') NOT NULL,
    payment_status ENUM('unpaid','waiting_verification','verified','rejected','refunded') NOT NULL DEFAULT 'unpaid',
    proof_of_payment VARCHAR(255) NULL,
    verified_by BIGINT UNSIGNED NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payment_verifier FOREIGN KEY (verified_by)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB;

-- DATA AWAL CONTOH (opsional untuk pengujian)
INSERT INTO destinations (destination_name, city, address) VALUES
('Gunung Bromo','Probolinggo','Kawasan Taman Nasional Bromo Tengger Semeru'),
('Jatim Park 2','Batu','Jl. Oro-Oro Ombo, Kota Batu'),
('Museum Angkut','Batu','Jl. Terusan Sultan Agung, Kota Batu'),
('Kampung Warna-Warni Jodipan','Malang','Kelurahan Jodipan, Kota Malang');

INSERT INTO tour_packages (package_name, description, duration_days, price_per_person, min_participants, max_participants) VALUES
('Explore Bromo Sunrise','Paket wisata sunrise Gunung Bromo',1,450000,1,15),
('Malang-Batu City Tour','Wisata pilihan di Kota Malang dan Kota Batu',2,850000,1,12);

INSERT INTO package_destinations (package_id,destination_id,visit_order) VALUES
(1,1,1),(2,4,1),(2,2,2),(2,3,3);

INSERT INTO vehicles (vehicle_name,brand,vehicle_type,plate_number,capacity,transmission,price_per_day,vehicle_status,description) VALUES
('Toyota Avanza','Toyota','MPV','N 1201 MV',6,'automatic',450000,'available','Kendaraan keluarga'),
('Mitsubishi Xpander','Mitsubishi','MPV','N 1202 MV',7,'automatic',550000,'available','MPV untuk perjalanan wisata'),
('Toyota Hiace','Toyota','Minibus','N 1203 MV',14,'manual',1200000,'available','Kendaraan rombongan');

-- CATATAN KEAMANAN:
-- Buat akun melalui aplikasi dengan password_hash() PHP.
-- Jangan menyimpan password dalam bentuk teks biasa.
