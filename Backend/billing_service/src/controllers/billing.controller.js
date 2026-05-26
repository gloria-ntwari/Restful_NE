const pool = require('../db');

// Get bill for a specific entry
const getBillByEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const result = await pool.query('SELECT * FROM bills WHERE entry_id = $1', [entryId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found for this entry.' });
    }

    const b = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        id: b.id,
        entryId: b.entry_id,
        plateNumber: b.plate_number,
        parkingName: b.parking_name,
        parkingCode: b.parking_code,
        entryDatetime: b.entry_datetime,
        exitDatetime: b.exit_datetime,
        durationHours: parseFloat(b.duration_hours),
        feePerHour: parseFloat(b.fee_per_hour),
        totalAmount: parseFloat(b.total_amount),
        generatedAt: b.generated_at,
      },
    });
  } catch (err) {
    console.error('Get bill error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get all bills with pagination
const getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM bills');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT * FROM bills ORDER BY generated_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((b) => ({
        id: b.id,
        entryId: b.entry_id,
        plateNumber: b.plate_number,
        parkingName: b.parking_name,
        parkingCode: b.parking_code,
        entryDatetime: b.entry_datetime,
        exitDatetime: b.exit_datetime,
        durationHours: parseFloat(b.duration_hours),
        feePerHour: parseFloat(b.fee_per_hour),
        totalAmount: parseFloat(b.total_amount),
        generatedAt: b.generated_at,
      })),
      pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit },
    });
  } catch (err) {
    console.error('Get bills error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getBillByEntry, getAllBills };
