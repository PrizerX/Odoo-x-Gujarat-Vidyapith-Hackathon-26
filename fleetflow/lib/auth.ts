import bcrypt from 'bcryptjs';
import { getDB } from './db';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Register a new user with hashed password.
 * Stores credentials locally for offline-first authentication.
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const db = await getDB();

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return { success: false, message: 'User already exists' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, passwordHash, name]
    );

    const user = result.rows[0] as User;
    return { success: true, message: 'User registered successfully', user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

/**
 * Authenticate user with email and password.
 * Verifies credentials against local database for offline support.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const db = await getDB();

    // Get user by email
    const result = await db.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const user = result.rows[0] as User & { password_hash: string };

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const { password_hash, ...userData } = user;
    return { success: true, message: 'Login successful', user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

/**
 * Get user session from localStorage.
 * Returns user data if session exists and is valid.
 */
export function getSession(): User | null {
  if (typeof window === 'undefined') return null;

  const sessionData = localStorage.getItem('fleetflow_user');
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as User;
  } catch {
    return null;
  }
}

/**
 * Store user session in localStorage.
 */
export function setSession(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fleetflow_user', JSON.stringify(user));
}

/**
 * Clear user session from localStorage.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fleetflow_user');
}
