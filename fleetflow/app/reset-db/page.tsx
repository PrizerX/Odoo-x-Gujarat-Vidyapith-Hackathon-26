'use client';

import { useEffect, useState } from 'react';
import { getDB } from '@/lib/db';

/**
 * Database Reset Page
 * This page resets the drivers table to fix the CHECK constraint issue.
 * Navigate to this page once, then go back to the drivers page.
 */
export default function ResetDB() {
  const [status, setStatus] = useState('Resetting database...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function resetDriversTable() {
      try {
        const db = await getDB();
        
        setStatus('Dropping old drivers table...');
        await db.exec('DROP TABLE IF EXISTS drivers CASCADE');
        
        setStatus('Creating new drivers table with CHECK constraint...');
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
        
        setStatus('✓ Database reset successfully! You can now go back to the drivers page.');
      } catch (err) {
        setError((err as Error).message);
        setStatus('❌ Error occurred');
      }
    }

    resetDriversTable();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Reset</h1>
        <p className="text-gray-600 mb-6">
          {status}
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm font-mono">{error}</p>
          </div>
        )}
        {status.includes('✓') && (
          <a
            href="/dashboard/drivers"
            className="block w-full text-center px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#714b67' }}
          >
            Go to Drivers Page
          </a>
        )}
      </div>
    </div>
  );
}
