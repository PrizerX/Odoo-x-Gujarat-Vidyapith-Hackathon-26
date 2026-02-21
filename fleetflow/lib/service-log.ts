import { getDB } from './db';

export interface ServiceLog {
  id: number;
  vehicle_id: number;
  issue: string;
  resolution: string | null;
  date: string;
  status: string;
  created_at: string;
  vehicle_registration?: string;
  vehicle_type?: string;
}

export interface ServiceLogInput {
  vehicle_id: number;
  issue: string;
  resolution?: string;
  date: string;
  status: string;
}

/**
 * Fetch all service logs with vehicle details joined
 * Returns logs sorted by date (newest first)
 */
export async function getServiceLogs(): Promise<ServiceLog[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      sl.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM service_log sl
    LEFT JOIN vehicles v ON sl.vehicle_id = v.id
    ORDER BY sl.date DESC
  `);
  return result.rows as ServiceLog[];
}

/**
 * Fetch a single service log by ID
 */
export async function getServiceLogById(id: number): Promise<ServiceLog | null> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      sl.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM service_log sl
    LEFT JOIN vehicles v ON sl.vehicle_id = v.id
    WHERE sl.id = $1
  `, [id]);
  
  return result.rows.length > 0 ? (result.rows[0] as ServiceLog) : null;
}

/**
 * Create a new service log entry
 * STRICT RULE: Automatically sets vehicle status to 'In Shop'
 * This removes the vehicle from the dispatcher's available pool
 * Returns { success: boolean, message: string, logId?: number }
 */
export async function createServiceLog(
  logData: ServiceLogInput
): Promise<{ success: boolean; message: string; logId?: number }> {
  try {
    // Validate required fields
    if (!logData.vehicle_id) {
      return { success: false, message: 'Vehicle is required' };
    }

    if (!logData.issue || !logData.issue.trim()) {
      return { success: false, message: 'Issue description is required' };
    }

    if (!logData.date) {
      return { success: false, message: 'Service date is required' };
    }

    const db = await getDB();

    // Check if vehicle exists
    const vehicleCheck = await db.query(
      'SELECT id, registration, status FROM vehicles WHERE id = $1',
      [logData.vehicle_id]
    );

    if (vehicleCheck.rows.length === 0) {
      return { success: false, message: 'Vehicle not found' };
    }

    // Create the service log entry
    const result = await db.query(
      `INSERT INTO service_log (vehicle_id, issue, resolution, date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        logData.vehicle_id,
        logData.issue.trim(),
        logData.resolution?.trim() || null,
        logData.date,
        logData.status || 'In Progress'
      ]
    );

    const logId = result.rows[0].id;

    // STRICT BUSINESS RULE: Set vehicle status to 'In Shop'
    // This automatically removes it from the dispatcher's available pool
    await db.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['In Shop', logData.vehicle_id]
    );

    return {
      success: true,
      message: 'Service log created successfully. Vehicle status set to In Shop.',
      logId
    };
  } catch (error) {
    console.error('Error creating service log:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to create service log'
    };
  }
}

/**
 * Update an existing service log entry
 * Note: Does not change vehicle status unless explicitly resolved
 * Returns { success: boolean, message: string }
 */
export async function updateServiceLog(
  id: number,
  logData: Partial<ServiceLogInput>
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Get current log data
    const currentLog = await getServiceLogById(id);
    if (!currentLog) {
      return { success: false, message: 'Service log not found' };
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (logData.issue !== undefined) {
      if (!logData.issue.trim()) {
        return { success: false, message: 'Issue description cannot be empty' };
      }
      updates.push(`issue = $${paramIndex++}`);
      values.push(logData.issue.trim());
    }
    if (logData.resolution !== undefined) {
      updates.push(`resolution = $${paramIndex++}`);
      values.push(logData.resolution?.trim() || null);
    }
    if (logData.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(logData.date);
    }
    if (logData.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(logData.status);
    }

    if (updates.length === 0) {
      return { success: false, message: 'No fields to update' };
    }

    values.push(id);
    await db.query(
      `UPDATE service_log SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // If status is changed to 'Resolved', update vehicle status to 'Available'
    if (logData.status === 'Resolved') {
      await db.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['Available', currentLog.vehicle_id]
      );
    }

    return { success: true, message: 'Service log updated successfully' };
  } catch (error) {
    console.error('Error updating service log:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to update service log'
    };
  }
}

/**
 * Resolve a service log entry
 * Sets status to 'Resolved' and updates vehicle status back to 'Available'
 * This returns the vehicle to the dispatcher's available pool
 * Returns { success: boolean, message: string }
 */
export async function resolveServiceLog(
  id: number,
  resolution: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!resolution || !resolution.trim()) {
      return { success: false, message: 'Resolution description is required' };
    }

    const db = await getDB();

    // Get the service log
    const log = await getServiceLogById(id);
    if (!log) {
      return { success: false, message: 'Service log not found' };
    }

    // Update the service log with resolution
    await db.query(
      `UPDATE service_log 
       SET resolution = $1, status = $2 
       WHERE id = $3`,
      [resolution.trim(), 'Resolved', id]
    );

    // STRICT BUSINESS RULE: Set vehicle status back to 'Available'
    // This returns the vehicle to the dispatcher's pool
    await db.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['Available', log.vehicle_id]
    );

    return {
      success: true,
      message: 'Service resolved successfully. Vehicle returned to available pool.'
    };
  } catch (error) {
    console.error('Error resolving service log:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to resolve service log'
    };
  }
}

/**
 * Delete a service log entry
 * Note: Does NOT automatically change vehicle status
 * Returns { success: boolean, message: string }
 */
export async function deleteServiceLog(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Check if log exists
    const log = await getServiceLogById(id);
    if (!log) {
      return { success: false, message: 'Service log not found' };
    }

    // Delete the log
    await db.query('DELETE FROM service_log WHERE id = $1', [id]);

    return { success: true, message: 'Service log deleted successfully' };
  } catch (error) {
    console.error('Error deleting service log:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to delete service log'
    };
  }
}

/**
 * Get service logs by status
 * Useful for filtering in-progress or resolved logs
 */
export async function getServiceLogsByStatus(status: string): Promise<ServiceLog[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      sl.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM service_log sl
    LEFT JOIN vehicles v ON sl.vehicle_id = v.id
    WHERE sl.status = $1
    ORDER BY sl.date DESC
  `, [status]);
  
  return result.rows as ServiceLog[];
}

/**
 * Get service logs for a specific vehicle
 * Returns maintenance history for a vehicle
 */
export async function getServiceLogsByVehicle(vehicleId: number): Promise<ServiceLog[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      sl.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM service_log sl
    LEFT JOIN vehicles v ON sl.vehicle_id = v.id
    WHERE sl.vehicle_id = $1
    ORDER BY sl.date DESC
  `, [vehicleId]);
  
  return result.rows as ServiceLog[];
}

/**
 * Get count of active (in-progress) service logs
 * Useful for dashboard statistics
 */
export async function getActiveServiceCount(): Promise<number> {
  const db = await getDB();
  const result = await db.query(
    `SELECT COUNT(*) as count 
     FROM service_log 
     WHERE status = 'In Progress'`
  );
  return parseInt(result.rows[0].count);
}
