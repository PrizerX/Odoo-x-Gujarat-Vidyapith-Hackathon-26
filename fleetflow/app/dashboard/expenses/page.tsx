'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ExpenseModal from '@/components/ExpenseModal';
import { getExpenses, deleteExpense, calculateTotalExpenses, type Expense } from '@/lib/expenses';
import { format } from 'date-fns';

/**
 * Expense Tracker Page
 * Log and manage fuel and maintenance costs for fleet vehicles.
 * Data feeds into Analytics Hub for ROI and efficiency calculations.
 */
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [fuelTotal, setFuelTotal] = useState(0);
  const [maintenanceTotal, setMaintenanceTotal] = useState(0);

  useEffect(() => {
    loadExpenses();
    loadTotals();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const data = await getExpenses();
    setExpenses(data);
    setLoading(false);
  };

  const loadTotals = async () => {
    const total = await calculateTotalExpenses();
    const fuel = await calculateTotalExpenses(undefined, 'Fuel');
    const maintenance = await calculateTotalExpenses(undefined, 'Maintenance');
    
    setTotalExpenses(total);
    setFuelTotal(fuel);
    setMaintenanceTotal(maintenance);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      const result = await deleteExpense(id);
      if (result.success) {
        loadExpenses();
        loadTotals();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    loadExpenses();
    loadTotals();
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = 
      expense.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || expense.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Fuel':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-800';
      case 'Insurance':
        return 'bg-purple-100 text-purple-800';
      case 'Registration':
        return 'bg-green-100 text-green-800';
      case 'Repairs':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600 mt-1">Monitor fleet costs and expenses</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: '#714b67' }}
          >
            <Plus className="w-5 h-5" />
            Log Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{expenses.length} transactions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Fuel Costs</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">${fuelTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalExpenses > 0 ? ((fuelTotal / totalExpenses) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-gray-600">Maintenance Costs</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">${maintenanceTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalExpenses > 0 ? ((maintenanceTotal / totalExpenses) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vehicle, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            >
              <option value="all">All Types</option>
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Insurance">Insurance</option>
              <option value="Registration">Registration</option>
              <option value="Repairs">Repairs</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
                <DollarSign className="w-6 h-6 text-white animate-pulse" />
              </div>
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expenses found</p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-sm font-medium"
                style={{ color: '#714b67' }}
              >
                Log your first expense
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.vehicle_registration}
                        </div>
                        <div className="text-xs text-gray-500">
                          {expense.vehicle_type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill ${getTypeColor(expense.type)}`}>
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {expense.description ? (
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={expense.description}>
                            {expense.description}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No description</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1 rounded-md transition-colors"
                            style={{ color: '#714b67' }}
                            title="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete expense"
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
      </div>

      {/* Modal */}
      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
