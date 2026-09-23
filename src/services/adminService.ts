import api from './api';
import { hasStaffRole } from './permissions';
export { canAccess } from './permissions';
export interface StaffSession { id: string; name: string; email: string; roles: string[] }
export async function getStaffSession(): Promise<StaffSession> {
  const response = await api.get('/users/profile');
  const user = response.data.data.user as StaffSession;
  if (!hasStaffRole(user.roles)) throw new Error('Esta cuenta no tiene acceso al panel.');
  return user;
}

async function allReportPages<T>(route: string, params?: object): Promise<T[]> {
  const items: T[] = []; const seen = new Set<string>(); let cursor: string | undefined;
  do {
    const { data } = await api.get(route, { params: { ...params, limit: 50, cursor } });
    items.push(...data.data.items);
    const next = data.data.hasMore ? data.data.nextCursor : undefined;
    if (next && seen.has(next)) throw new Error('Cursor repetido del servidor');
    if (next) seen.add(next);
    cursor = next;
  } while (cursor);
  return items;
}

export async function openProtectedMedia(value: string): Promise<void> {
  const origin = new URL(api.defaults.baseURL!, window.location.origin).origin;
  const media = new URL(value, origin);
  if (media.origin !== origin || !/^\/uploads\/(support|community)\//.test(media.pathname)) throw new Error('Referencia de archivo no permitida');
  const tab = window.open('about:blank', '_blank');
  if (tab) tab.opener = null;
  try {
    const response = await api.post('/media/access', { url: media.pathname });
    const signed = new URL(response.data.data.url, origin);
    if (signed.origin !== origin || signed.pathname !== media.pathname) throw new Error('Enlace de descarga invalido');
    if (tab) tab.location.replace(signed.href);
    else throw new Error('Permite ventanas emergentes para abrir el archivo');
  } catch (error) { tab?.close(); throw error; }
}


// Types representing the backend database schemas
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface RoleRecord {
  id: string;
  name: string;
}

export interface UserRoleRecord {
  userId: string;
  roleId: string;
  role: RoleRecord;
}

export interface UserConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  acceptedAt: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
  userRoles: UserRoleRecord[];
  psychologistProfile?: PsychologistProfile | null;
  consents?: UserConsentRecord[];
}

export interface Specialty {
  id: string;
  name: string;
}

export interface PsychologistSpecialty {
  specialtyId: string;
  specialty: Specialty;
}

export interface ProfessionalDocument {
  id: string;
  psychologistId: string;
  documentType: string; // e.g. "ID", "DEGREE", "LICENSE", "OTHER"
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  expiresAt?: string | null;
}

export const updateDocumentStatus = async (
  documentId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  expiresAt?: string | null
): Promise<ProfessionalDocument> => {
  const response = await api.put(`/admin/documents/${documentId}/status`, {
    status,
    expiresAt,
  });
  return response.data.data.document;
};

export interface VerificationStatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  comment?: string | null;
  changedAt: string;
  changedBy: {
    name: string;
    email: string;
  };
}

export interface VerificationReview {
  id: string;
  requestId: string;
  revisorId: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
  notes?: string | null;
  createdAt: string;
}

export interface PsychologistProfile {
  id: string;
  userId: string;
  photoUrl?: string | null;
  description?: string | null;
  academicBackground?: string | null;
  experience?: string | null;
  consultationPrice?: number | null;
  languages?: string | null;
  location?: string | null;
  licenseNumber?: string | null;
  status: string; // REGISTRO_INCOMPLETO, PENDIENTE_REVISION, EN_REVISION, REQUIERE_CAMBIOS, VERIFICADO, SUSPENDIDO, etc.
  createdAt: string;
  user?: User;
  specialties: PsychologistSpecialty[];
  documents?: ProfessionalDocument[];
  statusHistory?: VerificationStatusHistory[];
}

export interface VerificationRequest {
  id: string;
  psychologistId: string;
  revisorId?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  psychologist: PsychologistProfile;
  reviews?: VerificationReview[];
}

export interface BackendAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: any;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

// API methods to connect to Node.js backend
export const loginAdmin = async (email: string, password: string): Promise<string> => {
  const response = await api.post('/auth/login', { email, password });
  if (!hasStaffRole(response.data.data.user.roles)) throw new Error('Esta cuenta no tiene acceso al panel.');
  const token = response.data.data.token;
  localStorage.setItem('admin_token', token);
  return token;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem('admin_token');
};

export const getVerificationRequests = async (status?: string): Promise<VerificationRequest[]> => {
  const query = status ? `?status=${status}` : '';
  const response = await api.get(`/admin/psychologist-applications${query}`);
  return response.data.data.applications;
};

export const getVerificationRequestDetail = async (applicationId: string): Promise<VerificationRequest> => {
  const response = await api.get(`/admin/psychologist-applications/${applicationId}`);
  return response.data.data.request;
};

export const assignApplicationRevisor = async (applicationId: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${applicationId}/assign`);
};

export const approveApplication = async (applicationId: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${applicationId}/approve`);
};

export const requestApplicationChanges = async (applicationId: string, notes: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${applicationId}/request-changes`, { notes });
};

export const rejectApplication = async (applicationId: string, notes: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${applicationId}/reject`, { notes });
};

export const getAuditLogs = async (): Promise<BackendAuditLog[]> => {
  const response = await api.get('/admin/audit-logs');
  return response.data.data.logs;
};

// Downloads file secure content as a Blob and converts to a local url with MIME override
export const getDocumentBlobUrl = async (documentId: string, filename?: string): Promise<string> => {
  const response = await api.get(`/admin/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  
  let blob = response.data;
  
  // If the MIME type is generic application/octet-stream, override it using the file extension
  if ((blob.type === 'application/octet-stream' || !blob.type) && filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      blob = new Blob([blob], { type: 'application/pdf' });
    } else if (ext === 'png') {
      blob = new Blob([blob], { type: 'image/png' });
    } else if (ext === 'jpg' || ext === 'jpeg') {
      blob = new Blob([blob], { type: 'image/jpeg' });
    }
  }
  
  return URL.createObjectURL(blob);
};

// User & Role Management APIs
export const getAdminUsers = async (params?: {
  search?: string;
  role?: string;
  status?: string;
}): Promise<AdminUserRecord[]> => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await api.get(`/admin/users${query}`);
  return response.data.data.users;
};

export const getSystemRoles = async (): Promise<RoleRecord[]> => {
  const response = await api.get('/admin/roles');
  return response.data.data.roles;
};

export const updateUserRoles = async (userId: string, roles: string[]): Promise<void> => {
  await api.put(`/admin/users/${userId}/roles`, { roles });
};

export const updateUserStatus = async (userId: string, status: string): Promise<void> => {
  await api.put(`/admin/users/${userId}/status`, { status });
};

// Dynamic Specialties Management APIs
export interface SpecialtyRecord {
  id: string;
  name: string;
  _count?: {
    psychologists: number;
  };
}

export const getAdminSpecialties = async (): Promise<SpecialtyRecord[]> => {
  const response = await api.get('/admin/specialties');
  return response.data.data.specialties;
};

export const createAdminSpecialty = async (name: string): Promise<SpecialtyRecord> => {
  const response = await api.post('/admin/specialties', { name });
  return response.data.data.specialty;
};

export const updateAdminSpecialty = async (specialtyId: string, name: string): Promise<SpecialtyRecord> => {
  const response = await api.put(`/admin/specialties/${specialtyId}`, { name });
  return response.data.data.specialty;
};

export const deleteAdminSpecialty = async (specialtyId: string): Promise<void> => {
  await api.delete(`/admin/specialties/${specialtyId}`);
};

// ----------------------------------------------------
// Dashboard & Analytics APIs (Punto 3)
// ----------------------------------------------------
export interface TopSpecialtyItem {
  id: string;
  name: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalPsychologists: number;
  verifiedPsychologists: number;
  pendingRequests: number;
  resolvedRequests: number;
  approvalRate: number;
  statusDistribution: Record<string, number>;
  topSpecialties: TopSpecialtyItem[];
  recentAuditLogs: BackendAuditLog[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data.data.stats;
};

// ----------------------------------------------------
// Compliance CSV Export (Punto 4)
// ----------------------------------------------------
export const downloadAuditLogsCsv = async (): Promise<void> => {
  const response = await api.get('/admin/audit-logs/export-csv', {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `mindease_compliance_audit_logs_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// System Notifications APIs (Punto 5)
// ----------------------------------------------------
export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const getNotifications = async (): Promise<{
  notifications: SystemNotification[];
  unreadCount: number;
}> => {
  const response = await api.get('/admin/notifications');
  return response.data.data;
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await api.put(`/admin/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.put('/admin/notifications/mark-all-read');
};

export const broadcastNotification = async (params: {
  title: string;
  message: string;
  targetUserId?: string;
}): Promise<void> => {
  await api.post('/admin/notifications/broadcast', params);
};

// ----------------------------------------------------
// Moderation & Reports APIs (Community & User Conduct)
// ----------------------------------------------------

export interface CommunityReportRecord {
  id: string;
  reporterId: string;
  channelId?: string | null;
  postId?: string | null;
  commentId?: string | null;
  reason: string;
  details?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  moderatorNotes?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  channel?: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  post?: {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
    author: {
      id: string;
      name: string;
    };
  } | null;
  comment?: {
    id: string;
    content: string;
    isHidden: boolean;
    user: {
      id: string;
      name: string;
    };
  } | null;
}

export interface UserConductReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  appointmentId?: string | null;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  reviewedById?: string | null;
  moderatorNotes?: string | null;
  ticketId?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    psychologistProfile?: {
      id: string;
      status: string;
    } | null;
  };
  appointment?: {
    id: string;
    startAt: string;
    status: string;
    price: number;
  } | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  ticket?: {
    id: string;
    ticketNumber: number;
    status: string;
  } | null;
}

export const getCommunityReports = async (params?: {
  status?: string;
  targetType?: string;
}): Promise<CommunityReportRecord[]> => {
  return allReportPages<CommunityReportRecord>('/community/reports', params);
};

export const resolveCommunityReport = async (
  reportId: string,
  status: 'RESOLVED' | 'DISMISSED',
  moderatorNotes?: string
): Promise<void> => {
  await api.put(`/community/reports/${reportId}/review`, { status, moderatorNotes });
};

export const toggleCommunityPostVisibility = async (
  postId: string,
  action: 'HIDE' | 'UNHIDE',
  hiddenReason: string
): Promise<void> => {
  await api.put(`/community/posts/${postId}/moderate`, { action, hiddenReason });
};

export const getUserConductReports = async (params?: {
  status?: string;
  reason?: string;
}): Promise<UserConductReportRecord[]> => {
  return allReportPages<UserConductReportRecord>('/support/user-reports', params);
};

export const investigateUserConductReport = async (
  reportId: string,
  payload: {
    status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    moderatorNotes?: string;
    escalateToTicket?: boolean;
  }
): Promise<{ report: any; ticket?: any }> => {
  const response = await api.put(`/support/user-reports/${reportId}/investigate`, payload);
  return response.data.data;
};
