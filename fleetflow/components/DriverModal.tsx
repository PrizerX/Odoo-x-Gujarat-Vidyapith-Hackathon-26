'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { createDriver, updateDriver, checkLicenseStatus, type Driver, type DriverInput } from '@/lib/drivers';

interface DriverModalProps {
  driver: Driver | null;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Driver Add/Edit Modal Component
 * Form modal for creating and updating drivers with license validation.
 * Enforces unique license numbers and future expiry dates.
 */
export default function DriverModal({ driver, onClose, onSave }: DriverModalProps) {
  const [formData, setFormData] = useState<DriverInput>({
    name: '',
    license_number: '',
    license_expiry: '',
    status: 'Available',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driver) {
      // Handle license_expiry which could be a Date object or string
      const expiryDate = typeof driver.license_expiry === 'string' 
        ? driver.license_expiry.split('T')[0]
        : new Date(driver.license_expiry).toISOString().split('T')[0];
      
      setFormData({
        name: driver.name,
        license_number: driver.license_number,
        license_expiry: expiryDate,
        status: driver.status,
      });
    }
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Driver name is required');
      return;
    }

    if (!formData.license_number.trim()) {
      setError('License number is required');
      return;
    }

    if (!formData.license_expiry) {
      setError('License expiry date is required');
      return;
    }

    // Check if license is already expired
    const licenseStatus = checkLicenseStatus(formData.license_expiry);
    if (licenseStatus === 'expired') {
      setError('Cannot add driver with expired license. Please provide a valid license expiry date.');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (driver) {
        // Update existing driver
        result = await updateDriver(driver.id, formData);
      } else {
        // Create new driver
        result = await createDriver(formData);
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

  // Get min date for license expiry (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {driver ? 'Edit Driver' : 'Add New Driver'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
              License Number *
            </label>
            <input
              type="text"
              id="license_number"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              required
              placeholder="e.g., DL-1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="license_expiry" className="block text-sm font-medium text-gray-700 mb-1">
              License Expiry Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="license_expiry"
                name="license_expiry"
                value={formData.license_expiry}
                onChange={handleChange}
                required
                min={today}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
            {formData.license_expiry && checkLicenseStatus(formData.license_expiry) === 'expiring' && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ License expires within 30 days
              </p>
            )}
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
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
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
              {loading ? 'Saving...' : driver ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
