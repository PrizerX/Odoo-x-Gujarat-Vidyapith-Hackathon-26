'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';
import { getDrivers, deleteDriver, checkLicenseStatus, type Driver } from '@/lib/drivers';
import DriverModal from '@/components/DriverModal';
import { exportDriversCSV } from '@/lib/export';

/**
 * Driver Profiles Page
 * CRUD interface for managing drivers with license compliance tracking.
 * Includes license expiry warnings and strict validation rules.
 */
export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    const data = await getDrivers();
    setDrivers(data);
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      const result = await deleteDriver(id);
      if (result.success) {
        loadDrivers();
      } else {
        alert(result.message);
      }
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    loadDrivers();
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'status-pill status-available';
      case 'On Trip':
        return 'status-pill status-on-trip';
      case 'On Leave':
        return 'status-pill bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'status-pill status-suspended';
      default:
        return 'status-pill';
    }
  };

  const getLicenseExpiryBadge = (expiryDate: string) => {
    const status = checkLicenseStatus(expiryDate);
    const expiry = new Date(expiryDate).toLocaleDateString();

    switch (status) {
      case 'expired':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Expired {expiry}</span>
          </div>
        );
      case 'expiring':
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Expires {expiry}</span>
          </div>
        );
      case 'valid':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Valid until {expiry}</span>
          </div>
        );
    }
  };

  // Calculate stats
  const expiredCount = drivers.filter(d => checkLicenseStatus(d.license_expiry) === 'expired').length;
  const expiringCount = drivers.filter(d => checkLicenseStatus(d.license_expiry) === 'expiring').length;
  const availableCount = drivers.filter(d => d.status === 'Available' && checkLicenseStatus(d.license_expiry) !== 'expired').length;

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Profiles</h1>
            <p className="text-gray-600 mt-1">Manage drivers and track license compliance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportDriversCSV(filteredDrivers)}
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
              Add Driver
            </button>
          </div>
        </div>

        {/* Compliance Warnings */}
        {(expiredCount > 0 || expiringCount > 0) && (
          <div className="mb-6 space-y-2">
            {expiredCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {expiredCount} driver{expiredCount > 1 ? 's have' : ' has'} expired license{expiredCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    These drivers cannot be assigned to trips until licenses are renewed.
                  </p>
                </div>
              </div>
            )}
            {expiringCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    {expiringCount} driver{expiringCount > 1 ? 's have' : ' has'} license{expiringCount > 1 ? 's' : ''} expiring within 30 days
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please ensure timely renewal to avoid operational disruptions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#714b67' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: '#714b67' }}>
                <span className="text-white">👤</span>
              </div>
              <p className="text-gray-600">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No drivers found</p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-sm font-medium"
                style={{ color: '#714b67' }}
              >
                Add your first driver
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Status
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
                  {filteredDrivers.map((driver) => {
                    const licenseStatus = checkLicenseStatus(driver.license_expiry);
                    return (
                      <tr 
                        key={driver.id}
                        className={licenseStatus === 'expired' ? 'bg-red-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {driver.license_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getLicenseExpiryBadge(driver.license_expiry)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusStyle(driver.status)}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(driver)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(driver.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Total Drivers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{drivers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{expiringCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{expiredCount}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DriverModal
          driver={editingDriver}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
