# FleetFlow - Modular Fleet & Logistics Management System

> Offline-first logistics ERP that replaces manual logbooks with strict business logic.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![PGLite](https://img.shields.io/badge/PGLite-Offline--first-green)

## 🎯 Project Overview

FleetFlow is a modern, offline-first fleet management system built for the **Odoo x Gujarat Vidyapith Hackathon '26**. It provides a complete solution for managing vehicles, drivers, trips, expenses, and analytics—all without requiring constant internet connectivity.

### Team
- **Priyansh Verma**
- **Piyush Verma**
- **Trishansh Verma**

## ✨ Key Features

### 🚗 Asset & Human Registry
- **Vehicle Registry:** Complete CRUD operations with capacity tracking and retirement management
- **Driver Profiles:** Compliance tracking with automatic license expiry validation

### ⚙️ Operational Logic
- **Trip Dispatcher:** Smart trip creation with cargo weight validation against vehicle capacity
- **Service Log:** Automatic status management when vehicles enter maintenance

### 💰 Financial & Performance Audit
- **Expense Tracker:** Track fuel and maintenance costs per vehicle
- **Analytics Hub:** Real-time fuel efficiency and ROI calculations

### 🔒 Offline-First Architecture
- Browser-based PostgreSQL database (PGLite)
- Complete offline functionality
- Local data persistence
- No server required

## 🎨 Brand Identity

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | `#714b67` | Headers, buttons, active states |
| Accent Grey | `#f3f4f6` | Backgrounds, disabled states |
| Base White | `#ffffff` | Cards, workspace |

### Status Pills
- 🟢 **Green** - Available
- 🔵 **Blue** - On Trip
- 🟡 **Amber** - In Shop
- 🔴 **Red** - Suspended/Retired

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with IndexedDB support

### Installation

```bash
# Navigate to project directory
cd fleetflow

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
fleetflow/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login page
│   ├── signup/page.tsx       # Signup page
│   ├── dashboard/page.tsx    # Protected dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles with brand colors
├── lib/
│   ├── db.ts                 # PGLite database setup & schema
│   └── auth.ts               # Authentication utilities
└── public/                   # Static assets
```

## 🗄️ Database Schema

### Tables
1. **Users** - Authentication and user management
2. **Vehicles** - Asset registry with capacity and status
3. **Drivers** - Driver profiles with license compliance
4. **Trips** - Trip records with validation logic
5. **Expenses** - Financial tracking per vehicle
6. **ServiceLog** - Maintenance and repair records

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety and better DX |
| **Tailwind CSS** | Utility-first styling |
| **PGLite** | Browser-based PostgreSQL |
| **Lucide Icons** | Modern icon system |
| **bcryptjs** | Password hashing |
| **date-fns** | Date manipulation |

## 🔐 Authentication

FleetFlow uses offline-first authentication:
- Passwords are hashed with bcryptjs
- Credentials stored in local PGLite database
- Session management via localStorage
- No external auth providers needed

## 📋 Business Rules

### Trip Assignment
- ✅ Cargo weight must not exceed vehicle max capacity
- ✅ Driver license must not be expired
- ✅ Vehicle must be in "Available" status

### Service Log
- ✅ Logging a vehicle automatically sets status to "In Shop"
- ✅ Vehicles in shop are removed from dispatcher pool
- ✅ Resolution updates restore vehicle to available status

### Vehicle Management
- ✅ Retired toggle removes vehicle from active system
- ✅ Status changes propagate across all modules

## 🎯 Development Status

### ✅ Phase 1: Foundation (Completed)
- [x] Next.js 15 project setup
- [x] Tailwind configuration with brand colors
- [x] PGLite database schema
- [x] Authentication system
- [x] Landing page
- [x] Login/Signup pages

### 🚧 Phase 2: Asset & Human Registry (Next)
- [ ] Vehicle Registry CRUD
- [ ] Driver Profiles CRUD
- [ ] License expiry validation

### 📅 Phase 3: Operational Logic
- [ ] Trip Dispatcher
- [ ] Service Log
- [ ] Business rule enforcement

### 📅 Phase 4: Financial & Performance
- [ ] Expense Tracker
- [ ] Analytics Hub
- [ ] Fuel efficiency calculations
- [ ] ROI tracking

### 📅 Phase 5: Final Polish
- [ ] Command Center dashboard
- [ ] PWA configuration
- [ ] CSV export functionality
- [ ] Final testing

## 🎨 UI Philosophy

> "Modular, minimal, and at-a-glance scannable"

- Clean, modern sans-serif typography (Inter)
- Consistent spacing and visual hierarchy
- Status pills for instant status recognition
- Responsive design for all screen sizes
- Professional color palette

---

**Built with ❤️ for Odoo x Gujarat Vidyapith Hackathon '26**


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
