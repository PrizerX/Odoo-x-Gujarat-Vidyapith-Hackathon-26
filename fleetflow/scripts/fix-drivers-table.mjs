import { PGlite } from '@electric-sql/pglite';

(async () => {
  const db = new PGlite('idb://fleetflow-db');
  
  try {
    console.log('Dropping existing drivers table...');
    await db.exec('DROP TABLE IF EXISTS drivers CASCADE');
    console.log('✓ Drivers table dropped');
    
    console.log('Creating drivers table with CHECK constraint...');
    await db.exec(`
      CREATE TABLE drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        license_expiry DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'On Leave', 'Suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Drivers table recreated successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await db.close();
  }
})();
