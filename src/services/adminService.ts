import api from './api';

// Types representing the backend database schemas
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
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
}

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
  status: string; // REGISTRO_INCOMPLETO, PENDIENTE_REVISION, EN_REVISION, REQUIERE_CAMBIOS, VERIFICADO, etc.
  createdAt: string;
  user: User;
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
