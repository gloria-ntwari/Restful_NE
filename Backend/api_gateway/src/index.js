const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Note: express.json() and express.urlencoded() are omitted here to allow raw request streams to flow directly to the proxied microservices.

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PARKING_SERVICE = process.env.PARKING_SERVICE_URL || 'http://localhost:3002';
const ENTRY_SERVICE = process.env.ENTRY_SERVICE_URL || 'http://localhost:3003';
const BILLING_SERVICE = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';
const REPORT_SERVICE = process.env.REPORT_SERVICE_URL || 'http://localhost:3005';

// pathFilter keeps the full path (e.g. /api/auth/login) when forwarding to microservices.
// Do NOT use app.use('/api/auth', proxy) — Express strips the mount path and breaks routing.
const createServiceProxy = (target, pathFilter) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
  });

app.use(createServiceProxy(AUTH_SERVICE, '/api/auth'));
app.use(createServiceProxy(PARKING_SERVICE, '/api/parkings'));
app.use(createServiceProxy(ENTRY_SERVICE, '/api/entries'));
app.use(createServiceProxy(BILLING_SERVICE, '/api/bills'));
app.use(createServiceProxy(REPORT_SERVICE, '/api/reports'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`   Auth Service    -> ${AUTH_SERVICE}`);
  console.log(`   Parking Service -> ${PARKING_SERVICE}`);
  console.log(`   Entry Service   -> ${ENTRY_SERVICE}`);
  console.log(`   Billing Service -> ${BILLING_SERVICE}`);
  console.log(`   Report Service  -> ${REPORT_SERVICE}`);
});

module.exports = app;
