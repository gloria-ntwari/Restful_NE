-- XWZ LTD Car Parking Management System
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for re-initialization)
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS car_entries CASCADE;
DROP TABLE IF EXISTS parkings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'parking_attendant');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'parking_attendant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARKINGS TABLE
-- ============================================
CREATE TABLE parkings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    available_spaces INTEGER NOT NULL CHECK (available_spaces >= 0),
    total_spaces INTEGER NOT NULL CHECK (total_spaces > 0),
    location VARCHAR(500) NOT NULL,
    fee_per_hour DECIMAL(10, 2) NOT NULL CHECK (fee_per_hour >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CAR ENTRIES TABLE
-- ============================================
CREATE TABLE car_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) NOT NULL,
    parking_id UUID NOT NULL REFERENCES parkings(id) ON DELETE CASCADE,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    entry_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_datetime TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    charged_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BILLS TABLE
-- ============================================
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES car_entries(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) NOT NULL,
    parking_name VARCHAR(255) NOT NULL,
    parking_code VARCHAR(50) NOT NULL,
    entry_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours DECIMAL(10, 2) NOT NULL,
    fee_per_hour DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_parkings_code ON parkings(code);
CREATE INDEX idx_car_entries_parking_id ON car_entries(parking_id);
CREATE INDEX idx_car_entries_registered_by ON car_entries(registered_by);
CREATE INDEX idx_car_entries_plate_number ON car_entries(plate_number);
CREATE INDEX idx_car_entries_entry_datetime ON car_entries(entry_datetime);
CREATE INDEX idx_car_entries_exit_datetime ON car_entries(exit_datetime);
CREATE INDEX idx_bills_entry_id ON bills(entry_id);

-- Insert a default admin user (password: Admin@123)
-- The hash below is bcrypt hash of 'Admin@123'
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'User', 'admin@xwz.rw', '$2a$10$8K1p/avOqJHNPmAXh0R2GOKhJzQEO0b9eSjI7RmKk5aJDOmGcVwYm', 'admin');

SELECT 'Database initialized successfully!' AS status;
