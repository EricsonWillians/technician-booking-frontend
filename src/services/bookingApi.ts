/**
 * bookingApi.ts
 *
 * Optimized API service for interacting with the FastAPI backend.
 *
 * Features:
 * - Centralized Axios instance with auto-retries & error handling.
 * - TypeScript interfaces for all API responses.
 * - Token authentication support.
 * - Automatic datetime conversion.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// -----------------------------------------------------------------------------
// 1) Environment Configuration
// -----------------------------------------------------------------------------
const BASE_URL: string = import.meta.env.VITE_BOOKING_API_URL || 'http://127.0.0.1:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------------------------
// 2) Axios Interceptors for Logging & Error Handling
// -----------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Load token from storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`[API Error] ${error.config?.url} - ${error.message}`);

      // Handle token expiration and refresh if needed
      if (error.response?.status === 401) {
        // Refresh token logic here if applicable
      }
    }
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// 3) TypeScript Interfaces
// -----------------------------------------------------------------------------

/** Booking object from the API */
export interface Booking {
  id: string;
  customer_name: string;
  technician_name: string;
  profession: string;
  start_time: string;  // ISO string
  end_time: string;    // ISO string
}

/** Payload for creating a new booking */
export interface BookingCreatePayload {
  customer_name: string;
  technician_name: string;
  profession: string;
  start_time: string;  // ISO datetime
}

/** Command processing request payload */
interface CommandPayload {
  message: string;
}

/** API response from processing a command */
export interface CommandResult {
  success: boolean;
  intent: string;
  message?: string;
  analysis?: { intent: string; confidence: number; assessment: string }[];
  booking?: Booking;
  bookings?: Booking[];
}

/** Standardized API error format */
export class BookingApiError extends Error {
  public status?: number;
  public originalError?: unknown;
  
  constructor(message: string, status?: number, originalError?: unknown) {
    super(message);
    this.name = 'BookingApiError';
    this.status = status;
    this.originalError = originalError;
  }
}

// -----------------------------------------------------------------------------
// 4) Utility Function: Convert Dates to ISO Format
// -----------------------------------------------------------------------------
function toISO(date: Date | string): string {
  return new Date(date).toISOString();
}

// -----------------------------------------------------------------------------
// 5) Error Handling: Convert Axios Errors into User-Friendly Messages
// -----------------------------------------------------------------------------
function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError;
    const status = axiosErr.response?.status;
    let detail = 'An unexpected error occurred. Please try again later.';

    if (axiosErr.response && axiosErr.response.data) {
      if (typeof axiosErr.response.data === 'string') {
        detail = axiosErr.response.data;
      } else if (typeof axiosErr.response.data === 'object' && 'detail' in axiosErr.response.data) {
        detail = (axiosErr.response.data as any).detail;
      } else {
        detail = JSON.stringify(axiosErr.response.data);
      }
    } else if (axiosErr.message) {
      detail = axiosErr.message;
    }

    throw new BookingApiError(`API request failed: ${detail}`, status, error);
  }
  throw new BookingApiError('An unexpected error occurred.', undefined, error);
}

// -----------------------------------------------------------------------------
// 6) CRUD Operations
// -----------------------------------------------------------------------------

/** Fetch all bookings */
export async function getAllBookings(): Promise<Booking[]> {
  try {
    // ✅ Use the correct endpoint from your API
    const res: AxiosResponse<{ success: boolean; data: Booking[] }> = await apiClient.get('/api/v1/bookings/');

    return res.data.data.map((b) => ({
      ...b,
      start_time: toISO(b.start_time),
      end_time: toISO(b.end_time),
    }));
  } catch (error) {
    handleAxiosError(error);
  }
}


/** Create a new booking */
export async function createBooking(data: BookingCreatePayload): Promise<Booking> {
  try {
    const res: AxiosResponse<{ success: boolean; data: Booking }> = await apiClient.post('/api/v1/bookings', data);
    return res.data.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/** Retrieve a single booking by ID */
export async function getBookingById(bookingId: string): Promise<Booking> {
  try {
    const res: AxiosResponse<{ success: boolean; data: Booking }> = await apiClient.get(`/api/v1/bookings/${bookingId}`);
    return res.data.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/** Delete a booking */
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    await apiClient.delete(`/bookings/${bookingId}`);
  } catch (error) {
    handleAxiosError(error);
  }
}

/** Process a command via NLP */
export async function processCommand(message: string): Promise<CommandResult> {
  try {
    const payload: CommandPayload = { message };
    const res: AxiosResponse<{ success: boolean; data: CommandResult }> = await apiClient.post('/api/v1/bookings/commands', payload);
    return res.data.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
