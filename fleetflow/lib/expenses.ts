import { getDB } from './db';

export interface Expense {
  id: number;
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_type: string;
  type: 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'other';
  amount: number;
  date: Date;
  description: string;
  created_at: Date;
}

/**
 * Get all expenses from the database
 */
export async function getExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const result = await db.query(`
    SELECT 
      e.*,
      v.registration as vehicle_registration,
      v.type as vehicle_type
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    ORDER BY e.date DESC, e.created_at DESC
  `);
  
  return (result.rows as any[]).map((row: any) => ({
    ...row,
    amount: parseFloat(row.amount),
  }));
}

/**
 * Create a new expense
 */
export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'vehicle_registration' | 'vehicle_type'>): Promise<Expense> {
  const db = await getDB();
  const result = await db.query(
    `INSERT INTO expenses (vehicle_id, type, amount, date, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [expense.vehicle_id, expense.type, expense.amount, expense.date, expense.description]
  );
  
  const newExpense = (result.rows as any[])[0];
  
  // Get vehicle info
  const vehicleResult = await db.query(
    `SELECT registration, type FROM vehicles WHERE id = $1`,
    [expense.vehicle_id]
  );
  const vehicle = (vehicleResult.rows as any[])[0];
  
  return {
    ...newExpense,
    amount: parseFloat(newExpense.amount),
    vehicle_registration: vehicle.registration,
    vehicle_type: vehicle.type,
  };
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: number, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'vehicle_registration' | 'vehicle_type'>>): Promise<Expense> {
  const db = await getDB();
  
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (expense.vehicle_id !== undefined) {
    fields.push(`vehicle_id = $${paramCount++}`);
    values.push(expense.vehicle_id);
  }
  if (expense.type !== undefined) {
    fields.push(`type = $${paramCount++}`);
    values.push(expense.type);
  }
  if (expense.amount !== undefined) {
    fields.push(`amount = $${paramCount++}`);
    values.push(expense.amount);
  }
  if (expense.date !== undefined) {
    fields.push(`date = $${paramCount++}`);
    values.push(expense.date);
  }
  if (expense.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(expense.description);
  }
  
  values.push(id);
  
  const result = await db.query(
    `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  
  const updatedExpense = (result.rows as any[])[0];
  
  // Get vehicle info
  const vehicleResult = await db.query(
    `SELECT registration, type FROM vehicles WHERE id = $1`,
    [updatedExpense.vehicle_id]
  );
  const vehicle = (vehicleResult.rows as any[])[0];
  
  return {
    ...updatedExpense,
    amount: parseFloat(updatedExpense.amount),
    vehicle_registration: vehicle.registration,
    vehicle_type: vehicle.type,
  };
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const db = await getDB();
  await db.query('DELETE FROM expenses WHERE id = $1', [id]);
}

/**
 * Calculate total expenses
 */
export async function calculateTotalExpenses(): Promise<{
  total: number;
  byType: Record<string, number>;
  byVehicle: Array<{ vehicle_registration: string; total: number }>;
}> {
  const expenses = await getExpenses();
  
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const byType: Record<string, number> = {};
  expenses.forEach(expense => {
    byType[expense.type] = (byType[expense.type] || 0) + expense.amount;
  });
  
  const vehicleTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    vehicleTotals[expense.vehicle_registration] = 
      (vehicleTotals[expense.vehicle_registration] || 0) + expense.amount;
  });
  
  const byVehicle = Object.entries(vehicleTotals)
    .map(([vehicle_registration, total]) => ({ vehicle_registration, total }))
    .sort((a, b) => b.total - a.total);
  
  return { total, byType, byVehicle };
}
