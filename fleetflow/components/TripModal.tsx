'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Truck, User, Package, MapPin, Calendar } from 'lucide-react';
import { createTrip, updateTrip, type Trip, type TripInput } from '@/lib/trips';
import { getVehicles, type Vehicle } from '@/lib/vehicles';
import { getAvailableDrivers, type Driver } from '@/lib/drivers';

interface TripModalProps {
  trip: Trip | null;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Trip Add/Edit Modal Component
 * Form modal for creating and updating trips with strict validation.
 * Enforces business rules: cargo weight <= vehicle capacity, valid driver license, available vehicles.
 */
export default function TripModal({ trip, onClose, onSave }: TripModalProps) {
  const [formData, setFormData] = useState<TripInput>({
    vehicle_id: 0,
    driver_id: 0,
    cargo_weight: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'Pending',
    origin: '',
    destination: '',
  });
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableResources();
  }, []);

  useEffect(() => {
    if (trip) {
      setFormData({
        vehicle_id: trip.vehicle_id,
        driver_id: trip.driver_id,
        cargo_weight: trip.cargo_weight,
        start_date: trip.start_date.split('T')[0],
        end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
        status: trip.status,
        origin: trip.origin,
        destination: trip.destination,
      });
    }
  }, [trip]);

  const loadAvailableResources = async () => {
    // Get only available vehicles (not retired, status = Available)
    const allVehicles = await getVehicles(false);
    const available = allVehicles.filter(v => v.status === 'Available');
    setAvailableVehicles(available);

    // Get only drivers with valid (non-expired) licenses
    const drivers = await getAvailableDrivers();
    setAvailableDrivers(drivers);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for vehicle selection
    if (name === 'vehicle_id') {
      const vehicleId = parseInt(value);
      const vehicle = availableVehicles.find(v => v.id === vehicleId);
      setSelectedVehicle(vehicle || null);
      setFormData({ ...formData, [name]: vehicleId });
    } else if (name === 'cargo_weight') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.vehicle_id || formData.vehicle_id === 0) {
      setError('Please select a vehicle');
      return;
    }

    if (!formData.driver_id || formData.driver_id === 0) {
      setError('Please select a driver');
      return;
    }

    if (!formData.cargo_weight || formData.cargo_weight <= 0) {
      setError('Cargo weight must be greater than 0');
      return;
    }

    if (!formData.origin.trim()) {
      setError('Origin is required');
      return;
    }

    if (!formData.destination.trim()) {
      setError('Destination is required');
      return;
    }

    if (!formData.start_date) {
      setError('Start date is required');
      return;
    }

    // Client-side capacity validation
    if (selectedVehicle && formData.cargo_weight > selectedVehicle.max_capacity) {
      setError(
        `Cargo weight (${formData.cargo_weight} kg) exceeds vehicle capacity (${selectedVehicle.max_capacity} kg)`
      );
      return;
    }

    setLoading(true);

    try {
      let result;
      if (trip) {
        // Update existing trip
        result = await updateTrip(trip.id, formData);
      } else {
        // Create new trip
        result = await createTrip(formData);
      }

      if (result.success) {
        onSave();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {trip ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Vehicle Selection */}
          <div>
            <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700 mb-1">
              <Truck className="w-4 h-4 inline mr-1" />
              Vehicle *
            </label>
            <select
              id="vehicle_id"
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              required
              disabled={!!trip} // Can't change vehicle on existing trip
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value={0}>Select a vehicle...</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration} - {vehicle.type} (Capacity: {vehicle.max_capacity} kg)
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No available vehicles. All vehicles are either in use or retired.
              </p>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label htmlFor="driver_id" className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Driver *
            </label>
            <select
              id="driver_id"
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              required
              disabled={!!trip} // Can't change driver on existing trip
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value={0}>Select a driver...</option>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - License: {driver.license_number}
                </option>
              ))}
            </select>
            {availableDrivers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No available drivers with valid licenses. Check driver profiles.
              </p>
            )}
          </div>

          {/* Cargo Weight */}
          <div>
            <label htmlFor="cargo_weight" className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="w-4 h-4 inline mr-1" />
              Cargo Weight (kg) *
            </label>
            <input
              type="number"
              id="cargo_weight"
              name="cargo_weight"
              value={formData.cargo_weight || ''}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
            {selectedVehicle && (
              <p className="text-xs text-gray-500 mt-1">
                Vehicle capacity: {selectedVehicle.max_capacity} kg
              </p>
            )}
            {selectedVehicle && formData.cargo_weight > selectedVehicle.max_capacity && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Cargo weight exceeds vehicle capacity!
              </p>
            )}
          </div>

          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Origin *
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                placeholder="e.g., Mumbai"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Destination *
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="e.g., Delhi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date (Optional)
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                min={formData.start_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableVehicles.length === 0 || availableDrivers.length === 0}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#714b67' }}
            >
              {loading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
