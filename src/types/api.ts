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

export interface ProviderProfile {
  id: string;
  bio: string;
  buffer_time: number;
}

/** GET/PATCH /api/me/ */
export interface MeProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  provider_profile: ProviderProfile | null;
}

/** @deprecated Use MeProfile */
export type User = MeProfile;

export interface ProviderUserNested {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ServiceProvider {
  id: string;
  user: string | ProviderUserNested;
  bio: string;
  buffer_time: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ProviderDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ServiceType {
  id: string;
  name: string;
  providers: string[];
  provider_details: ProviderDetail[];
}

export interface AvailabilitySlot {
  id: string;
  provider: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export type BookingStatus = "booked" | "cancelled" | "completed";

export interface BookingPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface BookingService {
  id: string;
  name: string;
}

/** GET /api/bookings/ and GET /api/bookings/{id}/ */
export interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  note?: string;
  service: BookingService;
  provider: BookingPerson;
  client: BookingPerson;
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
}

export interface OpeningsBusy {
  start_time: string;
  end_time: string;
}

export interface AvailableTimeOption {
  value: string;
  label: string;
}

export interface OpeningsResponse {
  date: string;
  weekday?: number;
  available_times: AvailableTimeOption[];
  /** @deprecated Prefer available_times */
  windows?: OpeningsWindow[];
  busy?: OpeningsBusy[];
  suggested_starts?: string[];
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
  note?: string;
}

export interface PatchUserRolePayload {
  role: UserRole;
}

/** POST /api/availability-slots/ — weekday 0=Mon … 6=Sun */
export interface CreateAvailabilityPayload {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface PatchMePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  provider_profile?: {
    bio?: string;
    buffer_time?: number;
  };
}

export interface CreateServicePayload {
  name: string;
  providers: string[];
}

export interface PatchServicePayload {
  name?: string;
  providers?: string[];
}

export interface CreateProviderPayload {
  user: string;
  bio?: string;
  buffer_time?: number;
}
