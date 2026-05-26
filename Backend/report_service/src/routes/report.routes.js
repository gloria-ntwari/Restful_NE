const express = require('express');
const router = express.Router();
const { getOutgoingReport, getEntriesReport } = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/reports/outgoing:
 *   get:
 *     summary: Get outgoing cars report with total charged between two dates
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date-time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Outgoing cars report with total charged amount
 *       400:
 *         description: Missing date parameters
 */
router.get('/outgoing', authenticateToken, getOutgoingReport);

/**
 * @swagger
 * /api/reports/entries:
 *   get:
 *     summary: Get entered cars report between two dates
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date-time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Entered cars report
 *       400:
 *         description: Missing date parameters
 */
router.get('/entries', authenticateToken, getEntriesReport);

module.exports = router;
