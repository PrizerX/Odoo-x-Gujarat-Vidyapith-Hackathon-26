'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, DollarSign, TrendingUp, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ExpenseModal from '@/components/ExpenseModal';
import { getExpenses, deleteExpense, calculateTotalExpenses, createExpense, updateExpense, type Expense } from '@/lib/expenses';
import { exportExpensesCSV } from '@/lib/export';
import { format } from 'date-fns';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [summary, setSummary] = useState<{ total: number; byType: Record<string, number>; byVehicle: Array<{ vehicle_registration: string; total: number }> }>({ total: 0, byType: {}, byVehicle: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, filterType]);

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      const summaryData = await calculateTotalExpenses();
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.vehicle_registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleAddNew = () => {
    setSelectedExpense(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        await loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  const handleSave = async (expense: Omit<Expense, 'id' | 'created_at' | 'vehicle_registration' | 'vehicle_type'>) => {
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, expense);
      } else {
        await createExpense(expense);
      }
      await loadExpenses();
    } catch (error) {
      console.error('Failed to save expense:', error);
      throw error;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fuel': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading expenses...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600 mt-1">Monitor fleet costs and expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportExpensesCSV(filteredExpenses)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Export to CSV"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Export</span>
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: '#714b67' }}
            >
              <Plus className="w-5 h-5" />
              Log Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{summary.total.toLocaleString()}
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
                <p className="text-sm text-gray-600">Fuel Costs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(summary.byType.fuel || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{((summary.byType.maintenance || 0) + (summary.byType.repair || 0)).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No expenses found. Log your first expense to get started!
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.vehicle_registration}</div>
                          <div className="text-sm text-gray-500">{expense.vehicle_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(expense.type)}`}>
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">₹{expense.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{format(new Date(expense.date), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{expense.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vehicles by Expense */}
        {summary.byVehicle.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vehicles by Expense</h3>
            <div className="space-y-3">
              {summary.byVehicle.slice(0, 5).map((vehicle) => (
                <div key={vehicle.vehicle_registration} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{vehicle.vehicle_registration}</span>
                  <span className="text-sm font-bold text-gray-900">₹{vehicle.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        expense={selectedExpense}
      />
    </DashboardLayout>
  );
}
