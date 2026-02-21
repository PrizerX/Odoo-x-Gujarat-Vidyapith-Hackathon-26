import { getDB } from './db';
import { canAssignDriver } from './drivers';

export interface Trip {
  id: number;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  start_date: string;
  end_date: string | null;
  status: string;
  origin: string;
  destination: string;
  distance: number;
  revenue: number;
  created_at: string;
  vehicle_registration?: string;
  vehicle_type?: string;
  vehicle_max_capacity?: number;
  driver_name?: string;
}

export interface TripInput {
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  start_date: string;
  end_date?: string;
  status: string;
  origin: string;
  destination: string;
  distance?: number;
  revenue?: number;
}

/**
 * Fetch all trips with vehicle and driver details joined
 * Returns trips sorted by start date (newest first)
 */
export async function getTrips(): Promise<Trip[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      t.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      v.max_capacity as vehicle_max_capacity,
      d.name as driver_name
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    ORDER BY t.start_date DESC
  `);
  return result.rows as Trip[];
}

/**
 * Fetch a single trip by ID with related data
 */
export async function getTripById(id: number): Promise<Trip | null> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      t.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      v.max_capacity as vehicle_max_capacity,
      d.name as driver_name
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.id = $1
  `, [id]);
  
  return result.rows.length > 0 ? (result.rows[0] as Trip) : null;
}

/**
 * Validate trip assignment against business rules
 * Returns { valid: boolean, message: string }
 * 
 * Rules enforced:
 * 1. Cargo weight must not exceed vehicle max capacity
 * 2. Driver license must not be expired
 * 3. Vehicle status must be 'Available'
 * 4. All required fields must be present
 */
export async function validateTripAssignment(
  vehicleId: number,
  driverId: number,
  cargoWeight: number
): Promise<{ valid: boolean; message: string }> {
  const db = await getDB();

  // Check vehicle exists and get details
  const vehicleResult = await db.query(
    'SELECT id, registration, max_capacity, status, retired FROM vehicles WHERE id = $1',
    [vehicleId]
  );

  if (vehicleResult.rows.length === 0) {
    return { valid: false, message: 'Vehicle not found' };
  }

  const vehicle = vehicleResult.rows[0] as { 
    id: number; 
    registration: string; 
    max_capacity: number; 
    status: string;
    retired: boolean;
  };

  // Check if vehicle is retired
  if (vehicle.retired) {
    return { valid: false, message: 'Cannot assign trips to retired vehicles' };
  }

  // Check if vehicle is available
  if (vehicle.status !== 'Available') {
    return { 
      valid: false, 
      message: `Vehicle ${vehicle.registration} is currently ${vehicle.status}. Only Available vehicles can be assigned to trips.` 
    };
  }

  // Validate cargo weight against vehicle capacity
  if (cargoWeight > vehicle.max_capacity) {
    return {
      valid: false,
      message: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.max_capacity} kg)`
    };
  }

  // Validate driver license status
  const driverValidation = await canAssignDriver(driverId);
  if (!driverValidation.canAssign) {
    return {
      valid: false,
      message: driverValidation.reason || 'Driver validation failed'
    };
  }

  return { valid: true, message: 'Validation successful' };
}

/**
 * Create a new trip with full validation
 * Sets vehicle status to 'On Trip' and driver status to 'On Trip'
 * Returns { success: boolean, message: string, tripId?: number }
 */
export async function createTrip(
  tripData: TripInput
): Promise<{ success: boolean; message: string; tripId?: number }> {
  try {
    // Validate required fields
    if (!tripData.vehicle_id || !tripData.driver_id || !tripData.cargo_weight) {
      return { success: false, message: 'Missing required fields' };
    }

    if (!tripData.origin || !tripData.destination) {
      return { success: false, message: 'Origin and destination are required' };
    }

    if (tripData.cargo_weight <= 0) {
      return { success: false, message: 'Cargo weight must be greater than 0' };
    }

    // Run validation
    const validation = await validateTripAssignment(
      tripData.vehicle_id,
      tripData.driver_id,
      tripData.cargo_weight
    );

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const db = await getDB();

    // Create the trip
    const result = await db.query(
      `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, start_date, end_date, status, origin, destination, distance, revenue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        tripData.vehicle_id,
        tripData.driver_id,
        tripData.cargo_weight,
        tripData.start_date,
        tripData.end_date || null,
        tripData.status || 'Pending',
        tripData.origin,
        tripData.destination,
        tripData.distance || 0,
        tripData.revenue || 0
      ]
    );

    const tripId = (result.rows as any[])[0].id;

    // Update vehicle status to 'On Trip'
    await db.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['On Trip', tripData.vehicle_id]
    );

    // Update driver status to 'On Trip'
    await db.query(
      'UPDATE drivers SET status = $1 WHERE id = $2',
      ['On Trip', tripData.driver_id]
    );

    return {
      success: true,
      message: 'Trip created successfully',
      tripId
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to create trip'
    };
  }
}

/**
 * Update an existing trip
 * Note: Does not allow changing vehicle_id or driver_id after creation
 * Returns { success: boolean, message: string }
 */
export async function updateTrip(
  id: number,
  tripData: Partial<TripInput>
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Get current trip data
    const currentTrip = await getTripById(id);
    if (!currentTrip) {
      return { success: false, message: 'Trip not found' };
    }

    // If cargo weight is being updated, validate it
    if (tripData.cargo_weight && tripData.cargo_weight !== currentTrip.cargo_weight) {
      const validation = await validateTripAssignment(
        currentTrip.vehicle_id,
        currentTrip.driver_id,
        tripData.cargo_weight
      );

      if (!validation.valid) {
        return { success: false, message: validation.message };
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (tripData.cargo_weight !== undefined) {
      updates.push(`cargo_weight = $${paramIndex++}`);
      values.push(tripData.cargo_weight);
    }
    if (tripData.start_date !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(tripData.start_date);
    }
    if (tripData.end_date !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(tripData.end_date);
    }
    if (tripData.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(tripData.status);
    }
    if (tripData.origin !== undefined) {
      updates.push(`origin = $${paramIndex++}`);
      values.push(tripData.origin);
    }
    if (tripData.destination !== undefined) {
      updates.push(`destination = $${paramIndex++}`);
      values.push(tripData.destination);
    }
    if (tripData.distance !== undefined) {
      updates.push(`distance = $${paramIndex++}`);
      values.push(tripData.distance);
    }
    if (tripData.revenue !== undefined) {
      updates.push(`revenue = $${paramIndex++}`);
      values.push(tripData.revenue);
    }

    if (updates.length === 0) {
      return { success: false, message: 'No fields to update' };
    }

    values.push(id);
    await db.query(
      `UPDATE trips SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // If trip is completed, update vehicle and driver status back to Available
    if (tripData.status === 'Completed') {
      await db.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['Available', currentTrip.vehicle_id]
      );
      await db.query(
        'UPDATE drivers SET status = $1 WHERE id = $2',
        ['Available', currentTrip.driver_id]
      );
    }

    return { success: true, message: 'Trip updated successfully' };
  } catch (error) {
    console.error('Error updating trip:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to update trip'
    };
  }
}

/**
 * Delete a trip by ID
 * Also resets vehicle and driver status back to 'Available'
 * Returns { success: boolean, message: string }
 */
export async function deleteTrip(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Get trip details before deleting
    const trip = await getTripById(id);
    if (!trip) {
      return { success: false, message: 'Trip not found' };
    }

    // Delete the trip
    await db.query('DELETE FROM trips WHERE id = $1', [id]);

    // Reset vehicle status to Available if it was On Trip
    await db.query(
      `UPDATE vehicles 
       SET status = 'Available' 
       WHERE id = $1 AND status = 'On Trip'`,
      [trip.vehicle_id]
    );

    // Reset driver status to Available if it was On Trip
    await db.query(
      `UPDATE drivers 
       SET status = 'Available' 
       WHERE id = $1 AND status = 'On Trip'`,
      [trip.driver_id]
    );

    return { success: true, message: 'Trip deleted successfully' };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to delete trip'
    };
  }
}

/**
 * Get trips by status
 * Useful for filtering active, pending, or completed trips
 */
export async function getTripsByStatus(status: string): Promise<Trip[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      t.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      v.max_capacity as vehicle_max_capacity,
      d.name as driver_name
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.status = $1
    ORDER BY t.start_date DESC
  `, [status]);
  
  return result.rows as Trip[];
}

/**
 * Get trips for a specific vehicle
 */
export async function getTripsByVehicle(vehicleId: number): Promise<Trip[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      t.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      v.max_capacity as vehicle_max_capacity,
      d.name as driver_name
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.vehicle_id = $1
    ORDER BY t.start_date DESC
  `, [vehicleId]);
  
  return result.rows as Trip[];
}

/**
 * Get trips for a specific driver
 */
export async function getTripsByDriver(driverId: number): Promise<Trip[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      t.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      v.max_capacity as vehicle_max_capacity,
      d.name as driver_name
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.driver_id = $1
    ORDER BY t.start_date DESC
  `, [driverId]);
  
  return result.rows as Trip[];
}
