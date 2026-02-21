'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Wrench, Clock, CheckCircle, Download, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ServiceModal from '@/components/ServiceModal';
import { getServiceLogs, deleteServiceLog, type ServiceLog } from '@/lib/service-log';
import { exportServiceLogsCSV } from '@/lib/export';
import { format } from 'date-fns';

/**
 * Service Log Page
 * Manage vehicle maintenance and service tracking.
 * STRICT RULE: Logging a vehicle sets status to 'In Shop'.
 * Resolving returns vehicle to 'Available' status.
 */
export default function ServicePage() {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<ServiceLog | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'resolve'>('create');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getServiceLogs();
    setLogs(data);
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingLog(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (log: ServiceLog) => {
    setEditingLog(log);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleResolve = (log: ServiceLog) => {
    setEditingLog(log);
    setModalMode('resolve');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service log?')) {
      const result = await deleteServiceLog(id);
      if (result.success) {
        loadLogs();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    loadLogs();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resolution?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'status-pill bg-amber-100 text-amber-800';
      case 'Resolved':
        return 'status-pill status-available';
      default:
        return 'status-pill';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  // Calculate statistics
  const stats = {
    total: logs.length,
    inProgress: logs.filter(l => l.status === 'In Progress').length,
    resolved: logs.filter(l => l.status === 'Resolved').length,
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Log</h1>
            <p className="text-gray-600 mt-1">Track vehicle maintenance and repairs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportServiceLogsCSV(filteredLogs)}
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
              Log Service
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Auto-Status Management:</p>
            <p className="mt-1">
              Logging a vehicle automatically sets its status to <span className="font-semibold">"In Shop"</span>, 
              removing it from the dispatcher's pool. Resolving a service returns it to <span className="font-semibold">"Available"</span>.
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
                placeholder="Search by vehicle, issue, or resolution..."
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
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#714b67' }}>
                <Wrench className="w-6 h-6 text-white animate-pulse" />
              </div>
              <p className="text-gray-600">Loading service logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No service logs found</p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-sm font-medium"
                style={{ color: '#714b67' }}
              >
                Log your first service
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
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resolution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        log.status === 'In Progress' ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.vehicle_registration}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.vehicle_type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={log.issue}>
                          {log.issue}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.resolution ? (
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={log.resolution}>
                            {log.resolution}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not resolved yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusStyle(log.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.status === 'In Progress' && (
                            <button
                              onClick={() => handleResolve(log)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Resolve service"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-1 rounded-md transition-colors"
                            style={{ color: '#714b67' }}
                            title="Edit log"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete log"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-600">Total Services</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-gray-600">In Progress</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            {stats.inProgress > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {stats.inProgress} vehicle{stats.inProgress !== 1 ? 's' : ''} in shop
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Resolved</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ServiceModal
          log={editingLog}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
