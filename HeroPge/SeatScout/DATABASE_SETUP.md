# Database Setup for SeatScout

This document explains how to set up the Supabase database for the SeatScout application.

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase SQL Editor

## Database Setup

### 1. Create the Reservations Table

Run the SQL script in `supabase_reservations_table.sql` in your Supabase SQL Editor:

```sql
-- The complete SQL script is in supabase_reservations_table.sql
```

### 2. Table Structure

The `reservations` table has the following structure:

- `id`: Primary key (auto-increment)
- `user_id`: User identifier (VARCHAR)
- `seat_id`: Unique seat identifier (VARCHAR)
- `library_name`: Name of the library (VARCHAR)
- `floor_number`: Floor number (VARCHAR)
- `reserved_at`: Timestamp when reservation was made
- `status`: Reservation status ('reserved', 'checked_in', 'expired', 'cancelled')
- `expires_at`: Timestamp when reservation expires
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

### 3. Indexes

The following indexes are created for optimal performance:
- `idx_reservations_user_id`: For user-based queries
- `idx_reservations_seat_id`: For seat-based queries
- `idx_reservations_status`: For status-based queries
- `idx_reservations_expires_at`: For expiry-based queries

### 4. Triggers

An automatic trigger updates the `updated_at` column whenever a record is modified.

## Usage in the Application

The application uses the following Supabase operations:

### Creating a Reservation

```typescript
const { data, error } = await supabase
  .from('reservations')
  .insert([
    {
      user_id: 'user123',
      seat_id: 'Central Library-Floor1-Seat01',
      library_name: 'Central Library',
      floor_number: '1',
      reserved_at: new Date().toISOString(),
      status: 'reserved',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
  ]);
```

### Updating Reservation Status

```typescript
const { error } = await supabase
  .from('reservations')
  .update({ status: 'checked_in' })
  .eq('id', reservationId);
```

### Querying Reservations

```typescript
const { data, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'reserved');
```

## Environment Variables

Make sure your Supabase configuration is properly set in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

## Testing

After setting up the database, you can test the reservation flow:

1. Book a seat through the UI
2. Check the `reservations` table in Supabase to see the new record
3. Check in using the "I'm Here" button
4. Verify the status updates to 'checked_in'
5. Wait for the timer to expire or manually update status to 'expired'

## Troubleshooting

- Ensure your Supabase project has the correct RLS (Row Level Security) policies
- Check that the `reservations` table has the correct permissions
- Verify that the Supabase URL and API key are correct
- Check the browser console for any error messages

