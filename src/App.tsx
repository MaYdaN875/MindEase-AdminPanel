import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { RequestsView } from './views/RequestsView';
import type { PsychologistApplication } from './views/RequestsView';
import { DossierView } from './views/DossierView';
import { UserManagementView } from './views/UserManagementView';
import { ReportsView } from './views/ReportsView';
import { CatalogsView } from './views/CatalogsView';
import { AuditLogsView } from './views/AuditLogsView';
import type { AuditLog } from './views/AuditLogsView';
import {
  getVerificationRequests,
  getVerificationRequestDetail,
  assignApplicationRevisor,
  approveApplication,
  requestApplicationChanges,
  rejectApplication,
  getAuditLogs,
  getAdminUsers,
  getSystemRoles,
  updateUserRoles,
  updateUserStatus,
  logoutAdmin
} from './services/adminService';
import type {
  VerificationRequest,
  BackendAuditLog,
  AdminUserRecord,
  RoleRecord
} from './services/adminService';
import './App.css';
import { getStaffSession, canAccess, type StaffSession } from './services/adminService';
import { SupportView } from './views/SupportView';
import { CommunityAdminView } from './views/CommunityAdminView';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [supportTicketId, setSupportTicketId] = useState<string | undefined>();
  const staffRoles = session?.roles ?? [];
  useEffect(() => {
    const expired = () => { setToken(null); setSession(null); };
    window.addEventListener('admin-session-expired', expired);
    return () => window.removeEventListener('admin-session-expired', expired);
  }, []);
  
  const [applications, setApplications] = useState<PsychologistApplication[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load state from backend when authenticated
  useEffect(() => {
    if (token) {
      fetchBackendData();
    }
  }, [token]);

  const fetchBackendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await getStaffSession();
      setSession(current);
      setCurrentView(view => canAccess(current.roles, view) ? view :
        ['dashboard', 'moderation', 'support'].find(v => canAccess(current.roles, v))!);
      const [reqs, logs, dbUsers, dbRoles] = await Promise.all([
        canAccess(current.roles, 'requests') ? getVerificationRequests() : Promise.resolve([]),
        canAccess(current.roles, 'audit') ? getAuditLogs() : Promise.resolve([]),
        canAccess(current.roles, 'users') ? getAdminUsers() : Promise.resolve([]),
        canAccess(current.roles, 'users') ? getSystemRoles() : Promise.resolve([]),
      ]);

      setApplications(reqs.map(mapBackendToApplication));
      setAuditLogs(logs.map(mapBackendToAuditLog));
      setUsers(dbUsers);
      setRoles(dbRoles);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403 || err.message === 'Esta cuenta no tiene acceso al panel.') {
        handleLogout();
      } else {
        setError('Failed to fetch data from backend. Make sure the Node server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('admin_token'));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logoutAdmin();
    setToken(null);
    setSession(null);
    setApplications([]); setUsers([]); setAuditLogs([]); setRoles([]); setSelectedRequest(null);
    setCurrentView('dashboard');
  };

  // Helper to map DB VerificationRequest to UI PsychologistApplication
  const mapBackendToApplication = (req: VerificationRequest): PsychologistApplication => {
    const prof = req.psychologist;
    const user = prof.user || { id: '', name: 'Unknown', email: '' };
    
    let displayStatus: PsychologistApplication['status'] = 'Pending';
    if (prof.status === 'VERIFICADO') displayStatus = 'Verified';
    else if (prof.status === 'RECHAZADO') displayStatus = 'Rejected';
    else if (prof.status === 'REQUIERE_CAMBIOS') displayStatus = 'Requires Changes';
    else if (prof.status === 'REGISTRO_INCOMPLETO') displayStatus = 'Incomplete';
    else if (prof.status === 'EN_REVISION') displayStatus = 'Pending';

    const initials = user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const specialtyList = prof.specialties.map((s) => s.specialty.name).join(', ') || 'Clinical Psychology';
    
    const createdDate = new Date(req.createdAt);
    const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    let revisorName = 'Unassigned';
    if (req.revisorId) {
      revisorName = `Admin (#${req.revisorId.substring(0, 5)})`;
    }

    return {
      id: req.id,
      name: user.name,
      initials,
      specialty: specialtyList,
      state: prof.location || 'Guadalajara, Jalisco',
      date: dateStr,
      time: timeStr,
      status: displayStatus,
      revisor: revisorName,
      avatarUrl: prof.photoUrl || undefined,
      email: user.email,
      phone: user.phone || undefined,
      licenseNumber: prof.licenseNumber || undefined,
      bio: prof.description || undefined,
      academicBackground: prof.academicBackground || undefined,
      experience: prof.experience || undefined,
      consultationPrice: prof.consultationPrice || undefined,
    };
  };

  // Helper to map DB AuditLog to UI AuditLog
  const mapBackendToAuditLog = (log: BackendAuditLog): AuditLog => {
    let evType: AuditLog['eventType'] = log.action;
    if (log.action === 'APPROVE_APPLICATION') evType = 'APPROVE_APPLICATION';
    else if (log.action === 'REJECT_APPLICATION') evType = 'REJECT_APPLICATION';
    else if (log.action === 'REQUEST_CHANGES') evType = 'REQUEST_CHANGES';
    else if (log.action === 'ASSIGN_REVISOR') evType = 'ASSIGN_REVISOR';
    else if (log.action === 'AUTH_FAILURE') evType = 'AUTH_FAILURE';
    else if (log.action === 'DATA_EXPORT') evType = 'DATA_EXPORT';

    let severity: AuditLog['severity'] = 'routine';
    if (log.action === 'AUTH_FAILURE') severity = 'critical';
    else if (log.action === 'APPROVE_APPLICATION' || log.action === 'REJECT_APPLICATION' || log.action === 'DATA_EXPORT') severity = 'high';

    const createdDate = new Date(log.createdAt);
    const dateStr = createdDate.toISOString().replace('T', ' ').slice(0, 19);

    let desc = `${log.action}`;
    if (log.details && typeof log.details === 'object') {
      desc += `: ${JSON.stringify(log.details)}`;
    } else if (log.details) {
      desc += `: ${log.details}`;
    }

    return {
      timestamp: dateStr,
      adminName: log.user?.name || 'System Revisor',
      adminId: log.userId ? `ADM-${log.userId.substring(0, 5)}` : 'SYS',
      eventType: evType,
      severity,
      description: desc,
      ipAddress: log.ipAddress || 'No registrada',
    };
  };

  const handleOpenDossier = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getVerificationRequestDetail(id);
      setSelectedRequest(detail);
      setCurrentView('dossier');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch detailed dossier from the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await approveApplication(id);
      await fetchBackendData();
      if (selectedRequest && selectedRequest.id === id) {
        const detail = await getVerificationRequestDetail(id);
        setSelectedRequest(detail);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to approve application on the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string, notes: string) => {
    setLoading(true);
    setError(null);
    try {
      await rejectApplication(id, notes);
      await fetchBackendData();
      if (selectedRequest && selectedRequest.id === id) {
        const detail = await getVerificationRequestDetail(id);
        setSelectedRequest(detail);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to reject application on the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async (id: string, notes: string) => {
    setLoading(true);
    setError(null);
    try {
      await requestApplicationChanges(id, notes);
      await fetchBackendData();
      if (selectedRequest && selectedRequest.id === id) {
        const detail = await getVerificationRequestDetail(id);
        setSelectedRequest(detail);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit change requests on the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRevisor = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await assignApplicationRevisor(id);
      await fetchBackendData();
      if (selectedRequest && selectedRequest.id === id) {
        const detail = await getVerificationRequestDetail(id);
        setSelectedRequest(detail);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to assign revisor on the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoles = async (userId: string, newRoles: string[]) => {
    await updateUserRoles(userId, newRoles);
    await fetchBackendData();
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    await updateUserStatus(userId, newStatus);
    await fetchBackendData();
  };

  const renderActiveView = () => {
    if (!canAccess(staffRoles, currentView)) return <p>{session ? 'No tienes permiso para esta sección. Selecciona una opción del menú.' : 'Cargando permisos del panel…'}</p>;
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onViewChange={setCurrentView}
            pendingRequestsCount={applications.filter((a) => a.status === 'Pending').length}
          />
        );
      case 'requests':
        return (
          <RequestsView
            applications={applications}
            onOpenDossier={handleOpenDossier}
            onApprove={handleApprove}
            onReject={handleOpenDossier}
            onRequestChanges={handleOpenDossier}
          />
        );
      case 'dossier':
        if (selectedRequest) {
          const mappedApp = mapBackendToApplication(selectedRequest);
          return (
            <DossierView
              app={mappedApp}
              documents={selectedRequest.psychologist.documents || []}
              statusHistory={selectedRequest.psychologist.statusHistory || []}
              onBack={() => {
                setSelectedRequest(null);
                setCurrentView('requests');
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onAssignRevisor={handleAssignRevisor}
            />
          );
        }
        return <div className="text-center p-8 text-on-surface-variant text-sm">No psychologist dossier selected.</div>;
      case 'users':
        return (
          <UserManagementView
            users={users}
            roles={roles}
            onUpdateRoles={handleUpdateRoles}
            onUpdateStatus={handleUpdateStatus}
            onOpenDossier={handleOpenDossier}
            onRefresh={fetchBackendData}
          />
        );
      case 'moderation':
        return <ReportsView roles={staffRoles} onOpenTicket={id => { setSupportTicketId(id); setCurrentView('support'); }} />;
      case 'community':
        return <CommunityAdminView roles={staffRoles} />;
      case 'support':
        return <SupportView key={supportTicketId ?? 'inbox'} userId={session!.id} initialTicketId={supportTicketId} />;
      case 'catalogs':
        return <CatalogsView />;
      case 'audit':
        return <AuditLogsView logs={auditLogs} />;
      default:
        return (
          <DashboardView
            onViewChange={setCurrentView}
            pendingRequestsCount={applications.filter((a) => a.status === 'Pending').length}
          />
        );
    }
  };

  // If not authenticated, render Login view
  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Sidebar Navigation */}
      <Sidebar
        roles={staffRoles}
        currentView={currentView}
        onViewChange={setCurrentView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          currentView={currentView}
          name={session?.name ?? 'Cargando…'}
          roles={staffRoles}
          onLogout={handleLogout}
        />

        {/* Global Loading / Error Banners */}
        {loading && (
          <div className="bg-secondary-container/20 border-b border-secondary/20 px-gutter py-2 text-center text-xs font-semibold text-secondary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            Synchronizing data with the Node.js API backend...
          </div>
        )}
        {error && (
          <div className="bg-error-container/20 border-b border-error/20 px-gutter py-2 text-center text-xs font-semibold text-error flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
            <button onClick={fetchBackendData} className="underline hover:text-red-950 font-bold ml-2">Retry</button>
          </div>
        )}

        {/* Scrollable central content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-gutter max-w-container-max mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
