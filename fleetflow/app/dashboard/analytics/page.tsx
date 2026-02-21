'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Fuel, Activity, Target } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getFleetPerformance,
  calculateFuelEfficiency,
  calculateVehicleROI,
  getExpenseBreakdown,
  type FleetPerformance,
  type FuelEfficiency,
  type VehicleROI,
  type ExpenseBreakdown,
} from '@/lib/analytics';

/**
 * Analytics Hub
 * Performance metrics, fuel efficiency, and ROI calculations for fleet optimization.
 * Data-driven insights for cost reduction and operational excellence.
 */
export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [fleetPerformance, setFleetPerformance] = useState<FleetPerformance | null>(null);
  const [fuelEfficiency, setFuelEfficiency] = useState<FuelEfficiency[]>([]);
  const [vehicleROI, setVehicleROI] = useState<VehicleROI[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const [performance, efficiency, roi, breakdown] = await Promise.all([
      getFleetPerformance(),
      calculateFuelEfficiency(),
      calculateVehicleROI(),
      getExpenseBreakdown(),
    ]);

    setFleetPerformance(performance);
    setFuelEfficiency(efficiency);
    setVehicleROI(roi);
    setExpenseBreakdown(breakdown);
    setLoading(false);
  };

  const getROIColor = (roi: number) => {
    if (roi >= 50) return 'text-green-600';
    if (roi >= 20) return 'text-blue-600';
    if (roi >= 0) return 'text-gray-600';
    return 'text-red-600';
  };

  const getROIBackground = (roi: number) => {
    if (roi >= 50) return 'bg-green-50';
    if (roi >= 20) return 'bg-blue-50';
    if (roi >= 0) return 'bg-gray-50';
    return 'bg-red-50';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Hub</h1>
          <p className="text-gray-600 mt-1">Performance metrics and fleet optimization insights</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
              <BarChart3 className="w-6 h-6 text-white animate-pulse" />
            </div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Fleet Performance Overview */}
            {fleetPerformance && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fleet Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {fleetPerformance.active_vehicles}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fleetPerformance.vehicles_on_trip} on trip, {fleetPerformance.vehicles_in_shop} in shop
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">Trips Completed</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {fleetPerformance.completed_trips}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fleetPerformance.in_progress_trips} in progress, {fleetPerformance.pending_trips} pending
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${fleetPerformance.total_revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ${fleetPerformance.total_expenses.toFixed(2)} expenses
                    </p>
                  </div>

                  <div className={`rounded-lg shadow p-4 ${getROIBackground(fleetPerformance.fleet_roi)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`w-5 h-5 ${getROIColor(fleetPerformance.fleet_roi)}`} />
                      <p className="text-sm font-medium text-gray-600">Fleet ROI</p>
                    </div>
                    <p className={`text-2xl font-bold ${getROIColor(fleetPerformance.fleet_roi)}`}>
                      {fleetPerformance.fleet_roi.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ${fleetPerformance.net_profit.toFixed(2)} net profit
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Fuel Efficiency */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fuel Efficiency</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {fuelEfficiency.length === 0 ? (
                <div className="text-center py-12">
                  <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No fuel efficiency data available</p>
                  <p className="text-sm text-gray-500 mt-2">Complete trips and log fuel expenses to see metrics</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance (km)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fuel (L)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Efficiency (km/L)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fuel Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost/km
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fuelEfficiency.map((vehicle) => (
                        <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.vehicle_registration}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vehicle.vehicle_type}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {vehicle.total_distance.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {vehicle.fuel_consumed.toFixed(1)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-blue-600">
                              {vehicle.fuel_efficiency.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${vehicle.total_fuel_cost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${vehicle.cost_per_km.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Vehicle ROI */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle ROI Analysis</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {vehicleROI.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No ROI data available</p>
                  <p className="text-sm text-gray-500 mt-2">Complete trips and log expenses to calculate ROI</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trips
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expenses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ROI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg/Trip
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehicleROI.map((vehicle) => (
                        <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.vehicle_registration}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vehicle.vehicle_type}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {vehicle.trips_completed}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            ${vehicle.total_revenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-medium">
                            ${vehicle.total_expenses.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-semibold ${vehicle.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${vehicle.net_profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getROIColor(vehicle.roi_percentage)} ${getROIBackground(vehicle.roi_percentage)}`}>
                              {vehicle.roi_percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${vehicle.avg_revenue_per_trip.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Expense Breakdown</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {expenseBreakdown.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No expense data available</p>
                  <p className="text-sm text-gray-500 mt-2">Log expenses to see breakdown</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseBreakdown.map((category) => (
                    <div key={category.type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-900">
                            {category.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.count} transactions
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-semibold text-gray-900">
                            ${category.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: '#714b67',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
