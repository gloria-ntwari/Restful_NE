-- Run on existing databases: psql -d your_db -f add_registered_by_to_car_entries.sql
ALTER TABLE car_entries
  ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_car_entries_registered_by ON car_entries(registered_by);
