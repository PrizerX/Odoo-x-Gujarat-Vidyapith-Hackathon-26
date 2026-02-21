# FleetFlow - UI & Feature Documentation

## 🎨 Pages Created

### 1. Landing Page (`/`)
**Route:** `http://localhost:3000`  
**Status:** ✅ Complete

**Sections:**
- **Header:** Logo, navigation with Login/Get Started buttons
- **Hero Section:** Main headline, description, dual CTAs (Start Free Trial, Watch Demo)
- **Features Grid:** 6 feature cards showcasing core capabilities
  - Vehicle Registry
  - Driver Management
  - Analytics Hub
  - Service Tracking
  - Strict Validation
  - Offline First
- **CTA Section:** Full-width purple background call-to-action
- **Footer:** Branding and copyright information

**Color Scheme:**
- Primary: `#714b67` (Purple)
- Background: `#f3f4f6` (Grey) for feature cards
- Text: Standard gray scale

**Icons:** Lucide icons (Truck, Users, BarChart3, Wrench, Shield, Zap)

---

### 2. Login Page (`/login`)
**Route:** `http://localhost:3000/login`  
**Status:** ✅ Complete

**Features:**
- FleetFlow branding at top
- Email and password fields
- Remember me checkbox
- Forgot password link
- Submit button with loading state
- Link to signup page
- Error message display with AlertCircle icon
- "Offline-first authentication" badge

**Validation:**
- Required email and password fields
- Error handling for invalid credentials
- Loading state during authentication

**Functionality:**
- Authenticates against local PGLite database
- Redirects to `/dashboard` on success
- Stores session in localStorage

---

### 3. Signup Page (`/signup`)
**Route:** `http://localhost:3000/signup`  
**Status:** ✅ Complete

**Features:**
- FleetFlow branding at top
- Full name field
- Email field
- Password field (min 6 characters)
- Confirm password field
- Offline-first info box with CheckCircle icon
- Submit button with loading state
- Link to login page
- Error message display

**Validation:**
- All fields required
- Password minimum 6 characters
- Password confirmation match
- Email format validation
- Duplicate email check

**Functionality:**
- Creates new user in local PGLite database
- Hashes password with bcryptjs
- Auto-login after successful registration
- Redirects to `/dashboard`

---

### 4. Dashboard Page (`/dashboard`)
**Route:** `http://localhost:3000/dashboard`  
**Status:** ✅ Complete (Placeholder)

**Features:**
- Protected route (requires authentication)
- Header with FleetFlow branding
- User info display (name, email)
- Logout button
- Welcome message with user name
- Status pills showing system status
- "Coming Soon" message for full dashboard
- Feature preview cards

**Protection:**
- Checks for session on load
- Redirects to `/login` if not authenticated
- Loading state while checking session

**Preview Sections:**
- "Coming Next" card with upcoming features list
- "Analytics Ready" card with analytics features list

---

## 🔐 Authentication Flow

```
User Registration:
1. Fill signup form
2. Validate inputs (password match, min length)
3. Hash password with bcryptjs
4. Store in PGLite users table
5. Create session in localStorage
6. Redirect to dashboard

User Login:
1. Fill login form
2. Query PGLite for user by email
3. Compare password hash with bcrypt
4. Create session in localStorage on success
5. Redirect to dashboard

Protected Routes:
1. Check localStorage for session
2. Parse user data
3. If no session → redirect to /login
4. If session exists → allow access
```

---

## 🎨 Design System Implementation

### Typography
- **Font:** Inter (Google Font)
- **Headings:** Bold, large sizes for hierarchy
- **Body:** Regular weight, readable sizes

### Components

#### Status Pills
```css
.status-pill - Base class (inline-flex, rounded-full, padding)
.status-available - Green background (bg-green-100, text-green-800)
.status-on-trip - Blue background (bg-blue-100, text-blue-800)
.status-in-shop - Amber background (bg-amber-100, text-amber-800)
.status-suspended - Red background (bg-red-100, text-red-800)
```

#### Buttons
- **Primary:** Purple background (`#714b67`), white text, hover scale
- **Secondary:** Purple border, purple text, hover bg-gray-50
- **Text:** Gray text, hover darker gray

#### Forms
- White backgrounds
- Gray borders
- Purple focus rings
- Error states with red backgrounds
- Info states with blue backgrounds

### Icons
- **Size:** Consistent 20-24px for UI elements
- **Style:** Lucide icons (modern, clean)
- **Color:** Matches text or brand purple

---

## 🗄️ Database Structure

### Users Table
```sql
id (SERIAL PRIMARY KEY)
email (VARCHAR UNIQUE)
password_hash (VARCHAR)
name (VARCHAR)
role (VARCHAR DEFAULT 'user')
created_at (TIMESTAMP)
```

### Vehicles Table
```sql
id (SERIAL PRIMARY KEY)
registration (VARCHAR UNIQUE)
type (VARCHAR)
max_capacity (DECIMAL)
status (VARCHAR DEFAULT 'Available')
retired (BOOLEAN DEFAULT FALSE)
created_at (TIMESTAMP)
```

### Drivers Table
```sql
id (SERIAL PRIMARY KEY)
name (VARCHAR)
license_number (VARCHAR UNIQUE)
license_expiry (DATE)
status (VARCHAR DEFAULT 'Available')
created_at (TIMESTAMP)
```

### Trips Table
```sql
id (SERIAL PRIMARY KEY)
vehicle_id (INTEGER FK)
driver_id (INTEGER FK)
cargo_weight (DECIMAL)
start_date (TIMESTAMP)
end_date (TIMESTAMP)
status (VARCHAR DEFAULT 'Pending')
origin (VARCHAR)
destination (VARCHAR)
created_at (TIMESTAMP)
```

### Expenses Table
```sql
id (SERIAL PRIMARY KEY)
vehicle_id (INTEGER FK)
type (VARCHAR) -- 'fuel' or 'maintenance'
amount (DECIMAL)
date (DATE)
description (TEXT)
created_at (TIMESTAMP)
```

### ServiceLog Table
```sql
id (SERIAL PRIMARY KEY)
vehicle_id (INTEGER FK)
issue (TEXT)
resolution (TEXT)
date (DATE)
status (VARCHAR DEFAULT 'In Progress')
created_at (TIMESTAMP)
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Implementation
- Grid layouts collapse to single column on mobile
- Navigation adapts to smaller screens
- Forms maintain usability on all devices
- Buttons remain accessible with proper touch targets

---

## ⚡ Performance Features

### Offline-First Architecture
- **PGLite:** Browser-based PostgreSQL using IndexedDB
- **Local Storage:** Session management
- **No Network Required:** All operations work offline
- **Data Persistence:** Survives browser restarts

### Optimization
- **Next.js 15:** Latest features and optimizations
- **Turbopack:** Fast bundling and hot reload
- **Image Optimization:** Next.js automatic optimization
- **Font Loading:** Optimized with next/font

---

## 🚀 Next Steps

### Phase 2: Asset & Human Registry
1. **Vehicle Registry Page**
   - Table view with all vehicles
   - Add/Edit/Delete modals
   - Status toggle
   - Retire functionality
   - Search and filter

2. **Driver Profiles Page**
   - Table view with all drivers
   - Add/Edit/Delete modals
   - License expiry warnings
   - Status management
   - Compliance indicators

### Phase 3: Operational Logic
3. **Trip Dispatcher**
   - Create trip form
   - Vehicle selection (only Available)
   - Driver selection (only valid license)
   - Cargo weight validation
   - Trip status tracking

4. **Service Log**
   - Log maintenance issues
   - Auto-update vehicle status
   - Resolution tracking
   - History view

### Phase 4: Financial & Performance
5. **Expense Tracker**
   - Add expenses per vehicle
   - Category filtering
   - Date range selection
   - Total calculations

6. **Analytics Hub**
   - Fuel efficiency charts
   - ROI calculations
   - Performance metrics
   - Export to CSV

---

**Documentation Version:** 1.0  
**Last Updated:** February 21, 2026  
**Status:** Phase 1 Complete
