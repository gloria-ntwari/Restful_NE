const pool = require('../db');

// Report: Outgoing cars with total amount charged between two dates
const getOutgoingReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Both start and end date-time parameters are required. Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss',
      });
    }

    // Count total items
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM car_entries ce
       JOIN parkings p ON ce.parking_id = p.id
       WHERE ce.exit_datetime IS NOT NULL
       AND ce.exit_datetime BETWEEN $1 AND $2`,
      [start, end]
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Get total amount
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(charged_amount), 0) as total_charged
       FROM car_entries
       WHERE exit_datetime IS NOT NULL
       AND exit_datetime BETWEEN $1 AND $2`,
      [start, end]
    );
    const totalCharged = parseFloat(totalResult.rows[0].total_charged);

    // Get detailed records
    const result = await pool.query(
      `SELECT ce.id, ce.plate_number, ce.entry_datetime, ce.exit_datetime, ce.charged_amount,
              p.name as parking_name, p.code as parking_code, p.location as parking_location
       FROM car_entries ce
       JOIN parkings p ON ce.parking_id = p.id
       WHERE ce.exit_datetime IS NOT NULL
       AND ce.exit_datetime BETWEEN $1 AND $2
       ORDER BY ce.exit_datetime DESC
       LIMIT $3 OFFSET $4`,
      [start, end, limit, offset]
    );

    res.status(200).json({
      success: true,
      report: 'Outgoing Cars Report',
      dateRange: { start, end },
      totalCharged,
      data: result.rows.map((r) => ({
        id: r.id,
        plateNumber: r.plate_number,
        parkingName: r.parking_name,
        parkingCode: r.parking_code,
        parkingLocation: r.parking_location,
        entryDatetime: r.entry_datetime,
        exitDatetime: r.exit_datetime,
        chargedAmount: parseFloat(r.charged_amount),
      })),
      pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit },
    });
  } catch (err) {
    console.error('Outgoing report error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Report: Entered cars between two dates
const getEntriesReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Both start and end date-time parameters are required. Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss',
      });
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM car_entries ce
       JOIN parkings p ON ce.parking_id = p.id
       WHERE ce.entry_datetime BETWEEN $1 AND $2`,
      [start, end]
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      `SELECT ce.id, ce.plate_number, ce.entry_datetime, ce.exit_datetime, ce.charged_amount,
              p.name as parking_name, p.code as parking_code, p.location as parking_location
       FROM car_entries ce
       JOIN parkings p ON ce.parking_id = p.id
       WHERE ce.entry_datetime BETWEEN $1 AND $2
       ORDER BY ce.entry_datetime DESC
       LIMIT $3 OFFSET $4`,
      [start, end, limit, offset]
    );

    res.status(200).json({
      success: true,
      report: 'Entered Cars Report',
      dateRange: { start, end },
      totalEntries: totalItems,
      data: result.rows.map((r) => ({
        id: r.id,
        plateNumber: r.plate_number,
        parkingName: r.parking_name,
        parkingCode: r.parking_code,
        parkingLocation: r.parking_location,
        entryDatetime: r.entry_datetime,
        exitDatetime: r.exit_datetime,
        chargedAmount: parseFloat(r.charged_amount),
        status: r.exit_datetime ? 'EXITED' : 'PARKED',
      })),
      pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit },
    });
  } catch (err) {
    console.error('Entries report error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getOutgoingReport, getEntriesReport };
