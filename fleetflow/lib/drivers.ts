import { getDB } from './db';

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_expiry: string;
  status: 'Available' | 'On Trip' | 'On Leave' | 'Suspended';
  created_at: string;
}

export type DriverInput = Omit<Driver, 'id' | 'created_at'>;

/**
 * Check if a driver's license is expired or expiring soon.
 * Returns status: 'expired', 'expiring' (within 30 days), or 'valid'.
 */
export function checkLicenseStatus(expiryDate: string): 'expired' | 'expiring' | 'valid' {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

/**
 * Fetch all drivers from the database.
 * Optionally filter by status.
 */
export async function getDrivers(status?: string): Promise<Driver[]> {
  const db = await getDB();
  const query = status
    ? 'SELECT * FROM drivers WHERE status = $1 ORDER BY created_at DESC'
    : 'SELECT * FROM drivers ORDER BY created_at DESC';
  
  const result = status 
    ? await db.query(query, [status])
    : await db.query(query);
  
  return result.rows as Driver[];
}

/**
 * Fetch a single driver by ID.
 */
export async function getDriverById(id: number): Promise<Driver | null> {
  const db = await getDB();
  const result = await db.query('SELECT * FROM drivers WHERE id = $1', [id]);
  return result.rows.length > 0 ? (result.rows[0] as Driver) : null;
}

/**
 * Create a new driver in the database.
 * Validates that license number is unique.
 */
export async function createDriver(driver: DriverInput): Promise<{ success: boolean; message: string; driver?: Driver }> {
  try {
    const db = await getDB();

    // Check if license number already exists
    const existing = await db.query(
      'SELECT id FROM drivers WHERE license_number = $1',
      [driver.license_number]
    );

    if (existing.rows.length > 0) {
      return { success: false, message: 'License number already exists' };
    }

    // Insert new driver
    const result = await db.query(
      `INSERT INTO drivers (name, license_number, license_expiry, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [driver.name, driver.license_number, driver.license_expiry, driver.status]
    );

    return {
      success: true,
      message: 'Driver created successfully',
      driver: result.rows[0] as Driver,
    };
  } catch (error) {
    console.error('Create driver error:', error);
    return { success: false, message: 'Failed to create driver' };
  }
}

/**
 * Update an existing driver.
 * Validates license number uniqueness if it's being changed.
 */
export async function updateDriver(
  id: number,
  updates: Partial<DriverInput>
): Promise<{ success: boolean; message: string; driver?: Driver }> {
  try {
    const db = await getDB();

    // If license number is being updated, check uniqueness
    if (updates.license_number) {
      const existing = await db.query(
        'SELECT id FROM drivers WHERE license_number = $1 AND id != $2',
        [updates.license_number, id]
      );

      if (existing.rows.length > 0) {
        return { success: false, message: 'License number already exists' };
      }
    }

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const result = await db.query(
      `UPDATE drivers SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Driver not found' };
    }

    return {
      success: true,
      message: 'Driver updated successfully',
      driver: result.rows[0] as Driver,
    };
  } catch (error) {
    console.error('Update driver error:', error);
    return { success: false, message: 'Failed to update driver' };
  }
}

/**
 * Delete a driver permanently from the database.
 * Should only be used if driver has no associated trips.
 */
export async function deleteDriver(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();
    
    // Check if driver has any trips
    const trips = await db.query('SELECT id FROM trips WHERE driver_id = $1 LIMIT 1', [id]);
    
    if (trips.rows.length > 0) {
      return { 
        success: false, 
        message: 'Cannot delete driver with existing trips. Consider suspending instead.' 
      };
    }

    const result = await db.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return { success: false, message: 'Driver not found' };
    }

    return { success: true, message: 'Driver deleted successfully' };
  } catch (error) {
    console.error('Delete driver error:', error);
    return { success: false, message: 'Failed to delete driver' };
  }
}

/**
 * Update driver status.
 * Used for status changes during operations (Available, On Trip, On Leave, Suspended).
 */
export async function updateDriverStatus(
  id: number,
  status: Driver['status']
): Promise<{ success: boolean; message: string }> {
  return updateDriver(id, { status });
}

/**
 * Get all drivers with valid (non-expired) licenses.
 * Used for trip assignment validation.
 */
export async function getAvailableDrivers(): Promise<Driver[]> {
  const drivers = await getDrivers('Available');
  return drivers.filter(driver => checkLicenseStatus(driver.license_expiry) !== 'expired');
}

/**
 * Check if a driver can be assigned to a trip.
 * Strict rule: License must not be expired.
 */
export async function canAssignDriver(driverId: number): Promise<{ canAssign: boolean; reason?: string }> {
  const driver = await getDriverById(driverId);
  
  if (!driver) {
    return { canAssign: false, reason: 'Driver not found' };
  }

  if (driver.status !== 'Available') {
    return { canAssign: false, reason: `Driver is ${driver.status.toLowerCase()}` };
  }

  const licenseStatus = checkLicenseStatus(driver.license_expiry);
  if (licenseStatus === 'expired') {
    return { canAssign: false, reason: 'Driver license has expired' };
  }

  return { canAssign: true };
}
