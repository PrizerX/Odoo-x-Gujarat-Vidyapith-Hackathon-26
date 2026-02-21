# FleetFlow - Odoo x Gujarat Vidyapith Hackathon '26

> **Modular Fleet & Logistics Management System**  
> An offline-first logistics ERP that replaces manual logbooks with strict business logic.

## 🏆 Hackathon Project

**Event:** Odoo x Gujarat Vidyapith Hackathon 2026  
**Team:** Priyansh Verma, Piyush Verma, Trishansh Verma  
**Status:** 🚧 In Development - Phase 2B Complete

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
- ✅ Next.js 15 project initialized with TypeScript
- ✅ Tailwind CSS configured with brand colors (#714b67, #f3f4f6, #ffffff)
- ✅ PGLite offline database schema created
- ✅ Authentication system implemented (login/signup)
- ✅ Professional landing page created
- ✅ Protected dashboard route
- ✅ Dev server running successfully

### Phase 2A: Vehicle Registry ✅ COMPLETE
- ✅ Dashboard layout with sidebar navigation
- ✅ Vehicle CRUD operations (Create, Read, Update, Delete)
- ✅ Vehicle search and filtering
- ✅ Status management (Available, On Trip, In Shop, Suspended)
- ✅ Retire vehicle functionality
- ✅ Statistics dashboard
- ✅ Responsive data tables

### Phase 2B: Driver Profiles ✅ COMPLETE
- ✅ Driver CRUD operations
- ✅ License compliance tracking
- ✅ License expiry validation (expired/expiring/valid)
- ✅ Compliance warning banners
- ✅ Driver status management
- ✅ Search functionality
- ✅ Strict validation rules for trip assignment
- ✅ Color-coded license status indicators

### Phase 3: Operational Logic 🚧 NEXT
- [ ] Trip Dispatcher with cargo validation
- [ ] Service Log with auto-status management
- [ ] Business rule enforcement

### Phase 4: Financial & Performance 📅 PLANNED
- [ ] Expense Tracker
- [ ] Analytics Hub
- [ ] ROI calculations

### Phase 5: Final Polish 📅 PLANNED
- [ ] Command Center dashboard
- [ ] PWA configuration
- [ ] CSV export functionality

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
│   │   │   └── drivers/          # Driver profiles
│   │   ├── reset-db/             # Database reset utility
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── DashboardLayout.tsx   # Main dashboard wrapper
│   │   ├── VehicleModal.tsx      # Vehicle add/edit form
│   │   └── DriverModal.tsx       # Driver add/edit form
│   ├── lib/
│   │   ├── db.ts                 # Database schema & initialization
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── vehicles.ts           # Vehicle CRUD operations
│   │   └── drivers.ts            # Driver CRUD operations
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
- ✅ Cargo weight ≤ Vehicle max capacity
- ✅ Driver license not expired (strict validation implemented)
- ✅ Vehicle status = Available

### License Compliance
- ✅ Automatic expiry detection
- ✅ Warning for licenses expiring within 30 days
- ✅ Prevents adding drivers with expired licenses
- ✅ Blocks trip assignment for expired licenses

### Service Log Auto-Management
- Logging sets vehicle status to "In Shop"
- Auto-removes from dispatcher pool
- Resolution restores to Available

### Vehicle Lifecycle
- ✅ Retired toggle removes from active fleet
- ✅ Status changes propagate globally
- ✅ Unique registration validation

---

## 🚦 Current Status

**Development Server:** ✅ Running on http://localhost:3000  
**Phase 1:** ✅ Complete (Authentication & Landing Page)  
**Phase 2A:** ✅ Complete (Vehicle Registry)  
**Phase 2B:** ✅ Complete (Driver Profiles)  
**Phase 3:** 🚧 Starting Next (Trip Dispatcher & Service Log)  

### Recent Achievements
- Implemented complete vehicle management system
- Built driver profiles with strict license compliance
- Created responsive dashboard layout
- Added search and filter functionality
- Implemented color-coded status indicators
- Set up validation rules for business logic  

---

## 👥 Team

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
