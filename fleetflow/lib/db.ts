import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;

/**
 * Initialize and return PGLite database instance.
 * Creates tables for Vehicles, Drivers, Trips, Expenses, ServiceLog, and Users.
 * Uses browser-based storage for offline-first architecture.
 */
export async function getDB(): Promise<PGlite> {
  if (db) return db;

  db = new PGlite('idb://fleetflow-db');

  // Create Users table for authentication
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Vehicles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      registration VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(100) NOT NULL,
      max_capacity DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Available',
      retired BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Drivers table with license compliance tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      license_number VARCHAR(100) UNIQUE NOT NULL,
      license_expiry DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'On Leave', 'Suspended')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Trips table with cargo validation logic
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER REFERENCES vehicles(id),
      driver_id INTEGER REFERENCES drivers(id),
      cargo_weight DECIMAL(10, 2) NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      status VARCHAR(50) DEFAULT 'Pending',
      origin VARCHAR(255),
      destination VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Expenses table for fuel and maintenance tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER REFERENCES vehicles(id),
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create ServiceLog table with auto-status management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS service_log (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER REFERENCES vehicles(id),
      issue TEXT NOT NULL,
      resolution TEXT,
      date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'In Progress',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
