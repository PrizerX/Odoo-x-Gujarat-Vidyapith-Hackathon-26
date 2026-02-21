import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Truck, Users, Navigation, TrendingUp } from 'lucide-react';

/**
 * Dashboard Home Page
 * Command center showing key metrics and quick actions.
 */
export default function DashboardPage() {
  const stats = [
    { name: 'Total Vehicles', value: '0', icon: Truck, color: '#714b67' },
    { name: 'Active Drivers', value: '0', icon: Users, color: '#3b82f6' },
    { name: 'Ongoing Trips', value: '0', icon: Navigation, color: '#10b981' },
    { name: 'Total Revenue', value: '$0', icon: TrendingUp, color: '#f59e0b' },
  ];

  const quickActions = [
    { name: 'Add Vehicle', href: '/dashboard/vehicles', color: '#714b67' },
    { name: 'Add Driver', href: '/dashboard/drivers', color: '#3b82f6' },
    { name: 'Create Trip', href: '/dashboard/trips', color: '#10b981' },
    { name: 'View Analytics', href: '/dashboard/analytics', color: '#f59e0b' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your fleet management command center
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: action.color }}
                >
                  <span className="text-2xl text-white">+</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto mb-4" style={{ color: '#714b67' }} />
            <p className="text-gray-600">No recent activity yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start by adding vehicles and drivers to your fleet
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
