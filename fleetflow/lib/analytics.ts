import { getDB } from './db';
import { calculateTotalExpenses, getExpensesByVehicle } from './expenses';

/**
 * Analytics utilities for fleet performance, fuel efficiency, and ROI calculations.
 * Provides data for the Analytics Hub dashboard.
 */

// Fuel Efficiency Calculation
export interface FuelEfficiency {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_type: string;
  total_distance: number; // km
  fuel_consumed: number; // liters
  fuel_efficiency: number; // km per liter
  total_fuel_cost: number;
  cost_per_km: number;
}

export async function calculateFuelEfficiency(vehicleId?: number): Promise<FuelEfficiency[]> {
  try {
    const db = await getDB();
    const query = `
      SELECT 
        v.id as vehicle_id,
        v.registration as vehicle_registration,
        v.type as vehicle_type,
        COALESCE(SUM(
          CASE 
            WHEN t.status = 'Completed' THEN t.distance
            ELSE 0
          END
        ), 0) as total_distance,
        COALESCE(SUM(
          CASE 
            WHEN e.type = 'Fuel' THEN e.amount / 1.5
            ELSE 0
          END
        ), 0) as fuel_consumed,
        COALESCE(SUM(
          CASE 
            WHEN e.type = 'Fuel' THEN e.amount
            ELSE 0
          END
        ), 0) as total_fuel_cost
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id
      LEFT JOIN expenses e ON v.id = e.vehicle_id
      WHERE v.retired = false
      ${vehicleId ? 'AND v.id = $1' : ''}
      GROUP BY v.id, v.registration, v.type
      ORDER BY v.registration
    `;

    const result = vehicleId 
      ? await db.query(query, [vehicleId])
      : await db.query(query);

    return result.rows.map((row: any) => ({
      vehicle_id: row.vehicle_id,
      vehicle_registration: row.vehicle_registration,
      vehicle_type: row.vehicle_type,
      total_distance: parseFloat(row.total_distance) || 0,
      fuel_consumed: parseFloat(row.fuel_consumed) || 0,
      fuel_efficiency: parseFloat(row.fuel_consumed) > 0 
        ? parseFloat(row.total_distance) / parseFloat(row.fuel_consumed)
        : 0,
      total_fuel_cost: parseFloat(row.total_fuel_cost) || 0,
      cost_per_km: parseFloat(row.total_distance) > 0
        ? parseFloat(row.total_fuel_cost) / parseFloat(row.total_distance)
        : 0,
    }));
  } catch (error) {
    console.error('Error calculating fuel efficiency:', error);
    return [];
  }
}

// Vehicle ROI Calculation
export interface VehicleROI {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_type: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  roi_percentage: number;
  trips_completed: number;
  avg_revenue_per_trip: number;
}

export async function calculateVehicleROI(vehicleId?: number): Promise<VehicleROI[]> {
  try {
    const db = await getDB();
    const query = `
      SELECT 
        v.id as vehicle_id,
        v.registration as vehicle_registration,
        v.type as vehicle_type,
        COALESCE(SUM(
          CASE 
            WHEN t.status = 'Completed' THEN t.revenue
            ELSE 0
          END
        ), 0) as total_revenue,
        COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as trips_completed
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id
      WHERE v.retired = false
      ${vehicleId ? 'AND v.id = $1' : ''}
      GROUP BY v.id, v.registration, v.type
      ORDER BY v.registration
    `;

    const result = vehicleId 
      ? await db.query(query, [vehicleId])
      : await db.query(query);

    const roiData: VehicleROI[] = [];

    for (const row of result.rows as any[]) {
      const totalExpenses = await calculateTotalExpenses(row.vehicle_id);
      const totalRevenue = parseFloat(row.total_revenue) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const roiPercentage = totalExpenses > 0 
        ? (netProfit / totalExpenses) * 100 
        : 0;
      const tripsCompleted = parseInt(row.trips_completed) || 0;
      const avgRevenuePerTrip = tripsCompleted > 0 
        ? totalRevenue / tripsCompleted 
        : 0;

      roiData.push({
        vehicle_id: row.vehicle_id,
        vehicle_registration: row.vehicle_registration,
        vehicle_type: row.vehicle_type,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        roi_percentage: roiPercentage,
        trips_completed: tripsCompleted,
        avg_revenue_per_trip: avgRevenuePerTrip,
      });
    }

    return roiData;
  } catch (error) {
    console.error('Error calculating vehicle ROI:', error);
    return [];
  }
}

// Fleet Performance Statistics
export interface FleetPerformance {
  total_vehicles: number;
  active_vehicles: number;
  retired_vehicles: number;
  vehicles_in_shop: number;
  vehicles_on_trip: number;
  total_trips: number;
  completed_trips: number;
  pending_trips: number;
  in_progress_trips: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  fleet_roi: number;
  avg_fuel_efficiency: number;
  total_distance: number;
}

export async function getFleetPerformance(): Promise<FleetPerformance> {
  try {
    const db = await getDB();
    // Get vehicle counts
    const vehicleStats = await db.query(`
      SELECT 
        COUNT(*) as total_vehicles,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as active_vehicles,
        COUNT(CASE WHEN status = 'Retired' THEN 1 END) as retired_vehicles,
        COUNT(CASE WHEN status = 'In Shop' THEN 1 END) as vehicles_in_shop,
        COUNT(CASE WHEN status = 'On Trip' THEN 1 END) as vehicles_on_trip
      FROM vehicles
    `);

    // Get trip statistics
    const tripStats = await db.query(`
      SELECT 
        COUNT(*) as total_trips,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_trips,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_trips,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_trips,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN distance ELSE 0 END), 0) as total_distance
      FROM trips
    `);

    const totalExpenses = await calculateTotalExpenses();
    const totalRevenue = parseFloat(tripStats.rows[0].total_revenue) || 0;
    const netProfit = totalRevenue - totalExpenses;
    const fleetROI = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    // Calculate average fuel efficiency
    const fuelEfficiency = await calculateFuelEfficiency();
    const avgFuelEfficiency = fuelEfficiency.length > 0
      ? fuelEfficiency.reduce((sum, v) => sum + v.fuel_efficiency, 0) / fuelEfficiency.length
      : 0;

    const vehicleRow = vehicleStats.rows[0] as any;
    const tripRow = tripStats.rows[0] as any;

    return {
      total_vehicles: parseInt(vehicleRow.total_vehicles) || 0,
      active_vehicles: parseInt(vehicleRow.active_vehicles) || 0,
      retired_vehicles: parseInt(vehicleRow.retired_vehicles) || 0,
      vehicles_in_shop: parseInt(vehicleRow.vehicles_in_shop) || 0,
      vehicles_on_trip: parseInt(vehicleRow.vehicles_on_trip) || 0,
      total_trips: parseInt(tripRow.total_trips) || 0,
      completed_trips: parseInt(tripRow.completed_trips) || 0,
      pending_trips: parseInt(tripRow.pending_trips) || 0,
      in_progress_trips: parseInt(tripRow.in_progress_trips) || 0,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      fleet_roi: fleetROI,
      avg_fuel_efficiency: avgFuelEfficiency,
      total_distance: parseFloat(tripRow.total_distance) || 0,
    };
  } catch (error) {
    console.error('Error getting fleet performance:', error);
    return {
      total_vehicles: 0,
      active_vehicles: 0,
      retired_vehicles: 0,
      vehicles_in_shop: 0,
      vehicles_on_trip: 0,
      total_trips: 0,
      completed_trips: 0,
      pending_trips: 0,
      in_progress_trips: 0,
      total_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      fleet_roi: 0,
      avg_fuel_efficiency: 0,
      total_distance: 0,
    };
  }
}

// Monthly Performance Trend
export interface MonthlyPerformance {
  month: string;
  year: number;
  trips_completed: number;
  revenue: number;
  expenses: number;
  profit: number;
  distance: number;
}

export async function getMonthlyPerformance(months: number = 6): Promise<MonthlyPerformance[]> {
  try {
    const db = await getDB();
    const tripData = await db.query(`
      SELECT 
        strftime('%Y-%m', start_date) as month_year,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as trips_completed,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN distance ELSE 0 END), 0) as distance
      FROM trips
      WHERE start_date >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', start_date)
      ORDER BY month_year DESC
    `);

    const expenseData = await db.query(`
      SELECT 
        strftime('%Y-%m', date) as month_year,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      WHERE date >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', date)
    `);

    const expenseMap = new Map(
      (expenseData.rows as any[]).map((row: any) => [row.month_year, parseFloat(row.expenses)])
    );

    return (tripData.rows as any[]).map((row: any) => {
      const [year, month] = row.month_year.split('-');
      const expenses = expenseMap.get(row.month_year) || 0;
      const revenue = parseFloat(row.revenue) || 0;
      const profit = revenue - expenses;

      return {
        month: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' }),
        year: parseInt(year),
        trips_completed: parseInt(row.trips_completed) || 0,
        revenue,
        expenses,
        profit,
        distance: parseFloat(row.distance) || 0,
      };
    });
  } catch (error) {
    console.error('Error getting monthly performance:', error);
    return [];
  }
}

// Expense Breakdown by Category
export interface ExpenseBreakdown {
  type: string;
  total: number;
  percentage: number;
  count: number;
}

export async function getExpenseBreakdown(): Promise<ExpenseBreakdown[]> {
  try {
    const db = await getDB();
    const result = await db.query(`
      SELECT 
        type,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM expenses
      GROUP BY type
      ORDER BY total DESC
    `);

    const totalExpenses = (result.rows as any[]).reduce(
      (sum: number, row: any) => sum + parseFloat(row.total), 
      0
    );

    return (result.rows as any[]).map((row: any) => ({
      type: row.type,
      total: parseFloat(row.total) || 0,
      percentage: totalExpenses > 0 
        ? (parseFloat(row.total) / totalExpenses) * 100 
        : 0,
      count: parseInt(row.count) || 0,
    }));
  } catch (error) {
    console.error('Error getting expense breakdown:', error);
    return [];
  }
}
