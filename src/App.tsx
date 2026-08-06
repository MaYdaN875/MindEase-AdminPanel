import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { RequestsView } from './views/RequestsView';
import type { PsychologistApplication } from './views/RequestsView';
import { DossierView } from './views/DossierView';
import { UserManagementView } from './views/UserManagementView';
import { ReportsView } from './views/ReportsView';
import { CatalogsView } from './views/CatalogsView';
import { AuditLogsView } from './views/AuditLogsView';
import type { AuditLog } from './views/AuditLogsView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(null);

  // Helper to format date
  const getFormattedDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    return `${dateStr} ${timeStr}`;
  };

  // Mock initial applications state
  const [applications, setApplications] = useState<PsychologistApplication[]>([
    {
      id: 'REQ-894-221',
      name: 'Dr. Rebecca Torres',
      initials: 'RT',
      specialty: 'Clinical Psychology',
      state: 'California (CA)',
      date: 'Oct 24, 2023',
      time: '14:30 EST',
      status: 'Pending',
      revisor: 'Sarah Jenkins',
      email: 'r.torres@psychologyca.org',
      phone: '+1 555-019-2831',
      licenseNumber: 'CA-PSY-88291',
      bio: 'Dr. Rebecca Torres is a licensed Clinical Psychologist in California with a private practice focusing on cognitive behavioral therapy for adolescents and adults. She completed her clinical internship at Stanford Health Care.',
      academicBackground: 'Ph.D. in Clinical Psychology - Stanford University (2015)\nM.S. in Counseling Psychology (2012)',
      experience: '7 years in private practice, 2 years clinical residency at Stanford Health Care.',
      consultationPrice: 1200,
    },
    {
      id: 'PSY-2023-8472',
      name: 'Dr. Elena Rostova',
      initials: 'ER',
      specialty: 'Clinical Psychology',
      state: 'Madrid, Spain',
      date: 'Oct 24, 2023',
      time: '12:30 EST',
      status: 'Pending',
      revisor: 'Unassigned',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXsNy8F9rZh5A98lvKogr30pHXrfTe9VnvpI2spwqqrIrowESFtEhD72VbY-Ob1bq-_y51K67psp37mFctj-PPdl1sWjVVk9tA4rWiUsea_tQLtk-xqdc-mtrAf3phf95hhCfTurLpMwYtha_Evoch2rXcQXw8_sV5QuBFjw47xVSK0NfVSSh2LvMT9KO3WlWEKtCRPWmcH6Mzyakk7VP6u-T6s0eQ5kQqVMmw2ap6SS2evhxxV8YkEw',
      email: 'e.rostova@clinicalnetwork.org',
      phone: '+34 600 123 456',
      licenseNumber: 'CED-99887766',
      bio: 'Dr. Rostova specializes in Cognitive Behavioral Therapy (CBT) for adults dealing with severe anxiety disorders and major depressive episodes. With over 15 years of clinical experience across both public hospital settings and private practice, she has developed specialized protocols for acute stress management.',
      academicBackground: 'Ph.D. in Clinical Psychology - Universidad Complutense de Madrid (2012)\nMaster in Cognitive Behavioral Therapy (2014)',
      experience: '15 years of clinical experience across both public hospital settings and private practice.',
      consultationPrice: 700,
    },
    {
      id: 'REQ-894-198',
      name: 'Dr. Marcus Chen',
      initials: 'MC',
      specialty: 'Neuropsychology',
      state: 'New York (NY)',
      date: 'Oct 23, 2023',
      time: '09:15 EST',
      status: 'Incomplete',
      revisor: 'Unassigned',
      email: 'm.chen@nyuneuro.com',
      phone: '+1 555-902-1823',
      licenseNumber: 'NY-NEURO-45129',
      bio: 'Dr. Marcus Chen specializes in neuropsychological assessments for adult patients. His clinical research focuses on early markers of cognitive decline.',
      academicBackground: 'Psy.D. in Neuropsychology - NYU (2017)\nResident Fellowship in Neuropsychology (2019)',
      experience: '5 years of clinical assessments, specializing in geriatric memory disorders.',
      consultationPrice: 1500,
    },
    {
      id: 'REQ-893-012',
      name: 'Dr. Omar Al-Fayed',
      initials: 'OA',
      specialty: 'Counseling Psychology',
      state: 'Texas (TX)',
      date: 'Oct 20, 2023',
      time: '16:45 EST',
      status: 'Verified',
      revisor: 'David Kim',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoN53B56th5nUFfeuUHk_JHmVTf75V3uwQYf893i7xho4YoLhPT-dFLPCpmTuFrfpr04z1y5uUmjCOe1jDHPKxUipibnPdXoTsrw9ecSUWaxd7q5w8R3t-AnWUf-qMiqsJ-2a2V-FnVTY6suXKae_0foNbzB2FT-BiikrtsEtqQhp5lP5h6XPMopZ7GK-ucM1YdODrhqWJwhxfoTxhq8vmXD4koDUjPVdf7KUY-APLc-XS8fu6DYE0_w',
      email: 'o.alfayed@houstoncounseling.net',
      phone: '+1 555-773-1922',
      licenseNumber: 'TX-COUN-92019',
      bio: 'Dr. Omar Al-Fayed has over 12 years of experience providing counseling services for couples and families. He runs group support sessions for PTSD survivors.',
      academicBackground: 'Ph.D. in Counseling - University of Houston (2011)',
      experience: '12 years in family practice and clinical grief counseling.',
      consultationPrice: 900,
    },
    {
      id: 'REQ-894-255',
      name: 'Dr. Elena Larson',
      initials: 'EL',
      specialty: 'Child Psychology',
      state: 'Florida (FL)',
      date: 'Oct 25, 2023',
      time: '08:10 EST',
      status: 'Pending',
      revisor: 'Sarah Jenkins',
      email: 'e.larson@miamichildpsych.com',
      phone: '+1 555-892-0199',
      licenseNumber: 'FL-CHILD-77382',
      bio: 'Dr. Elena Larson is dedicated to evaluating and supporting children with neurodevelopmental differences and behavioral challenges.',
      academicBackground: 'Ph.D. in Child Development & Clinical Psychology - University of Miami (2016)',
      experience: '8 years of child and adolescent therapy in clinic environments.',
      consultationPrice: 1100,
    },
  ]);

  // Mock initial security and audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      timestamp: '2023-10-31 14:22:05',
      adminName: 'Unknown (Failed Auth)',
      adminId: 'SYS-000',
      eventType: 'AUTH_FAILURE',
      severity: 'critical',
      description: 'Multiple failed login attempts detected. Account locked automatically.',
      ipAddress: '192.168.1.105',
    },
    {
      timestamp: '2023-10-31 13:15:42',
      adminName: 'ADM-0942 (Sterling)',
      adminId: 'ADM-942',
      eventType: 'DATA_EXPORT',
      severity: 'high',
      description: 'Exported full clinical dossier for Patient ID: P-88392.',
      ipAddress: '10.0.55.22',
    },
    {
      timestamp: '2023-10-31 09:00:11',
      adminName: 'ADM-0942 (Sterling)',
      adminId: 'ADM-942',
      eventType: 'SESSION_START',
      severity: 'routine',
      description: 'Successful interactive login via SAML SSO.',
      ipAddress: '10.0.55.22',
    },
  ]);

  const handleOpenDossier = (id: string) => {
    setSelectedPsychologistId(id);
    setCurrentView('dossier');
  };

  const handleApprove = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Verified' } : app))
    );

    const app = applications.find((a) => a.id === id);
    if (app) {
      const newLog: AuditLog = {
        timestamp: getFormattedDateTime(),
        adminName: 'Dr. A. Sterling',
        adminId: 'ADM-942',
        eventType: 'APPROVE_APPLICATION',
        severity: 'high',
        description: `Approved psychologist credential profile for ${app.name} (${app.id}). Profile marked VERIFIED.`,
        ipAddress: '10.0.55.22',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleReject = (id: string, notes: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Rejected' } : app))
    );

    const app = applications.find((a) => a.id === id);
    if (app) {
      const newLog: AuditLog = {
        timestamp: getFormattedDateTime(),
        adminName: 'Dr. A. Sterling',
        adminId: 'ADM-942',
        eventType: 'REJECT_APPLICATION',
        severity: 'high',
        description: `Rejected psychologist profile for ${app.name} (${app.id}). Reason: ${notes}`,
        ipAddress: '10.0.55.22',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleRequestChanges = (id: string, notes: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Requires Changes' } : app))
    );

    const app = applications.find((a) => a.id === id);
    if (app) {
      const newLog: AuditLog = {
        timestamp: getFormattedDateTime(),
        adminName: 'Dr. A. Sterling',
        adminId: 'ADM-942',
        eventType: 'REQUEST_CHANGES',
        severity: 'routine',
        description: `Requested credential corrections from ${app.name} (${app.id}). Observations: ${notes}`,
        ipAddress: '10.0.55.22',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleAssignRevisor = (id: string, revisorName: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, revisor: revisorName } : app))
    );

    const app = applications.find((a) => a.id === id);
    if (app) {
      const newLog: AuditLog = {
        timestamp: getFormattedDateTime(),
        adminName: 'Dr. A. Sterling',
        adminId: 'ADM-942',
        eventType: 'SESSION_START',
        severity: 'routine',
        description: `Assigned Revisor ${revisorName} to review psychologist credential file for ${app.name} (${app.id}).`,
        ipAddress: '10.0.55.22',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const renderActiveView = () => {
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
            onReject={(id) => handleReject(id, 'Admin Committee Decision')}
            onRequestChanges={(id) => handleRequestChanges(id, 'Incomplete documentation upload.')}
          />
        );
      case 'dossier':
        const selectedApp = applications.find((a) => a.id === selectedPsychologistId);
        if (selectedApp) {
          return (
            <DossierView
              app={selectedApp}
              onBack={() => setCurrentView('requests')}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onAssignRevisor={handleAssignRevisor}
            />
          );
        }
        return <div className="text-center p-8 text-on-surface-variant text-sm">Application record not found.</div>;
      case 'users':
        return (
          <UserManagementView
            applications={applications}
            onOpenDossier={handleOpenDossier}
          />
        );
      case 'moderation':
        return <ReportsView />;
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

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Sidebar Navigation */}
      <Sidebar
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable central content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-gutter max-w-container-max mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
