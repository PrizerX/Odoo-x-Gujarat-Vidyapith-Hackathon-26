'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/auth';
import { Truck, LogOut } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Page Component
 * Protected route that displays after successful authentication.
 * Shows user info and provides navigation to main features.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session);
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
            <Truck className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#714b67' }}>
                FleetFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your fleet operations from this command center.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The full dashboard with vehicle registry, driver management, trip dispatcher, and analytics will be available shortly.
          </p>
          <div className="inline-flex gap-2 text-sm">
            <span className="status-pill status-available">System Ready</span>
            <span className="status-pill status-on-trip">Database Connected</span>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#714b67' }}>
              🚗 Coming Next
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Vehicle Registry with status tracking</li>
              <li>• Driver Profiles with compliance checks</li>
              <li>• Trip Dispatcher with validation</li>
              <li>• Service Log management</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#714b67' }}>
              📊 Analytics Ready
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fuel efficiency calculations</li>
              <li>• Vehicle ROI tracking</li>
              <li>• Expense monitoring</li>
              <li>• Performance metrics</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
