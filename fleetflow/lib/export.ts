/**
 * CSV Export Utilities
 * Functions to export data from FleetFlow modules to CSV format.
 */

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return '';

  // Create CSV header
  const csvHeaders = headers.join(',');

  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export vehicles to CSV
 */
export function exportVehiclesCSV(vehicles: any[]): void {
  const headers = ['registration', 'type', 'max_capacity', 'status', 'retired', 'created_at'];
  const csvContent = arrayToCSV(vehicles, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-vehicles-${timestamp}.csv`);
}

/**
 * Export drivers to CSV
 */
export function exportDriversCSV(drivers: any[]): void {
  const headers = ['name', 'license_number', 'license_expiry', 'status', 'created_at'];
  const csvContent = arrayToCSV(drivers, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-drivers-${timestamp}.csv`);
}

/**
 * Export trips to CSV
 */
export function exportTripsCSV(trips: any[]): void {
  const headers = [
    'vehicle_registration',
    'vehicle_type',
    'driver_name',
    'cargo_weight',
    'origin',
    'destination',
    'distance',
    'revenue',
    'start_date',
    'end_date',
    'status',
    'created_at'
  ];
  const csvContent = arrayToCSV(trips, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-trips-${timestamp}.csv`);
}

/**
 * Export expenses to CSV
 */
export function exportExpensesCSV(expenses: any[]): void {
  const headers = [
    'vehicle_registration',
    'vehicle_type',
    'type',
    'amount',
    'date',
    'description',
    'created_at'
  ];
  const csvContent = arrayToCSV(expenses, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-expenses-${timestamp}.csv`);
}

/**
 * Export service logs to CSV
 */
export function exportServiceLogsCSV(serviceLogs: any[]): void {
  const headers = [
    'vehicle_registration',
    'vehicle_type',
    'issue',
    'resolution',
    'date',
    'status',
    'created_at'
  ];
  const csvContent = arrayToCSV(serviceLogs, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-service-logs-${timestamp}.csv`);
}

/**
 * Export analytics fuel efficiency to CSV
 */
export function exportFuelEfficiencyCSV(data: any[]): void {
  const headers = [
    'vehicle_registration',
    'vehicle_type',
    'total_distance',
    'fuel_consumed',
    'fuel_efficiency',
    'total_fuel_cost',
    'cost_per_km'
  ];
  const csvContent = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-fuel-efficiency-${timestamp}.csv`);
}

/**
 * Export analytics ROI to CSV
 */
export function exportROICSV(data: any[]): void {
  const headers = [
    'vehicle_registration',
    'vehicle_type',
    'trips_completed',
    'total_revenue',
    'total_expenses',
    'net_profit',
    'roi_percentage',
    'avg_revenue_per_trip'
  ];
  const csvContent = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fleetflow-vehicle-roi-${timestamp}.csv`);
}
