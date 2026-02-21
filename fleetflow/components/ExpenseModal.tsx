'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import { createExpense, updateExpense, type Expense, type ExpenseInput } from '@/lib/expenses';
import { getVehicles, type Vehicle } from '@/lib/vehicles';

interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Expense Modal Component
 * Form modal for logging fuel and maintenance expenses against vehicles.
 * Tracks costs for ROI and fuel efficiency calculations.
 */
export default function ExpenseModal({ expense, onClose, onSave }: ExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseInput>({
    vehicle_id: 0,
    type: 'Fuel',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicle_id: expense.vehicle_id,
        type: expense.type,
        amount: expense.amount,
        date: expense.date.split('T')[0],
        description: expense.description || '',
      });
    }
  }, [expense]);

  const loadVehicles = async () => {
    // Get all non-retired vehicles
    const allVehicles = await getVehicles(false);
    setVehicles(allVehicles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vehicle_id') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else if (name === 'amount') {
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

    if (!formData.type) {
      setError('Please select expense type');
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.date) {
      setError('Date is required');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (expense) {
        // Update existing expense
        result = await updateExpense(expense.id, formData);
      } else {
        // Create new expense
        result = await createExpense(formData);
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
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" style={{ color: '#714b67' }} />
            <h2 className="text-xl font-bold text-gray-900">
              {expense ? 'Edit Expense' : 'Log New Expense'}
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

          {/* Vehicle Selection */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value={0}>Select a vehicle...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Insurance">Insurance</option>
              <option value="Registration">Registration</option>
              <option value="Repairs">Repairs</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Amount ($) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 150.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date *
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add notes about this expense..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
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
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#714b67' }}
            >
              {loading ? 'Saving...' : expense ? 'Update Expense' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
