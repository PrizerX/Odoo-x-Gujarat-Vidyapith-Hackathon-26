# FleetFlow Development Tracker

**Project:** FleetFlow - Modular Fleet & Logistics Management System  
**Team:** Priyansh Verma, Piyush Verma, Trishansh Verma  
**Event:** Odoo x Gujarat Vidyapith Hackathon '26  
**Started:** February 21, 2026

---

## 🎯 Project Overview

FleetFlow is an offline-first logistics ERP system that replaces manual logbooks with strict business logic. Built with Next.js 15, Tailwind CSS, Shadcn UI, and PGLite for browser-based Postgres storage.

### Core Features
- **Asset & Human Registry:** Vehicle & Driver management with compliance tracking
- **Operational Logic:** Trip Dispatcher and Service Log with validation rules
- **Financial Audit:** Expense Tracker and Analytics with ROI calculations
- **Offline-First:** Full PWA support with local database persistence

### Brand Identity
- **Primary Purple:** `#714b67` (headers, buttons, active states)
- **Accent Grey:** `#f3f4f6` (backgrounds, disabled states)
- **Base White:** `#ffffff` (cards, workspace)

---

## 📋 Development Phases

### Phase 1: Foundation Setup ✅
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind with brand colors
- [ ] Install and setup Shadcn UI
- [ ] Setup PGLite database schema
- [ ] Create app layout and navigation

### Phase 2: Asset & Human Registry
- [ ] Build Vehicle Registry (CRUD operations)
- [ ] Build Driver Profiles (compliance tracking)
- [ ] Implement license expiry validation

### Phase 3: Operational Logic
- [ ] Build Trip Dispatcher (with cargo validation)
- [ ] Build Service Log (status management)
- [ ] Implement strict business rules

### Phase 4: Financial & Performance Audit
- [ ] Build Expense Tracker
- [ ] Build Analytics Hub
- [ ] Implement fuel efficiency & ROI calculations

### Phase 5: Final Polish & Deployment
- [ ] Build Command Center dashboard
- [ ] Configure PWA for offline support
- [ ] Add CSV export functionality
- [ ] Final testing and optimization

---

## 📝 Change Log

### Session 1 - February 21, 2026

#### 🚀 Initialization
**Time:** Session Start  
**Status:** In Progress  

**Tasks Completed:**
- Created project tracker document
- Created comprehensive todo list with 15 tasks across 5 phases
- Reviewed project requirements and specifications

**Next Steps:**
- Initialize Next.js 15 project with App Router
- Setup Tailwind configuration with brand colors
- Install required dependencies (Shadcn UI, PGLite)

**Notes:**
- Project uses offline-first architecture with PGLite
- Strict business rules required for trip assignment and service logging
- Status pill system: Green = Available, Blue = On Trip, Amber = In Shop, Red = Suspended/Retired

---

## 🔧 Technical Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework with App Router |
| TypeScript | Latest | Type safety |
| Tailwind CSS | Latest | Styling framework |
| Shadcn UI | Latest | Component library |
| PGLite | Latest | Offline-first database |
| React Context | - | State management |

---

## 📊 Database Schema (Planned)

### Tables to Create:
1. **Vehicles:** ID, registration, type, capacity, status, retired
2. **Drivers:** ID, name, license_number, license_expiry, status
3. **Trips:** ID, vehicle_id, driver_id, cargo_weight, start_date, end_date, status
4. **Expenses:** ID, vehicle_id, type (fuel/maintenance), amount, date
5. **ServiceLog:** ID, vehicle_id, issue, resolution, date, status

---

## ✅ Validation Rules

1. **Trip Assignment:** 
   - CargoWeight <= Vehicle.MaxCapacity
   - Driver license must not be expired
   
2. **Service Log:**
   - Logging a vehicle sets Status = 'In Shop'
   - Auto-removes from Dispatcher pool
   
3. **Vehicle Status:**
   - Retired toggle removes from active system

---

## 📌 Important Notes

- No excessive comments in code (one descriptive block per function)
- All state must persist locally for offline usage
- Real-time updates across components required
- Modular, minimal, "at-a-glance" scannable UI

---

*Last Updated: February 21, 2026*
