const express = require('express');
const router = express.Router();
const { createParking, getAllParkings, getParkingById, updateParking, deleteParking } = require('../controllers/parking.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { parkingSchema, updateParkingSchema, validate } = require('../validators');

/**
 * @swagger
 * components:
 *   schemas:
 *     Parking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         availableSpaces:
 *           type: integer
 *         totalSpaces:
 *           type: integer
 *         location:
 *           type: string
 *         feePerHour:
 *           type: number
 *     CreateParkingRequest:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - availableSpaces
 *         - location
 *         - feePerHour
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         availableSpaces:
 *           type: integer
 *         location:
 *           type: string
 *         feePerHour:
 *           type: number
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/parkings:
 *   post:
 *     summary: Register a new parking (admin only)
 *     tags: [Parkings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParkingRequest'
 *     responses:
 *       201:
 *         description: Parking created
 *       409:
 *         description: Parking code already exists
 */
router.post('/', authenticateToken, authorizeRoles('admin'), validate(parkingSchema), createParking);

/**
 * @swagger
 * /api/parkings:
 *   get:
 *     summary: Get all parkings with pagination
 *     tags: [Parkings]
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
 *         description: List of parkings
 */
router.get('/', authenticateToken, getAllParkings);

/**
 * @swagger
 * /api/parkings/{id}:
 *   get:
 *     summary: Get a parking by ID
 *     tags: [Parkings]
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
 *         description: Parking details
 *       404:
 *         description: Parking not found
 */
router.get('/:id', authenticateToken, getParkingById);

/**
 * @swagger
 * /api/parkings/{id}:
 *   put:
 *     summary: Update a parking (admin only)
 *     tags: [Parkings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParkingRequest'
 *     responses:
 *       200:
 *         description: Parking updated
 *       404:
 *         description: Parking not found
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), validate(updateParkingSchema), updateParking);

/**
 * @swagger
 * /api/parkings/{id}:
 *   delete:
 *     summary: Delete a parking (admin only)
 *     tags: [Parkings]
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
 *         description: Parking deleted
 *       404:
 *         description: Parking not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteParking);

module.exports = router;
