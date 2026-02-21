'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Navigation, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import TripModal from '@/components/TripModal';
import { getTrips, deleteTrip, type Trip } from '@/lib/trips';
import { format } from 'date-fns';

/**
 * Trip Dispatcher Page
 * Manage fleet trips with strict validation rules.
 * Enforces cargo weight <= vehicle capacity and driver license compliance.
 */
export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    const data = await getTrips();
    setTrips(data);
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingTrip(null);
    setShowModal(true);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this trip? This will reset the vehicle and driver status.')) {
      const result = await deleteTrip(id);
      if (result.success) {
        loadTrips();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    loadTrips();
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = 
      trip.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'status-pill bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'status-pill status-on-trip';
      case 'Completed':
        return 'status-pill status-available';
      case 'Cancelled':
        return 'status-pill status-suspended';
      default:
        return 'status-pill';
    }
  };

  // Calculate statistics
  const stats = {
    total: trips.length,
    pending: trips.filter(t => t.status === 'Pending').length,
    inProgress: trips.filter(t => t.status === 'In Progress').length,
    completed: trips.filter(t => t.status === 'Completed').length,
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Dispatcher</h1>
            <p className="text-gray-600 mt-1">Manage fleet trips with cargo validation</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: '#714b67' }}
          >
            <Plus className="w-5 h-5" />
            Create Trip
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Validation Rules:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Cargo weight must not exceed vehicle capacity</li>
              <li>Only drivers with valid (non-expired) licenses can be assigned</li>
              <li>Only Available vehicles can be assigned to new trips</li>
            </ul>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vehicle, driver, origin, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
                <Navigation className="w-6 h-6 text-white animate-spin" />
              </div>
              <p className="text-gray-600">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No trips found</p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-sm font-medium"
                style={{ color: '#714b67' }}
              >
                Create your first trip
              </button>
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
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {trip.vehicle_registration}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.vehicle_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {trip.driver_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {trip.origin} → {trip.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {trip.cargo_weight} kg
                        </div>
                        {trip.vehicle_max_capacity && (
                          <div className="text-xs text-gray-500">
                            of {trip.vehicle_max_capacity} kg
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(trip.start_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusStyle(trip.status)}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(trip)}
                            className="p-1 rounded-md transition-colors"
                            style={{ color: '#714b67' }}
                            title="Edit trip"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete trip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TripModal
          trip={editingTrip}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
