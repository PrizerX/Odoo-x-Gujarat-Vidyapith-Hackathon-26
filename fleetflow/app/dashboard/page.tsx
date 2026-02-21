'use client';

import { useState, useEffect } from 'react';
import { Truck, Users, Navigation, DollarSign, AlertTriangle, TrendingUp, Clock, CheckCircle, RefreshCw, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getVehicles } from '@/lib/vehicles';
import { getDrivers, checkLicenseStatus } from '@/lib/drivers';
import { getTrips } from '@/lib/trips';
import { getFleetPerformance } from '@/lib/analytics';
import { getServiceLogs } from '@/lib/service-log';
import { format } from 'date-fns';

/**
 * Dashboard Home Page
 * Command center showing key metrics and quick actions.
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    activeTrips: 0,
    pendingTrips: 0,
    totalRevenue: 0,
    fleetROI: 0,
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    // Check if PWA install prompt is available
    const checkInstallPrompt = () => {
      const isInstallable = (window as any).showInstallPrompt !== undefined;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setShowInstallPrompt(isInstallable && !isStandalone);
    };
    
    // Check immediately and after a short delay
    setTimeout(checkInstallPrompt, 1000);

    // 
    // Refresh dashboard every 30 seconds
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data
      const [vehicles, drivers, trips, performance, serviceLogs] = await Promise.all([
        getVehicles(false),
        getDrivers(),
        getTrips(),
        getFleetPerformance(),
        getServiceLogs(),
      ]);

      // Calculate stats
      const availableVehicles = vehicles.filter((v: any) => v.status === 'Available').length;
      const availableDrivers = drivers.filter((d: any) => d.status === 'Available').length;
      const activeTrips = trips.filter((t: any) => t.status === 'In Progress').length;
      const pendingTrips = trips.filter((t: any) => t.status === 'Pending').length;

      setStats({
        totalVehicles: vehicles.length,
        availableVehicles,
        totalDrivers: drivers.length,
        availableDrivers,
        activeTrips,
        pendingTrips,
        totalRevenue: performance.totalRevenue,
        fleetROI: performance.avgROI,
      });

      // Generate alerts
      const alertsList: any[] = [];

      // Check for expired/expiring licenses
      const expiringDrivers = drivers.filter((d: any) => {
        const status = checkLicenseStatus(d.license_expiry);
        return status === 'expired' || status === 'expiring';
      });
      if (expiringDrivers.length > 0) {
        alertsList.push({
          type: 'warning',
          title: 'Driver License Expiry',
          message: `${expiringDrivers.length} driver(s) have expired or expiring licenses`,
          action: 'View Drivers',
          link: '/dashboard/drivers',
        });
      }

      // Check for vehicles in shop
      const inShopVehicles = vehicles.filter((v: any) => v.status === 'In Shop').length;
      if (inShopVehicles > 0) {
        alertsList.push({
          type: 'info',
          title: 'Vehicles in Maintenance',
          message: `${inShopVehicles} vehicle(s) currently in shop`,
          action: 'View Service Log',
          link: '/dashboard/service',
        });
      }

      // Check for pending trips
      if (pendingTrips > 0) {
        alertsList.push({
          type: 'info',
          title: 'Pending Trip Assignments',
          message: `${pendingTrips} trip(s) waiting to be started`,
          action: 'View Trips',
          link: '/dashboard/trips',
        });
      }

      setAlerts(alertsList);

      // Generate recent activities
      const activities: any[] = [];

      // Add recent trips
      trips.slice(0, 3).forEach((trip: any) => {
        activities.push({
          type: 'trip',
          icon: Navigation,
          title: `Trip: ${trip.origin} → ${trip.destination}`,
          description: `${trip.vehicle_registration} • ${trip.driver_name}`,
          status: trip.status,
          time: trip.created_at,
        });
      });

      // Add recent service logs
      serviceLogs.slice(0, 2).forEach((log: any) => {
        activities.push({
          type: 'service',
          icon: AlertTriangle,
          title: `Service: ${log.vehicle_registration}`,
          description: log.issue,
          status: log.status,
          time: log.created_at,
        });
      });

      // Sort by time
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Resolved':
        return 'text-green-600 bg-green-50';
      case 'In Progress':
        return 'text-blue-600 bg-blue-50';
      case 'Pending':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const statsCards = [
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
            <p className="text-gray-600 mt-1">Fleet overview and key metrics</p>
          </div>
          <div className="flex items-center gap-3">
            {showInstallPrompt && (
              <button
                onClick={() => {
                  if ((window as any).showInstallPrompt) {
                    (window as any).showInstallPrompt();
                    setShowInstallPrompt(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#714b67' }}
                title="Install FleetFlow as an app"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Install App</span>
              </button>
            )}
            <button
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
              <Truck className="w-6 h-6 text-white animate-pulse" />
            </div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fleet Status</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.availableVehicles}/{stats.totalVehicles}</p>
                    <p className="text-xs text-gray-500 mt-1">Available vehicles</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#714b67' }}
                  >
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drivers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.availableDrivers}/{stats.totalDrivers}</p>
                    <p className="text-xs text-gray-500 mt-1">Available drivers</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Trips</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeTrips}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.pendingTrips} pending</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fleet ROI</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.fleetROI.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">${stats.totalRevenue.toFixed(0)} revenue</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Alerts */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5" style={{ color: '#714b67' }} />
                  <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                </div>

                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">All systems operational</p>
                    <p className="text-sm text-gray-500 mt-1">No pending actions required</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          alert.type === 'warning'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{alert.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          </div>
                          <a
                            href={alert.link}
                            className="text-sm font-medium hover:underline ml-4"
                            style={{ color: '#714b67' }}
                          >
                            {alert.action} →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5" style={{ color: '#714b67' }} />
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Start by adding vehicles and drivers to your fleet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                            <Icon className="w-4 h-4" style={{ color: '#714b67' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(new Date(activity.time), 'MMM dd, h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/dashboard/trips"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#714b67' }}
                  >
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Create Trip</span>
                </a>
                <a
                  href="/dashboard/expenses"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Log Expense</span>
                </a>
                <a
                  href="/dashboard/service"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Service Log</span>
                </a>
                <a
                  href="/dashboard/analytics"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Analytics</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
