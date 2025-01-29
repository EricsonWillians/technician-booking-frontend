/**
 * bookingApi.ts
 *
 * A robust service layer to interact with the FastAPI booking endpoints.
 *
 * Endpoints:
 *   1) GET    /bookings              -> list all
 *   2) POST   /bookings             -> create new
 *   3) GET    /bookings/{bookingId} -> retrieve one
 *   4) DELETE /bookings/{bookingId} -> delete/cancel
 *   5) POST   /bookings/commands    -> pass raw user command to backend NLP, returning CommandResult
 *
 * Key Features:
 *  - Single axios instance with baseURL set from environment
 *  - Interceptors for logging / error handling
 *  - TypeScript definitions (Booking, BookingCreatePayload, CommandResult, etc.)
 *  - Centralized error class (BookingApiError)
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// -----------------------------------------------------------------------------
// 1) Environment-based configuration
// -----------------------------------------------------------------------------
const BASE_URL: string = import.meta.env.VITE_BOOKING_API_URL || 'http://127.0.0.1:8000';

// -----------------------------------------------------------------------------
// 2) A dedicated axios instance with common config
// -----------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Optionally attach auth tokens or custom headers here
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// 3) Types & Interfaces
// -----------------------------------------------------------------------------

/**
 * Basic representation of a booking from the server.
 */
export interface Booking {
  id: string;
  customer_name: string;
  technician_name: string;
  profession: string;
  start_time: string;  // ISO datetime
  end_time: string;    // ISO datetime
}

/**
 * For creating a new booking
 */
export interface BookingCreatePayload {
  customer_name: string;
  technician_name: string;
  profession: string;
  start_time: string;  // ISO datetime
}

/**
 * Data we send to /bookings/commands
 */
interface CommandPayload {
  message: string;
}

/**
 * The new structured response from /bookings/commands
 */
export interface CommandResult {
  intent: string;
  message?: string;
  booking?: Booking;
  bookings?: Booking[];
}

/**
 * A unified error for easy identification in the front end
 */
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
// 4) A helper to transform Axios errors into BookingApiError
// -----------------------------------------------------------------------------
function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError;
    const status = axiosErr.response?.status;
    let detail = 'An unexpected error occurred. Please try again later.';

    if (axiosErr.response && axiosErr.response.data) {
      // Attempt to extract a meaningful error message
      if (typeof axiosErr.response.data === 'string') {
        detail = axiosErr.response.data;
      } else if (typeof axiosErr.response.data === 'object' && axiosErr.response.data && 'detail' in axiosErr.response.data) {
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
// 5) CRUD endpoints
// -----------------------------------------------------------------------------
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const res: AxiosResponse<Booking[]> = await apiClient.get('/bookings');
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function createBooking(data: BookingCreatePayload): Promise<Booking> {
  try {
    const res: AxiosResponse<Booking> = await apiClient.post('/bookings', data);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  try {
    const res: AxiosResponse<Booking> = await apiClient.get(`/bookings/${bookingId}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    await apiClient.delete(`/bookings/${bookingId}`);
  } catch (error) {
    handleAxiosError(error);
  }
}

// -----------------------------------------------------------------------------
// 6) The special "processCommand" to call /bookings/commands
//    Now returns a structured CommandResult instead of a single string
// -----------------------------------------------------------------------------
export async function processCommand(message: string): Promise<CommandResult> {
  try {
    const payload: CommandPayload = { message };
    // If your backend route differs, adjust accordingly
    const res: AxiosResponse<CommandResult> = await apiClient.post('/bookings/commands', payload);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
