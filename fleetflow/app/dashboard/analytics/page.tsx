'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download, DollarSign, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { calculateFuelEfficiency, calculateVehicleROI, getFleetPerformance, type FuelEfficiencyData, type VehicleROI } from '@/lib/analytics';
import { exportFuelEfficiencyCSV, exportROICSV } from '@/lib/export';

export default function AnalyticsPage() {
  const [fuelEfficiency, setFuelEfficiency] = useState<FuelEfficiencyData[]>([]);
  const [vehicleROI, setVehicleROI] = useState<VehicleROI[]>([]);
  const [performance, setPerformance] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    avgROI: 0,
    avgFuelEfficiency: 0,
    totalTripsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fuel' | 'roi'>('roi');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [fuelData, roiData, perfData] = await Promise.all([
        calculateFuelEfficiency(),
        calculateVehicleROI(),
        getFleetPerformance(),
      ]);
      setFuelEfficiency(fuelData);
      setVehicleROI(roiData);
      setPerformance(perfData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Hub</h1>
            <p className="text-gray-600 mt-1">Fleet performance metrics and insights</p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{performance.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{performance.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold mt-1 ${performance.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{performance.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#714b67' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Fuel Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performance.avgFuelEfficiency.toFixed(1)} km/L
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('roi')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'roi'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vehicle ROI
              </button>
              <button
                onClick={() => setActiveTab('fuel')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'fuel'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fuel Efficiency
              </button>
            </div>
          </div>

          {/* ROI Tab */}
          {activeTab === 'roi' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Return on Investment by Vehicle</h3>
                <button
                  onClick={() => exportROICSV(vehicleROI)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Export</span>
                </button>
              </div>
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
                        Net Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Revenue/Trip
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicleROI.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No ROI data available. Complete some trips to see analytics!
                        </td>
                      </tr>
                    ) : (
                      vehicleROI.map((vehicle) => (
                        <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.vehicle_registration}</div>
                              <div className="text-sm text-gray-500">{vehicle.vehicle_type}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.trips_completed}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              ₹{vehicle.total_revenue.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-red-600">
                              ₹{vehicle.total_expenses.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${vehicle.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{vehicle.net_profit.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${vehicle.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {vehicle.roi_percentage.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{vehicle.avg_revenue_per_trip.toLocaleString()}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fuel Efficiency Tab */}
          {activeTab === 'fuel' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Fuel Efficiency by Vehicle</h3>
                <button
                  onClick={() => exportFuelEfficiencyCSV(fuelEfficiency)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Export</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fuel Consumed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Efficiency
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
                    {fuelEfficiency.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No fuel efficiency data available. Complete some trips with fuel expenses!
                        </td>
                      </tr>
                    ) : (
                      fuelEfficiency.map((vehicle) => (
                        <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.vehicle_registration}</div>
                              <div className="text-sm text-gray-500">{vehicle.vehicle_type}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.total_distance.toLocaleString()} km</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.fuel_consumed.toFixed(1)} L</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-blue-600">
                              {vehicle.fuel_efficiency.toFixed(1)} km/L
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{vehicle.total_fuel_cost.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{vehicle.cost_per_km.toFixed(2)}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
