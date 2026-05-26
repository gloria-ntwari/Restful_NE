const pool = require('../db');

// Create a new parking
const createParking = async (req, res) => {
  try {
    const { code, name, availableSpaces, location, feePerHour } = req.body;

    // Check if parking code already exists
    const existing = await pool.query('SELECT id FROM parkings WHERE code = $1', [code]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Parking with this code already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO parkings (code, name, available_spaces, total_spaces, location, fee_per_hour)
       VALUES ($1, $2, $3, $3, $4, $5)
       RETURNING *`,
      [code, name, availableSpaces, location, feePerHour]
    );

    const p = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Parking registered successfully.',
      data: {
        id: p.id, code: p.code, name: p.name,
        availableSpaces: p.available_spaces, totalSpaces: p.total_spaces,
        location: p.location, feePerHour: parseFloat(p.fee_per_hour),
        createdAt: p.created_at,
      },
    });
  } catch (err) {
    console.error('Create parking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get all parkings with pagination
const getAllParkings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM parkings');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT * FROM parkings ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((p) => ({
        id: p.id, code: p.code, name: p.name,
        availableSpaces: p.available_spaces, totalSpaces: p.total_spaces,
        location: p.location, feePerHour: parseFloat(p.fee_per_hour),
        createdAt: p.created_at,
      })),
      pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit },
    });
  } catch (err) {
    console.error('Get parkings error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get a single parking by ID
const getParkingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parkings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parking not found.' });
    }

    const p = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        id: p.id, code: p.code, name: p.name,
        availableSpaces: p.available_spaces, totalSpaces: p.total_spaces,
        location: p.location, feePerHour: parseFloat(p.fee_per_hour),
        createdAt: p.created_at,
      },
    });
  } catch (err) {
    console.error('Get parking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Update a parking
const updateParking = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, availableSpaces, location, feePerHour } = req.body;

    const existing = await pool.query('SELECT * FROM parkings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parking not found.' });
    }

    const result = await pool.query(
      `UPDATE parkings SET code = COALESCE($1, code), name = COALESCE($2, name),
       available_spaces = COALESCE($3, available_spaces), location = COALESCE($4, location),
       fee_per_hour = COALESCE($5, fee_per_hour), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [code, name, availableSpaces, location, feePerHour, id]
    );

    const p = result.rows[0];
    res.status(200).json({
      success: true,
      message: 'Parking updated successfully.',
      data: {
        id: p.id, code: p.code, name: p.name,
        availableSpaces: p.available_spaces, totalSpaces: p.total_spaces,
        location: p.location, feePerHour: parseFloat(p.fee_per_hour),
        updatedAt: p.updated_at,
      },
    });
  } catch (err) {
    console.error('Update parking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete a parking
const deleteParking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM parkings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parking not found.' });
    }

    res.status(200).json({ success: true, message: 'Parking deleted successfully.' });
  } catch (err) {
    console.error('Delete parking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { createParking, getAllParkings, getParkingById, updateParking, deleteParking };
