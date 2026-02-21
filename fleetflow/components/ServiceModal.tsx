'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Wrench, Calendar, CheckCircle } from 'lucide-react';
import { createServiceLog, updateServiceLog, resolveServiceLog, type ServiceLog, type ServiceLogInput } from '@/lib/service-log';
import { getVehicles, type Vehicle } from '@/lib/vehicles';

interface ServiceModalProps {
  log: ServiceLog | null;
  onClose: () => void;
  onSave: () => void;
  mode?: 'create' | 'edit' | 'resolve';
}

/**
 * Service Log Modal Component
 * Form modal for creating, editing, and resolving service logs.
 * STRICT RULE: Creating a log sets vehicle status to 'In Shop'.
 * Resolving a log sets vehicle status back to 'Available'.
 */
export default function ServiceModal({ log, onClose, onSave, mode = 'create' }: ServiceModalProps) {
  const [formData, setFormData] = useState<ServiceLogInput>({
    vehicle_id: 0,
    issue: '',
    resolution: '',
    date: new Date().toISOString().split('T')[0],
    status: 'In Progress',
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (log) {
      setFormData({
        vehicle_id: log.vehicle_id,
        issue: log.issue,
        resolution: log.resolution || '',
        date: log.date.split('T')[0],
        status: log.status,
      });
    }
  }, [log]);

  const loadVehicles = async () => {
    // Get all vehicles (including those in shop for editing existing logs)
    const allVehicles = await getVehicles(false);
    setVehicles(allVehicles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vehicle_id') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation for create/edit
    if (mode !== 'resolve') {
      if (!formData.vehicle_id || formData.vehicle_id === 0) {
        setError('Please select a vehicle');
        return;
      }

      if (!formData.issue || !formData.issue.trim()) {
        setError('Issue description is required');
        return;
      }

      if (!formData.date) {
        setError('Service date is required');
        return;
      }
    }

    // Validation for resolve
    if (mode === 'resolve') {
      if (!formData.resolution || !formData.resolution.trim()) {
        setError('Resolution description is required');
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      
      if (mode === 'resolve' && log) {
        // Resolve the service log
        result = await resolveServiceLog(log.id, formData.resolution);
      } else if (log && mode === 'edit') {
        // Update existing log
        result = await updateServiceLog(log.id, formData);
      } else {
        // Create new log
        result = await createServiceLog(formData);
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

  const isResolveMode = mode === 'resolve';
  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {isResolveMode ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Wrench className="w-6 h-6" style={{ color: '#714b67' }} />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {isResolveMode ? 'Resolve Service' : isEditMode ? 'Edit Service Log' : 'Log New Service'}
            </h2>
          </div>
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

          {/* Info Banner for Create */}
          {!isResolveMode && !log && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Auto-Status Management:</p>
                <p className="mt-1">
                  Logging a vehicle will automatically set its status to <span className="font-semibold">"In Shop"</span>, 
                  removing it from the dispatcher's available pool.
                </p>
              </div>
            </div>
          )}

          {/* Info Banner for Resolve */}
          {isResolveMode && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Resolving Service:</p>
                <p className="mt-1">
                  This will set the vehicle status back to <span className="font-semibold">"Available"</span>, 
                  returning it to the dispatcher's pool.
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Selection */}
          {!isResolveMode && (
            <div>
              <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle *
              </label>
              <select
                id="vehicle_id"
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                disabled={!!log} // Can't change vehicle on existing log
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              >
                <option value={0}>Select a vehicle...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration} - {vehicle.type} ({vehicle.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display Vehicle Info in Resolve Mode */}
          {isResolveMode && log && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Vehicle</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {log.vehicle_registration} - {log.vehicle_type}
              </p>
            </div>
          )}

          {/* Issue Description */}
          {!isResolveMode && (
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description *
              </label>
              <textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the issue or maintenance required..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
          )}

          {/* Display Issue in Resolve Mode */}
          {isResolveMode && log && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Issue</p>
              <p className="text-gray-900 mt-1">{log.issue}</p>
            </div>
          )}

          {/* Resolution */}
          <div>
            <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
              Resolution {isResolveMode ? '*' : '(Optional)'}
            </label>
            <textarea
              id="resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              required={isResolveMode}
              rows={4}
              placeholder="Describe how the issue was resolved..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          {/* Service Date */}
          {!isResolveMode && (
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Service Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
          )}

          {/* Status */}
          {!isResolveMode && isEditMode && (
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
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          )}

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
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isResolveMode ? '#10b981' : '#714b67' }}
            >
              {loading ? 'Saving...' : isResolveMode ? 'Mark as Resolved' : isEditMode ? 'Update Log' : 'Create Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
