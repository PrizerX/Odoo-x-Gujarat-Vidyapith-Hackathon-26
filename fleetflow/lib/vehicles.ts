import { getDB } from './db';

export interface Vehicle {
  id: number;
  registration: string;
  type: string;
  max_capacity: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Suspended';
  retired: boolean;
  created_at: string;
}

export type VehicleInput = Omit<Vehicle, 'id' | 'created_at'>;

/**
 * Fetch all vehicles from the database.
 * Excludes retired vehicles by default unless includeRetired is true.
 */
export async function getVehicles(includeRetired: boolean = false): Promise<Vehicle[]> {
  const db = await getDB();
  const query = includeRetired
    ? 'SELECT * FROM vehicles ORDER BY created_at DESC'
    : 'SELECT * FROM vehicles WHERE retired = FALSE ORDER BY created_at DESC';
  
  const result = await db.query(query);
  return result.rows as Vehicle[];
}

/**
 * Fetch a single vehicle by ID.
 */
export async function getVehicleById(id: number): Promise<Vehicle | null> {
  const db = await getDB();
  const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows.length > 0 ? (result.rows[0] as Vehicle) : null;
}

/**
 * Create a new vehicle in the database.
 * Validates that registration number is unique.
 */
export async function createVehicle(vehicle: VehicleInput): Promise<{ success: boolean; message: string; vehicle?: Vehicle }> {
  try {
    const db = await getDB();

    // Check if registration already exists
    const existing = await db.query(
      'SELECT id FROM vehicles WHERE registration = $1',
      [vehicle.registration]
    );

    if (existing.rows.length > 0) {
      return { success: false, message: 'Registration number already exists' };
    }

    // Insert new vehicle
    const result = await db.query(
      `INSERT INTO vehicles (registration, type, max_capacity, status, retired) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [vehicle.registration, vehicle.type, vehicle.max_capacity, vehicle.status, vehicle.retired]
    );

    return {
      success: true,
      message: 'Vehicle created successfully',
      vehicle: result.rows[0] as Vehicle,
    };
  } catch (error) {
    console.error('Create vehicle error:', error);
    return { success: false, message: 'Failed to create vehicle' };
  }
}

/**
 * Update an existing vehicle.
 * Validates registration uniqueness if it's being changed.
 */
export async function updateVehicle(
  id: number,
  updates: Partial<VehicleInput>
): Promise<{ success: boolean; message: string; vehicle?: Vehicle }> {
  try {
    const db = await getDB();

    // If registration is being updated, check uniqueness
    if (updates.registration) {
      const existing = await db.query(
        'SELECT id FROM vehicles WHERE registration = $1 AND id != $2',
        [updates.registration, id]
      );

      if (existing.rows.length > 0) {
        return { success: false, message: 'Registration number already exists' };
      }
    }

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const result = await db.query(
      `UPDATE vehicles SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Vehicle not found' };
    }

    return {
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: result.rows[0] as Vehicle,
    };
  } catch (error) {
    console.error('Update vehicle error:', error);
    return { success: false, message: 'Failed to update vehicle' };
  }
}

/**
 * Soft delete a vehicle by setting retired = true.
 * This removes the vehicle from active operations.
 */
export async function retireVehicle(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();
    const result = await db.query(
      'UPDATE vehicles SET retired = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Vehicle not found' };
    }

    return { success: true, message: 'Vehicle retired successfully' };
  } catch (error) {
    console.error('Retire vehicle error:', error);
    return { success: false, message: 'Failed to retire vehicle' };
  }
}

/**
 * Delete a vehicle permanently from the database.
 * Only use this for data cleanup; prefer retireVehicle for normal operations.
 */
export async function deleteVehicle(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();
    const result = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return { success: false, message: 'Vehicle not found' };
    }

    return { success: true, message: 'Vehicle deleted successfully' };
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return { success: false, message: 'Failed to delete vehicle' };
  }
}

/**
 * Update vehicle status.
 * Used for status changes during operations (Available, On Trip, In Shop, Suspended).
 */
export async function updateVehicleStatus(
  id: number,
  status: Vehicle['status']
): Promise<{ success: boolean; message: string }> {
  return updateVehicle(id, { status });
}
