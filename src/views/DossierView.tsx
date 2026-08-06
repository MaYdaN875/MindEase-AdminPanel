import React, { useState } from 'react';
import type { PsychologistApplication } from './RequestsView';

interface DossierViewProps {
  app: PsychologistApplication;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  onRequestChanges: (id: string, notes: string) => void;
  onAssignRevisor: (id: string, name: string) => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
  app,
  onBack,
  onApprove,
  onReject,
  onRequestChanges,
  onAssignRevisor,
}) => {
  const [activeTab, setActiveTab] = useState<string>('tab-general');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [notes, setNotes] = useState('');

  const handleApprove = () => {
    onApprove(app.id);
  };

  const handleAssign = () => {
    onAssignRevisor(app.id, 'Dr. A. Sterling');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onReject(app.id, notes);
      setNotes('');
      setShowRejectForm(false);
    }
  };

  const handleChangesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onRequestChanges(app.id, notes);
      setNotes('');
      setShowChangesForm(false);
    }
  };

  const tabs = [
    { id: 'tab-general', label: 'General Info' },
    { id: 'tab-professional', label: 'Professional Info' },
    { id: 'tab-docs', label: 'Documentation' },
    { id: 'tab-availability', label: 'Availability & Rates' },
    { id: 'tab-history', label: 'Admin History' },
  ];

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-xs">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[16px] font-bold">arrow_back</span>
          Applications List
        </button>
        <span>/</span>
        <span className="text-primary font-bold">{app.name}</span>
      </div>

      {/* Header Dossier Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden shadow-sm">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-surface-container-low to-transparent pointer-events-none"></div>
        
        {app.avatarUrl ? (
          <img
            alt={app.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-outline-variant z-10 shadow-sm shrink-0"
            src={app.avatarUrl}
          />
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-2xl z-10 shadow-sm shrink-0">
            {app.initials}
          </div>
        )}

        <div className="flex-1 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-primary">{app.name}</h2>
                
                {app.status === 'Verified' && (
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed/30 text-secondary border border-secondary/20 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] fill">verified</span> Verified
                  </span>
                )}
                {app.status === 'Pending' && (
                  <span className="px-2 py-0.5 rounded bg-[#fef3c7] text-[#b45309] border border-[#fde68a] font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span> Pending Review
                  </span>
                )}
                {app.status === 'Incomplete' && (
                  <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant border border-outline-variant/50 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">description</span> Incomplete
                  </span>
                )}
                {app.status === 'Requires Changes' && (
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">assignment_return</span> Needs Changes
                  </span>
                )}
                {app.status === 'Rejected' && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">cancel</span> Rejected
                  </span>
                )}
              </div>
              
              <p className="font-body-lg text-sm text-on-surface-variant font-semibold">
                {app.specialty} • License ID: {app.licenseNumber || 'N/A'}
              </p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">location_on</span> {app.state} (GMT+1)
              </p>
            </div>
            
            {/* Top actions card */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {app.revisor === 'Unassigned' && (
                <button
                  onClick={handleAssign}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-lowest text-primary rounded font-label-caps hover:bg-surface-container transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                  Assign to Me
                </button>
              )}
              <button className="px-3 py-2 border border-outline-variant bg-surface-container-lowest text-primary rounded font-label-caps hover:bg-surface-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Message
              </button>
              <button className="px-3 py-2 bg-primary text-on-primary rounded font-label-caps hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-label-caps text-xs tracking-wider uppercase whitespace-nowrap transition-all border-b-2 font-semibold ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === 'tab-general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Professional Biography</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {app.bio || `Dr. specialized in Cognitive Behavioral Therapy (CBT) for adults dealing with severe anxiety disorders and major depressive episodes. With over 10 years of clinical experience across both public hospital settings and private practice.`}
                </p>
                <p className="font-body-md text-sm text-on-surface-variant mt-4 leading-relaxed">
                  Practitioner is fluent in Spanish and English. The therapeutic approach is highly structured, focusing on measurable outcomes, evidence-based interventions, and establishing a safe clinical environment for recovery.
                </p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Core Focus & Demographics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-surface rounded border border-outline-variant/30">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">Accepted Age Groups</span>
                    <span className="font-body-md text-sm text-primary font-bold mt-1 block">Adults (18-64), Elders (65+)</span>
                  </div>
                  <div className="p-3 bg-surface rounded border border-outline-variant/30">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">Languages</span>
                    <span className="font-body-md text-sm text-primary font-bold mt-1 block">Spanish (Native), English (Fluent)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4 border-b border-outline-variant pb-2">Contact Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">mail</span>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Primary Email</p>
                      <p className="font-body-md text-sm text-primary font-bold">{app.email || 'e.rostova@clinicalnetwork.org'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">phone</span>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Phone Number</p>
                      <p className="font-data-mono text-sm text-primary font-bold">{app.phone || '+34 600 123 456'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">home_pin</span>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Clinic Address</p>
                      <p className="font-body-md text-sm text-primary font-bold">Av. Constitución 485, Centro, CP 44100</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-professional' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Credentials & Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Academic Background</h4>
                <p className="font-body-md text-sm text-primary leading-relaxed bg-surface p-4 rounded border border-outline-variant/30">
                  {app.academicBackground || `Ph.D. in Clinical Psychology - Universidad Complutense de Madrid (2012)\nMaster in Cognitive Behavioral Therapy (2014)`}
                </p>
              </div>
              <div>
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Clinical Experience</h4>
                <p className="font-body-md text-sm text-primary leading-relaxed bg-surface p-4 rounded border border-outline-variant/30">
                  {app.experience || `8+ years in Clinical Consultation. Head of anxiety disorders division in private clinic.\n4 years clinical residency program.`}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-outline text-xs block font-semibold">Specialization Cédula</span>
                <span className="font-data-mono text-sm text-primary font-bold mt-1 block">{app.licenseNumber || 'CED-99887766'}</span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Accredited by</span>
                <span className="text-sm text-primary font-bold mt-1 block">Comité de Salud Mental</span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Liability Insurance</span>
                <span className="text-sm text-secondary font-bold mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Active (Covered)
                </span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Criminal Records</span>
                <span className="text-sm text-secondary font-bold mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified_user</span> Clean (Verified)
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-docs' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Secure Documentation</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document Lists */}
              <div className="lg:col-span-4 space-y-3">
                {[
                  { name: 'Official ID (INE/Passport)', type: 'ID', file: 'ine_perez.pdf', size: '1.2 MB', status: 'Verified' },
                  { name: 'Professional License (Cédula)', type: 'DEGREE', file: 'cedula_perez.png', size: '2.4 MB', status: 'Pending Review' },
                  { name: 'University Diploma (Degree)', type: 'DEGREE', file: 'titulo_perez.pdf', size: '4.8 MB', status: 'Pending Review' },
                  { name: 'Criminal Record Certification', type: 'COMPLIANCE', file: 'antecedentes_perez.pdf', size: '920 KB', status: 'Verified' },
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 border border-outline-variant rounded-lg hover:bg-surface transition-colors cursor-pointer flex justify-between items-center bg-surface-container-low/30">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <div>
                        <h4 className="font-body-sm text-xs font-bold text-primary">{doc.name}</h4>
                        <p className="font-data-mono text-[10px] text-outline mt-0.5">{doc.file} • {doc.size}</p>
                      </div>
                    </div>
                    <div>
                      {doc.status === 'Verified' ? (
                        <span className="text-secondary material-symbols-outlined text-lg fill">check_circle</span>
                      ) : (
                        <span className="text-[#b45309] material-symbols-outlined text-lg">hourglass_top</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock PDF Document Viewer */}
              <div className="lg:col-span-8 border border-outline-variant/60 rounded-xl bg-surface p-4 flex flex-col items-center justify-center min-h-[350px] relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-1.5 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-variant flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                  </button>
                  <button className="p-1.5 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-variant flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-sm">zoom_out</span>
                  </button>
                  <button className="p-1.5 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-variant flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
                
                {/* Visual Placeholder for Documents */}
                <div className="text-center p-8 max-w-sm">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">picture_as_pdf</span>
                  <h4 className="font-body-md text-sm font-bold text-primary mb-2">cedula_perez.png</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    This file is securely hosted in MindEase Compliance storage bucket. Revisor has full read access.
                  </p>
                  <div className="mt-4 px-4 py-2 border border-dashed border-outline-variant rounded bg-surface-container-lowest/50 text-xs font-semibold font-data-mono inline-block">
                    MD5: 5b4e311f9f257a419c8f
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-availability' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Rates & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-surface border border-outline-variant/30 rounded-xl text-center">
                <span className="material-symbols-outlined text-3xl text-secondary mb-2">payments</span>
                <h4 className="text-xs font-label-caps text-on-surface-variant uppercase font-bold">Standard Consultation Price</h4>
                <p className="text-2xl font-bold text-primary mt-2">${app.consultationPrice || 700}.00 MXN</p>
                <span className="text-[10px] text-outline mt-1 block">Per 50-minute clinical session</span>
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Weekly Slots Overview</h4>
                <div className="grid grid-cols-5 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/30 bg-surface rounded text-center">
                      <span className="text-xs font-bold text-primary block">{day}</span>
                      <span className="text-[10px] text-secondary font-bold mt-1.5 block">09:00 - 18:00</span>
                      <span className="text-[9px] text-outline mt-0.5 block">5 open slots</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-history' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Administrative Action Logs</h3>
            <div className="space-y-4">
              <div className="relative pl-6 border-l-2 border-outline-variant/60 space-y-6 text-sm">
                {/* Timeline Item 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-secondary border-2 border-surface-container-lowest"></div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-primary">Application Created</span>
                      <span className="font-data-mono text-[10px] text-outline">Oct 24, 2023 14:30 EST</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Self-registration completed from psychological applicant dashboard.</p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-secondary border-2 border-surface-container-lowest"></div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-primary">Revisor Assigned ({app.revisor})</span>
                      <span className="font-data-mono text-[10px] text-outline">Oct 24, 2023 15:00 EST</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Assigned for academic background and identity check.</p>
                  </div>
                </div>

                {/* Timeline Item 3 (Current status) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest"></div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-primary">Current Verification Status: {app.status}</span>
                      <span className="font-data-mono text-[10px] text-outline">Today</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Ongoing audit. Current state is set to: <strong>{app.status}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Action Panels */}
      {app.status !== 'Verified' && app.status !== 'Rejected' && (
        <div className="mt-8 bg-surface-container-low/60 border border-outline-variant rounded-xl p-6 shadow-inner space-y-4">
          <h3 className="font-headline-sm text-sm font-bold text-primary uppercase tracking-wider">
            Revisor Verification Decisions
          </h3>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleApprove}
              className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary/90 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] fill">check_circle</span>
              Approve Psychologist
            </button>

            <button
              onClick={() => {
                setShowChangesForm(true);
                setShowRejectForm(false);
              }}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_return</span>
              Request Corrections
            </button>

            <button
              onClick={() => {
                setShowRejectForm(true);
                setShowChangesForm(false);
              }}
              className="px-5 py-2.5 bg-error text-on-error rounded-lg font-semibold hover:bg-error/90 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject Application
            </button>
          </div>

          {/* Request Changes Form */}
          {showChangesForm && (
            <form onSubmit={handleChangesSubmit} className="mt-4 p-4 border border-outline-variant bg-surface rounded-lg space-y-3 animate-slide-in">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block font-bold">
                Corrections Note (Applicant will see this)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please re-upload your official degree certificate, the current photo is blurred."
                required
                className="w-full h-24 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-semibold text-xs hover:bg-amber-700">
                  Send Corrections Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangesForm(false)}
                  className="px-4 py-2 border border-outline-variant rounded font-semibold text-xs hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="mt-4 p-4 border border-outline-variant bg-surface rounded-lg space-y-3 animate-slide-in">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block font-bold">
                Reason for Rejection (Auditor compliance note)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Identity verification failed. License number is registered under a different name."
                required
                className="w-full h-24 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-error text-on-error rounded font-semibold text-xs hover:bg-error/90">
                  Confirm Administrative Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 border border-outline-variant rounded font-semibold text-xs hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
