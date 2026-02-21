🏆 FleetFlow: The Full-Arc AI Agent Prompt

**Role:** You are the Lead Architect for **FleetFlow**, a modular logistics ERP. Your mission is to build a high-performance, offline-first system that replaces manual logbooks with strict business logic.

### 1. Visual & Brand Identity

* **Primary Palette:** Main Purple `#714b67` (headers, buttons, active states), Accent Grey `#f3f4f6` (backgrounds, disabled states), Base White `#ffffff` (cards, workspace).
* **Typography:** Use a clean, modern sans-serif (Inter or Geist).
* **UI Philosophy:** Modular, minimal, and "at-a-glance" scannable. Use status pills (Green = Available, Blue = On Trip, Amber = In Shop, Red = Suspended/Retired).

### 2. The Core Project Arc & Components

Build the system following this specific relational and logic arc:

* **A. Asset & Human Registry (Foundation):** * `VehicleRegistry`: CRUD for assets. Logic: Toggle "Retired" to remove from system.
* `DriverProfiles`: Compliance tracking. **Strict Rule:** License expiry check must block trip assignment.


* **B. Operational Logic (The Engine):**
* `TripDispatcher`: Creation form with validation logic: `CargoWeight <= Vehicle.MaxCapacity`.
* `ServiceLog`: Health tracking. **Strict Rule:** Logging a vehicle here sets `Status = 'In Shop'`, auto-removing it from the Dispatcher's pool.


* **C. Financial & Performance Audit (The Output):**
* `ExpenseTracker`: Logging Fuel and Maintenance costs against `VehicleID`.
* `AnalyticsHub`: Calculation of Fuel Efficiency () and Vehicle ROI: .



### 3. Technical Implementation & Constraints

* **Stack:** Next.js 15, Tailwind CSS, Shadcn UI.
* **Database:** **Offline-First with PGLite** (browser-based Postgres). All state must persist locally to allow offline usage.
* **Navigation:** Intuitive sidebar with proper spacing.
* **State Management:** Real-time state updates across components using React Context or TanStack Query.
* **Documentation:** No excessive comments. Include one descriptive comment block before every function explaining logic and constraints.

### 4. Step-by-Step Construction Guide

1. **Phase 1:** Setup Tailwind theme and PGLite Schema (Vehicles, Drivers, Trips, Expenses).
2. **Phase 2:** Build Registries (Pages 3 & 7) with input validation.
3. **Phase 3:** Build the Trip Workflow (Page 4) and Maintenance link (Page 5).
4. **Phase 4:** Build the Command Center (Page 2) and Analytics (Page 8) using the real data from local DB.
5. **Phase 5:** Final "Offline-Ready" PWA audit and CSV export functionality.

**"Begin by initializing the Next.js project with the Odoo brand colors in Tailwind and setting up the PGLite database schema for all four core tables."**

And also create a tracker.md file that tracks the work in progress and the tasks being done in each project iteration to keep the records and logs for all the changes.

