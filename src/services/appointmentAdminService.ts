import api from './api';

export interface AdminAppointment {
  id: string; status: string; startAt: string; endAt: string; createdAt: string; updatedAt: string;
  user: { id: string; name: string };
  psychologist: { id: string; user: { id: string; name: string } };
  consultation: { id: string; status: string; startedAt: string | null; endedAt: string | null } | null;
  payment: { id: string; status: string } | null;
}
export interface AppointmentFilters { search?: string; status?: string; consultationStatus?: string; paymentStatus?: string; from?: string; to?: string }
export interface AppointmentPage { items: AdminAppointment[]; total: number; page: number; hasMore: boolean; counts: { status: string; count: number }[] }
export const listAdminAppointments = async (filters: AppointmentFilters, page: number, signal?: AbortSignal): Promise<AppointmentPage> =>
  (await api.get('/admin/appointments', { params: { ...filters, page, limit: 20 }, signal })).data.data;
export const getAdminAppointment = async (id: string, signal?: AbortSignal): Promise<AdminAppointment> =>
  (await api.get(`/admin/appointments/${encodeURIComponent(id)}`, { signal })).data.data;
