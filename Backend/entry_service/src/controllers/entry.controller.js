const pool = require('../db');

const isAdmin = (user) => user?.role === 'admin';

const canAccessEntry = (entry, user) =>
  isAdmin(user) || entry.registered_by === user.id;

// Register car entry
const createEntry = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { plateNumber, parkingId } = req.body;

    // Check parking exists and has space
    const parkingResult = await client.query('SELECT * FROM parkings WHERE id = $1', [parkingId]);
    if (parkingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Parking not found.' });
    }

    const parking = parkingResult.rows[0];
    if (parking.available_spaces <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'No available spaces in this parking.' });
    }

    // Create entry
    const entryResult = await client.query(
      `INSERT INTO car_entries (plate_number, parking_id, registered_by, entry_datetime)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [plateNumber, parkingId, req.user.id]
    );

    // Decrement available spaces
    await client.query(
      'UPDATE parkings SET available_spaces = available_spaces - 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [parkingId]
    );

    await client.query('COMMIT');

    const entry = entryResult.rows[0];
    // Generate ticket
    const ticket = {
      ticketNumber: `TKT-${entry.id.substring(0, 8).toUpperCase()}`,
      plateNumber: entry.plate_number,
      parkingName: parking.name,
      parkingCode: parking.code,
      location: parking.location,
      entryDateTime: entry.entry_datetime,
      feePerHour: parseFloat(parking.fee_per_hour),
      message: 'Welcome! Please keep this ticket for exit.',
    };

    res.status(201).json({
      success: true,
      message: 'Car entry registered successfully.',
      data: {
        id: entry.id,
        plateNumber: entry.plate_number,
        parkingId: entry.parking_id,
        entryDatetime: entry.entry_datetime,
        exitDatetime: entry.exit_datetime,
        chargedAmount: parseFloat(entry.charged_amount),
      },
      ticket,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create entry error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// Register car exit
const exitCar = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Get entry
    const entryResult = await client.query('SELECT * FROM car_entries WHERE id = $1', [id]);
    if (entryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Car entry not found.' });
    }

    const entry = entryResult.rows[0];
    if (!canAccessEntry(entry, req.user)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'You can only exit entries you registered.' });
    }

    if (entry.exit_datetime) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Car has already exited.' });
    }

    // Get parking to calculate fee
    const parkingResult = await client.query('SELECT * FROM parkings WHERE id = $1', [entry.parking_id]);
    const parking = parkingResult.rows[0];

    // Calculate duration in hours and charged amount
    const exitTime = new Date();
    const entryTime = new Date(entry.entry_datetime);
    const durationMs = exitTime - entryTime;
    const durationHours = Math.max(Math.ceil(durationMs / (1000 * 60 * 60)), 1); // minimum 1 hour
    const chargedAmount = durationHours * parseFloat(parking.fee_per_hour);

    // Update entry
    const updatedEntry = await client.query(
      `UPDATE car_entries SET exit_datetime = CURRENT_TIMESTAMP, charged_amount = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [chargedAmount, id]
    );

    // Increment available spaces
    await client.query(
      'UPDATE parkings SET available_spaces = available_spaces + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [entry.parking_id]
    );

    // Create bill
    const billResult = await client.query(
      `INSERT INTO bills (entry_id, plate_number, parking_name, parking_code, entry_datetime, exit_datetime, duration_hours, fee_per_hour, total_amount)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8)
       RETURNING *`,
      [id, entry.plate_number, parking.name, parking.code, entry.entry_datetime, durationHours, parseFloat(parking.fee_per_hour), chargedAmount]
    );

    await client.query('COMMIT');

    const updated = updatedEntry.rows[0];
    const bill = billResult.rows[0];

    res.status(200).json({
      success: true,
      message: 'Car exit registered successfully.',
      data: {
        id: updated.id,
        plateNumber: updated.plate_number,
        parkingId: updated.parking_id,
        entryDatetime: updated.entry_datetime,
        exitDatetime: updated.exit_datetime,
        chargedAmount: parseFloat(updated.charged_amount),
      },
      bill: {
        id: bill.id,
        plateNumber: bill.plate_number,
        parkingName: bill.parking_name,
        parkingCode: bill.parking_code,
        entryDatetime: bill.entry_datetime,
        exitDatetime: bill.exit_datetime,
        durationHours: parseFloat(bill.duration_hours),
        feePerHour: parseFloat(bill.fee_per_hour),
        totalAmount: parseFloat(bill.total_amount),
        generatedAt: bill.generated_at,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Exit car error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// Get all entries with pagination (attendants see only their own)
const getAllEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const admin = isAdmin(req.user);

    const whereClause = admin ? '' : 'WHERE ce.registered_by = $1';
    const countParams = admin ? [] : [req.user.id];
    const listParams = admin ? [limit, offset] : [req.user.id, limit, offset];

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM car_entries ce ${whereClause}`,
      countParams
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      `SELECT ce.*, p.name as parking_name, p.code as parking_code, p.location as parking_location
       FROM car_entries ce
       JOIN parkings p ON ce.parking_id = p.id
       ${whereClause}
       ORDER BY ce.entry_datetime DESC LIMIT ${admin ? '$1' : '$2'} OFFSET ${admin ? '$2' : '$3'}`,
      listParams
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((e) => ({
        id: e.id,
        plateNumber: e.plate_number,
        parkingId: e.parking_id,
        parkingName: e.parking_name,
        parkingCode: e.parking_code,
        parkingLocation: e.parking_location,
        entryDatetime: e.entry_datetime,
        exitDatetime: e.exit_datetime,
        chargedAmount: parseFloat(e.charged_amount),
      })),
      pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit },
    });
  } catch (err) {
    console.error('Get entries error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get entry ticket
const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ce.*, p.name as parking_name, p.code as parking_code, p.location, p.fee_per_hour
       FROM car_entries ce JOIN parkings p ON ce.parking_id = p.id
       WHERE ce.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    const e = result.rows[0];
    if (!canAccessEntry(e, req.user)) {
      return res.status(403).json({ success: false, message: 'You can only view tickets for your own entries.' });
    }

    res.status(200).json({
      success: true,
      data: {
        ticketNumber: `TKT-${e.id.substring(0, 8).toUpperCase()}`,
        plateNumber: e.plate_number,
        parkingName: e.parking_name,
        parkingCode: e.parking_code,
        location: e.location,
        entryDateTime: e.entry_datetime,
        exitDateTime: e.exit_datetime,
        feePerHour: parseFloat(e.fee_per_hour),
        chargedAmount: parseFloat(e.charged_amount),
        status: e.exit_datetime ? 'EXITED' : 'PARKED',
      },
    });
  } catch (err) {
    console.error('Get ticket error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { createEntry, exitCar, getAllEntries, getTicket };
