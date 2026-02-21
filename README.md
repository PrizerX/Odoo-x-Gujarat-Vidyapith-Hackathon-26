
<img width="3204" height="573" alt="Frame_37" src="https://github.com/user-attachments/assets/db5c4b2d-0c9f-4064-a878-0abec2734598" />

# FleetFlow - Odoo x Gujarat Vidyapith Hackathon '26

> **Modular Fleet & Logistics Management System**  
> An offline-first logistics ERP that replaces manual logbooks with strict business logic.

<img width="1462" height="1098" alt="image" src="https://github.com/user-attachments/assets/0dfb0583-ebb3-4221-8c69-266ccbe6ded0" />


## 🏆 Hackathon Project

**Event:** Odoo x Gujarat Vidyapith Hackathon 2026  
**Team:** Priyansh Verma, Piyush Verma, Trishansh Verma  
**Status:** 🚧 In Development - Phase 4 Complete (70% Complete)

---

## 🚀 Quick Start

```bash
# Navigate to the project
cd fleetflow

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

---

## 📋 Project Overview

FleetFlow is a comprehensive fleet management solution designed to eliminate manual paperwork and replace it with intelligent automation. Built with modern web technologies and an offline-first architecture, it ensures operations continue seamlessly even without internet connectivity.

### Core Capabilities

1. **Asset & Human Registry** - Manage vehicles and driver profiles with compliance tracking
2. **Operational Logic** - Smart trip dispatching with automatic validation
3. **Financial Audit** - Expense tracking and ROI calculations
4. **Offline-First** - Works completely offline using browser-based database

---

## ✅ Development Progress

### Phase 1: Foundation ✅ COMPLETE
- [x] Next.js 15 project initialized with TypeScript
- [x] Tailwind CSS configured with brand colors (#714b67, #f3f4f6, #ffffff)
- [x] PGLite offline database schema created
- [x] Authentication system implemented (login/signup)
- [x] Professional landing page created
- [x] Protected dashboard route
- [x] Dev server running successfully

### Phase 2A: Vehicle Registry ✅ COMPLETE
- [x] Dashboard layout with sidebar navigation
- [x] Vehicle CRUD operations (Create, Read, Update, Delete)
- [x] Vehicle search and filtering
- [x] Status management (Available, On Trip, In Shop, Suspended)
- [x] Retire vehicle functionality
- [x] Statistics dashboard
- [x] Responsive data tables

### Phase 2B: Driver Profiles ✅ COMPLETE
- [x] Driver CRUD operations
- [x] License compliance tracking
- [x] License expiry validation (expired/expiring/valid)
- [x] Compliance warning banners
- [x] Driver status management
- [x] Search functionality
- [x] Strict validation rules for trip assignment
- [x] Color-coded license status indicators

### Phase 3: Operational Logic ✅ COMPLETE
- [x] Trip Dispatcher with cargo validation
- [x] Service Log with auto-status management
- [x] Business rule enforcement (cargo ≤ capacity, valid license, available vehicle)
- [x] Auto-status updates (vehicle/driver → "On Trip", service → "In Shop")
- [x] Three-mode service modal (create/edit/resolve)
- [x] Search and filter capabilities
- [x] Real-time capacity validation

### Phase 4: Financial & Performance ✅ COMPLETE
- [x] Expense Tracker with six expense types
- [x] Analytics Hub with performance metrics
- [x] ROI calculations per vehicle
- [x] Fuel efficiency tracking (km/L, cost/km)
- [x] Expense breakdown by category
- [x] Fleet performance overview
- [x] Distance and revenue tracking per trip

### Phase 5: Final Polish ✅ COMPLETE
- [x] Command Center dashboard
- [x] PWA configuration
- [x] CSV export functionality
- [x] Final testing and optimization

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| PGLite | Latest | Offline-first database |
| Lucide Icons | Latest | Icon system |
| bcryptjs | Latest | Password hashing |

---

## 🎨 Design System

### Brand Colors
- **Primary Purple:** `#714b67` (buttons, headers, active states)
- **Accent Grey:** `#f3f4f6` (backgrounds, disabled states)
- **Base White:** `#ffffff` (cards, workspace)

### Status Pills
- 🟢 Green = Available
- 🔵 Blue = On Trip  
- 🟡 Amber = In Shop
- 🔴 Red = Suspended/Retired

---

## 📁 Project Structure

```
Odoo-x-Gujarat-Vidyapith-Hackathon-26/
├── fleetflow/                    # Main application
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── dashboard/            # Dashboard (protected)
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── vehicles/         # Vehicle registry
│   │   │   ├── drivers/          # Driver profiles
│   │   │   ├── trips/            # Trip dispatcher
│   │   │   ├── service/          # Service log
│   │   │   ├── expenses/         # Expense tracker
│   │   │   └── analytics/        # Analytics hub
│   │   ├── reset-db/             # Database reset utility
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── DashboardLayout.tsx   # Main dashboard wrapper
│   │   ├── VehicleModal.tsx      # Vehicle add/edit form
│   │   ├── DriverModal.tsx       # Driver add/edit form
│   │   ├── TripModal.tsx         # Trip add/edit form
│   │   ├── ServiceModal.tsx      # Service log form
│   │   └── ExpenseModal.tsx      # Expense logging form
│   ├── lib/
│   │   ├── db.ts                 # Database schema & initialization
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── vehicles.ts           # Vehicle CRUD operations
│   │   ├── drivers.ts            # Driver CRUD operations
│   │   ├── trips.ts              # Trip CRUD with validation
│   │   ├── service-log.ts        # Service log CRUD
│   │   ├── expenses.ts           # Expense CRUD & calculations
│   │   └── analytics.ts          # Analytics & ROI calculations
│   └── README.md                 # Project documentation
├── Project Details.md            # Detailed requirements
├── tracker.md                    # Development tracker
└── README.md                     # This file
```

---

## 🗄️ Database Schema

**6 Core Tables:**
1. **users** - Authentication and user management
2. **vehicles** - Asset registry with capacity tracking
3. **drivers** - Driver profiles with license compliance
4. **trips** - Trip records with validation
5. **expenses** - Financial tracking per vehicle
6. **service_log** - Maintenance records

---

## 🔐 Security & Authentication

- **Offline-first authentication** using local PGLite database
- **Password hashing** with bcryptjs
- **Session management** via localStorage
- **Protected routes** with client-side guards

---

## 📊 Key Features Implemented

### ✅ Landing Page
- Professional hero section with CTA
- Feature showcase grid (6 key features)
- Call-to-action section
- Responsive header and footer

### ✅ Authentication System
- Login page with validation
- Signup page with password confirmation
- Session management
- Protected dashboard route

### ✅ Dashboard Layout
- Responsive sidebar navigation
- 7 menu items (Dashboard, Vehicles, Drivers, Trips, Service, Expenses, Analytics)
- Mobile hamburger menu
- User profile with logout

### ✅ Vehicle Registry
- Full CRUD operations
- Search and filter functionality
- Status management with color-coded pills
- Retire/unretire vehicles
- Statistics cards (Total, Available, On Trip, In Shop)
- Responsive data tables

### ✅ Driver Profiles
- Full CRUD operations
- License compliance tracking
- Automatic license expiry detection
- Visual compliance warnings (expired/expiring)
- Color-coded license status badges
- Strict validation preventing expired driver assignments
- Statistics cards (Total, Available, Expiring, Expired)

### ✅ Trip Dispatcher
- Full CRUD with strict validation
- Cargo weight vs vehicle capacity check
- Driver license expiry validation
- Auto-status updates (vehicle/driver → "On Trip")
- Search by vehicle, driver, origin, destination
- Filter by trip status
- Real-time capacity validation in form
- Distance and revenue tracking

### ✅ Service Log
- Full CRUD operations
- Auto-status management (vehicle → "In Shop")
- Three-mode modal (create/edit/resolve)
- Resolution workflow
- Quick resolve button
- Info banners explaining status changes
- Statistics showing vehicles in shop

### ✅ Expense Tracker
- Six expense types (Fuel, Maintenance, Insurance, Registration, Repairs, Other)
- Amount validation with decimal precision
- Search and filter capabilities
- Statistics breakdown (total, fuel, maintenance)
- Expense breakdown by category
- Date range tracking
- Vehicle expense history

### ✅ Analytics Hub
- Fleet performance overview
- Fuel efficiency calculations (km/L, cost/km)
- Vehicle ROI analysis with color-coded indicators
- Expense breakdown visualization
- Revenue vs expenses tracking
- Trip completion statistics
- Performance metrics per vehicle

### ✅ Database Architecture
- Complete schema for all modules
- Offline-first with PGLite (IndexedDB)
- Relational structure with foreign keys
- Automatic timestamps
- CHECK constraints for data validation

---

## 📝 Documentation

- **[Project Details.md](./Project Details.md)** - Complete project requirements and architecture
- **[tracker.md](./tracker.md)** - Development log and progress tracking
- **[fleetflow/README.md](./fleetflow/README.md)** - Technical documentation

---

## 🎯 Business Rules

### Trip Assignment Validation
- [x] Cargo weight ≤ Vehicle max capacity
- [x] Driver license not expired (strict validation implemented)
- [x] Vehicle status = Available

### License Compliance
- [x] Automatic expiry detection
- [x] Warning for licenses expiring within 30 days
- [x] Prevents adding drivers with expired licenses
- [x] Blocks trip assignment for expired licenses

### Service Log Auto-Management
- [x] Logging sets vehicle status to "In Shop"
- [x] Auto-removes from dispatcher pool
- [x] Resolution restores to Available

### Vehicle Lifecycle
- [x] Retired toggle removes from active fleet
- [x] Status changes propagate globally
- [x] Unique registration validation

---

## 🚦 Current Status

**Development Server:** ✅ Running on http://localhost:3000  
**Phase 1:** ✅ Complete (Authentication & Landing Page)  
**Phase 2:** ✅ Complete (Vehicle Registry & Driver Profiles)  
**Phase 3:** ✅ Complete (Trip Dispatcher & Service Log)  
**Phase 4:** ✅ Complete (Expense Tracker & Analytics Hub)  
**Bug Fixes:** ✅ Complete (Type safety & runtime errors resolved)  
**Phase 5:** 🚧 Starting Next (Command Center & PWA)  

### Recent Achievements
- Completed full operational logic with strict validation
- Implemented auto-status management across all modules
- Built comprehensive analytics with ROI and fuel efficiency
- Created expense tracking with financial calculations
- Added distance and revenue tracking to trips
- Integrated all modules with status cascading
- Delivered data-driven insights for fleet optimization
- Fixed all TypeScript compilation errors
- Resolved runtime errors in driver edit workflow
- Improved type safety with PGLite query result casting  

---

## � Known Issues & Solutions

### Database Reset
If you encounter database constraint errors (especially with the drivers table), visit:
```
http://localhost:3000/reset-db
```
This page will recreate tables with proper CHECK constraints. This is necessary because PGLite's `CREATE TABLE IF NOT EXISTS` doesn't alter existing schemas.

### TypeScript & PGLite
PGLite query results return `unknown` types. We use explicit type casting:
```typescript
const result = await db.query('SELECT * FROM table');
return result.rows as any[] as MyType[];
```

### Driver Edit Issue
Fixed: License expiry date handling now supports both Date objects and strings from the database.

---

## �👥 Team

- **Priyansh Verma** - Lead Development
- **Piyush Verma** - Full-Stack Development  
- **Trishansh Verma** - System Architecture

---

## 📄 License

Created for Odoo x Gujarat Vidyapith Hackathon 2026.

---

**Last Updated:** February 21, 2026  
**Version:** 0.3.0 (Phase 2B Complete)  
**Progress:** 40% Complete (2 of 5 phases done)  
Project submission for Odoo x Gujarat Vidyapith Hackathon '26

# Team Members Check:

### Priyansh Verma - `Readyy!!`
### Piyush Verma - `Ready!`
### Trishansh Verma - `Ready!!!`
