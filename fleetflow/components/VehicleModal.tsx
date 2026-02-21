'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createVehicle, updateVehicle, type Vehicle, type VehicleInput } from '@/lib/vehicles';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Vehicle Add/Edit Modal Component
 * Form modal for creating and updating vehicles with validation.
 * Enforces unique registration numbers and required fields.
 */
export default function VehicleModal({ vehicle, onClose, onSave }: VehicleModalProps) {
  const [formData, setFormData] = useState<VehicleInput>({
    registration: '',
    type: '',
    max_capacity: 0,
    status: 'Available',
    retired: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registration: vehicle.registration,
        type: vehicle.type,
        max_capacity: vehicle.max_capacity,
        status: vehicle.status,
        retired: vehicle.retired,
      });
    }
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.registration.trim()) {
      setError('Registration number is required');
      return;
    }

    if (!formData.type.trim()) {
      setError('Vehicle type is required');
      return;
    }

    if (formData.max_capacity <= 0) {
      setError('Maximum capacity must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (vehicle) {
        // Update existing vehicle
        result = await updateVehicle(vehicle.id, formData);
      } else {
        // Create new vehicle
        result = await createVehicle(formData);
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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

          <div>
            <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number *
            </label>
            <input
              type="text"
              id="registration"
              name="registration"
              value={formData.registration}
              onChange={handleChange}
              required
              placeholder="e.g., ABC-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type *
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="e.g., Truck, Van, Pickup"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Capacity (kg) *
            </label>
            <input
              type="number"
              id="max_capacity"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              placeholder="e.g., 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

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
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="retired"
              name="retired"
              checked={formData.retired}
              onChange={handleChange}
              className="h-4 w-4 rounded"
              style={{ accentColor: '#714b67' }}
            />
            <label htmlFor="retired" className="ml-2 block text-sm text-gray-700">
              Mark as Retired
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#714b67' }}
            >
              {loading ? 'Saving...' : vehicle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
