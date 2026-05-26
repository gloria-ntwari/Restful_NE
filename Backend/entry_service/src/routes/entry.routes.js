const express = require('express');
const router = express.Router();
const { createEntry, exitCar, getAllEntries, getTicket } = require('../controllers/entry.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { entrySchema, validate } = require('../validators');

/**
 * @swagger
 * components:
 *   schemas:
 *     CarEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         plateNumber:
 *           type: string
 *         parkingId:
 *           type: string
 *           format: uuid
 *         entryDatetime:
 *           type: string
 *           format: date-time
 *         exitDatetime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         chargedAmount:
 *           type: number
 *     CreateEntryRequest:
 *       type: object
 *       required:
 *         - plateNumber
 *         - parkingId
 *       properties:
 *         plateNumber:
 *           type: string
 *         parkingId:
 *           type: string
 *           format: uuid
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/entries:
 *   post:
 *     summary: Register car entry
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEntryRequest'
 *     responses:
 *       201:
 *         description: Car entry registered with ticket
 *       400:
 *         description: No available spaces
 *       404:
 *         description: Parking not found
 */
router.post('/', authenticateToken, validate(entrySchema), createEntry);

/**
 * @swagger
 * /api/entries:
 *   get:
 *     summary: Get all car entries with pagination
 *     tags: [Car Entries]
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
 *         description: List of car entries
 */
router.get('/', authenticateToken, getAllEntries);

/**
 * @swagger
 * /api/entries/{id}/ticket:
 *   get:
 *     summary: Get entry ticket
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Entry ticket
 *       404:
 *         description: Entry not found
 */
router.get('/:id/ticket', authenticateToken, getTicket);

/**
 * @swagger
 * /api/entries/{id}/exit:
 *   put:
 *     summary: Register car exit - calculates charge and generates bill
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Car exit registered with bill
 *       400:
 *         description: Car already exited
 *       404:
 *         description: Entry not found
 */
router.put('/:id/exit', authenticateToken, exitCar);

module.exports = router;
