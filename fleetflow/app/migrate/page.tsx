'use client';

import { useState } from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { getDB } from '@/lib/db';

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [columns, setColumns] = useState<string[]>([]);

  const runMigration = async () => {
    setStatus('migrating');
    setMessage('Running database migration...');

    try {
      const db = await getDB();

      // Check current columns
      const checkResult = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        ORDER BY ordinal_position;
      `);
      
      const existingColumns = (checkResult.rows as any[]).map((row: any) => row.column_name);
      setColumns(existingColumns);

      // Add distance column if it doesn't exist
      if (!existingColumns.includes('distance')) {
        setMessage('Adding distance column to trips table...');
        await db.exec(`ALTER TABLE trips ADD COLUMN distance DECIMAL(10, 2) DEFAULT 0;`);
      }

      // Add revenue column if it doesn't exist
      if (!existingColumns.includes('revenue')) {
        setMessage('Adding revenue column to trips table...');
        await db.exec(`ALTER TABLE trips ADD COLUMN revenue DECIMAL(10, 2) DEFAULT 0;`);
      }

      // Verify the migration
      const verifyResult = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        ORDER BY ordinal_position;
      `);
      
      const updatedColumns = (verifyResult.rows as any[]).map((row: any) => row.column_name);
      setColumns(updatedColumns);

      setStatus('success');
      setMessage('Database migration completed successfully! You can now use the analytics features.');
    } catch (error) {
      console.error('Migration error:', error);
      setStatus('error');
      setMessage(`Migration failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
            <Database className="w-8 h-8" style={{ color: '#714b67' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Database Migration</h1>
            <p className="text-gray-600">Update your database schema for new features</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What this migration does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Adds <code className="bg-blue-100 px-1 rounded">distance</code> column to trips table</li>
              <li>✓ Adds <code className="bg-blue-100 px-1 rounded">revenue</code> column to trips table</li>
              <li>✓ Enables analytics features (ROI, fuel efficiency)</li>
            </ul>
          </div>

          {status === 'idle' && (
            <button
              onClick={runMigration}
              className="w-full px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#714b67' }}
            >
              Run Migration
            </button>
          )}

          {status === 'migrating' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-900 font-medium">{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900 font-medium">{message}</span>
              </div>
              
              {columns.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Trips table columns:</h4>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col) => (
                      <span
                        key={col}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          col === 'distance' || col === 'revenue'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href="/dashboard"
                className="block w-full text-center px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#714b67' }}
              >
                Go to Dashboard
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-900 font-medium">{message}</span>
              </div>
              
              <button
                onClick={runMigration}
                className="w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This migration is safe to run multiple times. It will only add columns if they don't already exist.
          </p>
        </div>
      </div>
    </div>
  );
}
