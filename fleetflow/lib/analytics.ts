import { getDB } from './db';

export interface FuelEfficiencyData {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_type: string;
  total_distance: number;
  fuel_consumed: number;
  fuel_efficiency: number; // km per liter
  total_fuel_cost: number;
  cost_per_km: number;
}

export interface VehicleROI {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_type: string;
  trips_completed: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  roi_percentage: number;
  avg_revenue_per_trip: number;
}

/**
 * Calculate fuel efficiency for all vehicles
 */
export async function calculateFuelEfficiency(): Promise<FuelEfficiencyData[]> {
  const db = await getDB();
  
  const result = await db.query(`
    SELECT 
      v.id as vehicle_id,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      COALESCE(SUM(t.distance), 0) as total_distance,
      COALESCE(SUM(CASE WHEN e.type = 'fuel' THEN e.amount ELSE 0 END), 0) as total_fuel_cost
    FROM vehicles v
    LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
    LEFT JOIN expenses e ON v.id = e.vehicle_id
    WHERE v.retired = false
    GROUP BY v.id, v.registration, v.type
    HAVING COALESCE(SUM(t.distance), 0) > 0
  `);
  
  const fuelPrice = 100; // ₹100 per liter (average diesel price)
  
  return (result.rows as any[]).map((row: any) => {
    const totalDistance = parseFloat(row.total_distance) || 0;
    const totalFuelCost = parseFloat(row.total_fuel_cost) || 0;
    const fuelConsumed = totalFuelCost / fuelPrice;
    const fuelEfficiency = fuelConsumed > 0 ? totalDistance / fuelConsumed : 0;
    const costPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;
    
    return {
      vehicle_id: row.vehicle_id,
      vehicle_registration: row.vehicle_registration,
      vehicle_type: row.vehicle_type,
      total_distance: totalDistance,
      fuel_consumed: fuelConsumed,
      fuel_efficiency: fuelEfficiency,
      total_fuel_cost: totalFuelCost,
      cost_per_km: costPerKm,
    };
  });
}

/**
 * Calculate ROI for all vehicles
 */
export async function calculateVehicleROI(): Promise<VehicleROI[]> {
  const db = await getDB();
  
  const result = await db.query(`
    SELECT 
      v.id as vehicle_id,
      v.registration as vehicle_registration,
      v.type as vehicle_type,
      COUNT(DISTINCT t.id) as trips_completed,
      COALESCE(SUM(t.revenue), 0) as total_revenue,
      COALESCE(SUM(e.amount), 0) as total_expenses
    FROM vehicles v
    LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
    LEFT JOIN expenses e ON v.id = e.vehicle_id
    WHERE v.retired = false
    GROUP BY v.id, v.registration, v.type
  `);
  
  return (result.rows as any[]).map((row: any) => {
    const tripsCompleted = parseInt(row.trips_completed) || 0;
    const totalRevenue = parseFloat(row.total_revenue) || 0;
    const totalExpenses = parseFloat(row.total_expenses) || 0;
    const netProfit = totalRevenue - totalExpenses;
    const roiPercentage = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
    const avgRevenuePerTrip = tripsCompleted > 0 ? totalRevenue / tripsCompleted : 0;
    
    return {
      vehicle_id: row.vehicle_id,
      vehicle_registration: row.vehicle_registration,
      vehicle_type: row.vehicle_type,
      trips_completed: tripsCompleted,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      roi_percentage: roiPercentage,
      avg_revenue_per_trip: avgRevenuePerTrip,
    };
  });
}

/**
 * Get fleet performance summary
 */
export async function getFleetPerformance(): Promise<{
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  avgROI: number;
  avgFuelEfficiency: number;
  totalTripsCompleted: number;
}> {
  const fuelData = await calculateFuelEfficiency();
  const roiData = await calculateVehicleROI();
  
  const totalRevenue = roiData.reduce((sum, v) => sum + v.total_revenue, 0);
  const totalExpenses = roiData.reduce((sum, v) => sum + v.total_expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgROI = roiData.length > 0 
    ? roiData.reduce((sum, v) => sum + v.roi_percentage, 0) / roiData.length 
    : 0;
  const avgFuelEfficiency = fuelData.length > 0 
    ? fuelData.reduce((sum, v) => sum + v.fuel_efficiency, 0) / fuelData.length 
    : 0;
  const totalTripsCompleted = roiData.reduce((sum, v) => sum + v.trips_completed, 0);
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    avgROI,
    avgFuelEfficiency,
    totalTripsCompleted,
  };
}
