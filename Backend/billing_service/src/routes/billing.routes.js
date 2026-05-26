const express = require('express');
const router = express.Router();
const { getBillByEntry, getAllBills } = require('../controllers/billing.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Bill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         entryId:
 *           type: string
 *           format: uuid
 *         plateNumber:
 *           type: string
 *         parkingName:
 *           type: string
 *         parkingCode:
 *           type: string
 *         entryDatetime:
 *           type: string
 *           format: date-time
 *         exitDatetime:
 *           type: string
 *           format: date-time
 *         durationHours:
 *           type: number
 *         feePerHour:
 *           type: number
 *         totalAmount:
 *           type: number
 *         generatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Get all bills with pagination
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of bills
 */
router.get('/', authenticateToken, getAllBills);

/**
 * @swagger
 * /api/bills/{entryId}:
 *   get:
 *     summary: Get bill for a specific car entry
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Bill details
 *       404:
 *         description: Bill not found
 */
router.get('/:entryId', authenticateToken, getBillByEntry);

module.exports = router;
