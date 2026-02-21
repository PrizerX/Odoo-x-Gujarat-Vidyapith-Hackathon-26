import { getDB } from './db';

export interface Expense {
  id: number;
  vehicle_id: number;
  type: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  vehicle_registration?: string;
  vehicle_type?: string;
}

export interface ExpenseInput {
  vehicle_id: number;
  type: string;
  amount: number;
  date: string;
  description?: string;
}

/**
 * Fetch all expenses with vehicle details joined
 * Returns expenses sorted by date (newest first)
 */
export async function getExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    ORDER BY e.date DESC
  `);
  return result.rows as any[] as Expense[];
}

/**
 * Fetch a single expense by ID
 */
export async function getExpenseById(id: number): Promise<Expense | null> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.id = $1
  `, [id]);
  
  return result.rows.length > 0 ? (result.rows[0] as Expense) : null;
}

/**
 * Create a new expense entry
 * Returns { success: boolean, message: string, expenseId?: number }
 */
export async function createExpense(
  expenseData: ExpenseInput
): Promise<{ success: boolean; message: string; expenseId?: number }> {
  try {
    // Validate required fields
    if (!expenseData.vehicle_id) {
      return { success: false, message: 'Vehicle is required' };
    }

    if (!expenseData.type || !expenseData.type.trim()) {
      return { success: false, message: 'Expense type is required' };
    }

    if (!expenseData.amount || expenseData.amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    if (!expenseData.date) {
      return { success: false, message: 'Date is required' };
    }

    const db = await getDB();

    // Check if vehicle exists
    const vehicleCheck = await db.query(
      'SELECT id FROM vehicles WHERE id = $1',
      [expenseData.vehicle_id]
    );

    if (vehicleCheck.rows.length === 0) {
      return { success: false, message: 'Vehicle not found' };
    }

    // Create the expense
    const result = await db.query(
      `INSERT INTO expenses (vehicle_id, type, amount, date, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        expenseData.vehicle_id,
        expenseData.type.trim(),
        expenseData.amount,
        expenseData.date,
        expenseData.description?.trim() || null
      ]
    );

    const expenseId = (result.rows[0] as any).id;

    return {
      success: true,
      message: 'Expense logged successfully',
      expenseId
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to create expense'
    };
  }
}

/**
 * Update an existing expense
 * Returns { success: boolean, message: string }
 */
export async function updateExpense(
  id: number,
  expenseData: Partial<ExpenseInput>
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Get current expense
    const currentExpense = await getExpenseById(id);
    if (!currentExpense) {
      return { success: false, message: 'Expense not found' };
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (expenseData.vehicle_id !== undefined) {
      updates.push(`vehicle_id = $${paramIndex++}`);
      values.push(expenseData.vehicle_id);
    }
    if (expenseData.type !== undefined) {
      if (!expenseData.type.trim()) {
        return { success: false, message: 'Expense type cannot be empty' };
      }
      updates.push(`type = $${paramIndex++}`);
      values.push(expenseData.type.trim());
    }
    if (expenseData.amount !== undefined) {
      if (expenseData.amount <= 0) {
        return { success: false, message: 'Amount must be greater than 0' };
      }
      updates.push(`amount = $${paramIndex++}`);
      values.push(expenseData.amount);
    }
    if (expenseData.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(expenseData.date);
    }
    if (expenseData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(expenseData.description?.trim() || null);
    }

    if (updates.length === 0) {
      return { success: false, message: 'No fields to update' };
    }

    values.push(id);
    await db.query(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return { success: true, message: 'Expense updated successfully' };
  } catch (error) {
    console.error('Error updating expense:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to update expense'
    };
  }
}

/**
 * Delete an expense by ID
 * Returns { success: boolean, message: string }
 */
export async function deleteExpense(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDB();

    // Check if expense exists
    const expense = await getExpenseById(id);
    if (!expense) {
      return { success: false, message: 'Expense not found' };
    }

    // Delete the expense
    await db.query('DELETE FROM expenses WHERE id = $1', [id]);

    return { success: true, message: 'Expense deleted successfully' };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return {
      success: false,
      message: (error as Error).message || 'Failed to delete expense'
    };
  }
}

/**
 * Get expenses by type (fuel or maintenance)
 */
export async function getExpensesByType(type: string): Promise<Expense[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.type = $1
    ORDER BY e.date DESC
  `, [type]);
  
  return result.rows as Expense[];
}

/**
 * Get expenses for a specific vehicle
 * Returns expense history for a vehicle
 */
export async function getExpensesByVehicle(vehicleId: number): Promise<Expense[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.vehicle_id = $1
    ORDER BY e.date DESC
  `, [vehicleId]);
  
  return result.rows as Expense[];
}

/**
 * Calculate total expenses for a vehicle
 * Optionally filter by expense type and date range
 */
export async function calculateTotalExpenses(
  vehicleId?: number,
  type?: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const db = await getDB();
  
  let query = 'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (vehicleId) {
    query += ` AND vehicle_id = $${paramIndex++}`;
    params.push(vehicleId);
  }

  if (type) {
    query += ` AND type = $${paramIndex++}`;
    params.push(type);
  }

  if (startDate) {
    query += ` AND date >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND date <= $${paramIndex++}`;
    params.push(endDate);
  }

  const result = await db.query(query, params);
  return parseFloat((result.rows[0] as any).total) || 0;
}

/**
 * Get expense summary by vehicle
 * Returns total expenses per vehicle with breakdown by type
 */
export async function getExpenseSummaryByVehicle(): Promise<{
  vehicle_id: number;
  vehicle_registration: string;
  total_expenses: number;
  fuel_expenses: number;
  maintenance_expenses: number;
}[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      v.id as vehicle_id,
      v.registration as vehicle_registration,
      COALESCE(SUM(e.amount), 0) as total_expenses,
      COALESCE(SUM(CASE WHEN e.type = 'Fuel' THEN e.amount ELSE 0 END), 0) as fuel_expenses,
      COALESCE(SUM(CASE WHEN e.type = 'Maintenance' THEN e.amount ELSE 0 END), 0) as maintenance_expenses
    FROM vehicles v
    LEFT JOIN expenses e ON v.id = e.vehicle_id
    WHERE v.retired = false
    GROUP BY v.id, v.registration
    ORDER BY total_expenses DESC
  `);
  
  return (result.rows as any[]).map((row: any) => ({
    vehicle_id: row.vehicle_id,
    vehicle_registration: row.vehicle_registration,
    total_expenses: parseFloat(row.total_expenses) || 0,
    fuel_expenses: parseFloat(row.fuel_expenses) || 0,
    maintenance_expenses: parseFloat(row.maintenance_expenses) || 0
  }));
}

/**
 * Get expenses within a date range
 */
export async function getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.date >= $1 AND e.date <= $2
    ORDER BY e.date DESC
  `, [startDate, endDate]);
  
  return result.rows as Expense[];
}
