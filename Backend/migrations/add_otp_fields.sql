-- Migration: Add OTP and verification fields to the users table
-- Run using: psql -U postgres -d car_parking -f add_otp_fields.sql

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Ensure default admin is verified
UPDATE users 
  SET is_verified = TRUE 
  WHERE email = 'admin@xwz.rw' OR role = 'admin';

CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
