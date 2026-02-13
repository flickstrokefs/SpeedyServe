-- Create reservations table for SeatScout
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  seat_id VARCHAR(255) NOT NULL,
  library_name VARCHAR(255) NOT NULL,
  floor_number VARCHAR(10) NOT NULL,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'reserved' CHECK (status IN ('reserved', 'checked_in', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_seat_id ON reservations(seat_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO reservations (user_id, seat_id, library_name, floor_number, status, expires_at) VALUES
('user123', 'Central Library-Floor1-Seat01', 'Central Library', '1', 'reserved', NOW() + INTERVAL '10 minutes'),
('user456', 'Law School Library-Floor2-Seat05', 'Law School Library', '2', 'checked_in', NOW() + INTERVAL '2 hours'),
('user789', 'Business School Library-Floor1-Seat12', 'Business School Library', '1', 'expired', NOW() - INTERVAL '5 minutes');

