# XWZ Parking Management System - Run Instructions

This project is built with a microservices architecture. Follow these steps to run the entire system.

## 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432`.
Run the initialization script (if not already done):
```bash
psql -U postgres -d car_parking -f Backend/init.sql
```
*Note: Default password set in `.env` files is `gloria_2007`.*

## 2. Recommended Launch (One Command)
You can start all 6 backend services and the frontend simultaneously using the root launcher:
```bash
npm run dev
```
This will open all processes in a single terminal with color-coded labels.

## 3. Alternative: Manual Launch
If you prefer running them separately (each in its own terminal):

- **API Gateway (3000):** `cd Backend/api_gateway && npm run dev`
- **Auth Service (3001):** `cd Backend/auth_service && npm run dev`
- **Parking Service (3002):** `cd Backend/packing_service && npm run dev`
- **Entry Service (3003):** `cd Backend/entry_service && npm run dev`
- **Billing Service (3004):** `cd Backend/billing_service && npm run dev`
- **Report Service (3005):** `cd Backend/report_service && npm run dev`
- **Frontend:** `cd frontend && npm run dev`

## 4. Default Credentials
- **Admin Email:** `admin@xwz.rw`
- **Admin Password:** `Admin@123`

## Features
- **Modern UI:** Premium glassmorphism design with Tailwind CSS.
- **Microservices:** Independent scaling and deployment.
- **PostgreSQL:** Reliable data storage with raw SQL (no ORM).
- **Authentication:** JWT-based secure auth with roles.
- **Reporting:** Traffic and Revenue reports with date filters.
- **Operational:** Easy car entry/exit with ticket and bill generation.
