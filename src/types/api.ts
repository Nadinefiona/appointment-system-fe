export type UserRole = "client" | "provider" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: "client";
  message: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface ServiceProvider {
  id: string;
  user: string;
  bio: string;
  buffer_time: number;
}

export interface ServiceType {
  id: string;
  provider: string;
  name: string;
  duration: number;
  price: string;
}

export interface AvailabilitySlot {
  id: string;
  provider: string;
  weekday: number;
  start_time: string;
  end_time: string;
  valid_from: string | null;
  valid_to: string | null;
}

export type BookingStatus = "booked" | "cancelled" | "completed";

export interface Booking {
  id: string;
  client: string;
  provider: string;
  service: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
}

export interface BookingSummary {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  service: string;
  client: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OpeningsWindow {
  start_time: string;
  end_time: string;
  valid_from: string | null;
  valid_to: string | null;
}

export interface OpeningsBusy {
  start_time: string;
  end_time: string;
}

export interface OpeningsResponse {
  date: string;
  weekday: number;
  windows: OpeningsWindow[];
  busy: OpeningsBusy[];
  suggested_starts: string[];
}

export interface ScheduleResponse {
  from: string;
  to: string;
  availability: AvailabilitySlot[];
  bookings: BookingSummary[];
}

export interface CreateBookingPayload {
  provider: string;
  service: string;
  start_time: string;
  end_time?: string;
}

export interface CreateAvailabilityPayload {
  weekday: number;
  start_time: string;
  end_time: string;
  valid_from?: string | null;
  valid_to?: string | null;
  provider?: string;
}

export interface CreateServicePayload {
  provider: string;
  name: string;
  duration: number;
  price: string;
}

export interface CreateProviderPayload {
  user: string;
  bio?: string;
  buffer_time?: number;
}
