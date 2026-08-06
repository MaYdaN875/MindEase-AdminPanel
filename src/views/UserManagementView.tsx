import React, { useState } from 'react';
import type { PsychologistApplication } from './RequestsView';

interface UserManagementViewProps {
  applications: PsychologistApplication[];
  onOpenDossier: (id: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  applications,
  onOpenDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'practitioners'>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock patients state
  const [patients, setPatients] = useState([
    { id: 'PT-992-481', name: 'John Doe', initials: 'JD', status: 'Verified', reports: 0, date: 'Oct 12, 2023' },
    { id: 'PT-114-882', name: 'Alice Smith', initials: 'AS', status: 'Pending Review', reports: 2, date: 'Nov 04, 2023' },
    { id: 'PT-552-091', name: 'Michael Ray', initials: 'MR', status: 'Suspended', reports: 5, date: 'Jan 15, 2023' },
    { id: 'PT-602-124', name: 'Clara Oswald', initials: 'CO', status: 'Verified', reports: 1, date: 'Sep 28, 2023' },
    { id: 'PT-451-902', name: 'Daniel Craig', initials: 'DC', status: 'Verified', reports: 0, date: 'Oct 02, 2023' },
  ]);

  const togglePatientStatus = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: p.status === 'Suspended' ? 'Verified' : 'Suspended'
        };
      }
      return p;
    }));
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPractitioners = applications.filter(pr => 
    pr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">User Management</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Oversee patient access, monitor practitioner compliance, and manage platform roles.
          </p>
        </div>
        
        {/* Toggle tabs */}
        <div className="inline-flex bg-surface-container-high rounded-lg p-1 shrink-0 shadow-inner">
          <button
            onClick={() => { setActiveTab('patients'); setSearchQuery(''); }}
            className={`px-5 py-1.5 rounded font-label-caps text-xs font-bold transition-all w-28 text-center uppercase ${
              activeTab === 'patients'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => { setActiveTab('practitioners'); setSearchQuery(''); }}
            className={`px-5 py-1.5 rounded font-label-caps text-xs font-bold transition-all w-28 text-center uppercase ${
              activeTab === 'practitioners'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Practitioners
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Total Active Patients</span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-primary">14,285</span>
            <span className="font-body-sm text-xs text-secondary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.4%
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-error/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Flagged Accounts</span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-error">
              {patients.filter(p => p.reports > 0).length}
            </span>
            <span className="font-body-sm text-xs text-error flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +5
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Verified Practitioners</span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-primary">
              {applications.filter(a => a.status === 'Verified').length}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest font-label-caps text-xs text-on-surface flex items-center gap-1 hover:bg-surface-variant transition-colors font-semibold">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </button>
            <button className="px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest font-label-caps text-xs text-on-surface flex items-center gap-1 hover:bg-surface-variant transition-colors font-semibold">
              <span className="material-symbols-outlined text-sm">download</span> Export
            </button>
          </div>
          
          {/* Search bar inside toolbar */}
          <div className="relative w-full sm:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
            <input
              className="pl-8 pr-3 py-1.5 border border-outline-variant rounded-lg font-body-sm text-xs text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-secondary focus:border-secondary w-full shadow-sm outline-none"
              placeholder={`Search ${activeTab}...`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === 'patients' ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-outline-variant/40">
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-[250px]">Patient ID / Name</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Status</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase text-right">Reports</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Consent Date</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className={`hover:bg-surface-bright transition-colors group ${pat.status === 'Suspended' ? 'bg-red-50/20' : ''}`}>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center text-primary font-bold text-xs select-none">
                          {pat.initials}
                        </div>
                        <div>
                          <div className="font-body-md text-sm font-semibold text-primary">{pat.name}</div>
                          <div className="font-data-mono text-[10px] text-on-surface-variant">{pat.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      {pat.status === 'Verified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary-container text-[#166534] border border-secondary/20 font-semibold font-label-caps text-[10px] uppercase">
                          Verified
                        </span>
                      )}
                      {pat.status === 'Pending Review' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FFEDD5] text-[#9A3412] border border-[#fed7aa] font-semibold font-label-caps text-[10px] uppercase">
                          Pending Review
                        </span>
                      )}
                      {pat.status === 'Suspended' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#fecaca] font-semibold font-label-caps text-[10px] uppercase">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-6 text-right font-data-mono font-semibold ${pat.reports > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {pat.reports}
                    </td>
                    <td className="py-3 px-6 font-body-sm text-on-surface-variant font-semibold">{pat.date}</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-on-primary-container hover:text-primary hover:bg-surface-container rounded" title="View Profile">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => togglePatientStatus(pat.id)}
                          className={`p-1 rounded ${pat.status === 'Suspended' ? 'text-secondary hover:text-secondary-container' : 'text-outline hover:text-error'} hover:bg-surface-container`}
                          title={pat.status === 'Suspended' ? 'Unsuspend' : 'Suspend Account'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {pat.status === 'Suspended' ? 'lock_open' : 'block'}
                          </span>
                        </button>
                        <button className="p-1 text-on-primary-container hover:text-primary hover:bg-surface-container rounded" title="More Actions">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-outline-variant/40">
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-[250px]">Practitioner ID / Name</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Status</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Specialty</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Revisor</th>
                  <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredPractitioners.map((prac) => (
                  <tr key={prac.id} className="hover:bg-surface-bright transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        {prac.avatarUrl ? (
                          <img alt={prac.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant" src={prac.avatarUrl} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center text-primary font-bold text-xs">
                            {prac.initials}
                          </div>
                        )}
                        <div>
                          <div className="font-body-md text-sm font-semibold text-primary">{prac.name}</div>
                          <div className="font-data-mono text-[10px] text-on-surface-variant">{prac.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      {prac.status === 'Verified' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary-container text-[#166534] border border-secondary/20 font-semibold font-label-caps text-[10px] uppercase">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FFEDD5] text-[#9A3412] border border-[#fed7aa] font-semibold font-label-caps text-[10px] uppercase">
                          {prac.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 font-body-sm text-on-surface-variant font-semibold">{prac.specialty}</td>
                    <td className="py-3 px-6 font-body-sm text-on-surface-variant font-semibold">
                      {prac.revisor === 'Unassigned' ? <span className="italic text-outline">Unassigned</span> : prac.revisor}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onOpenDossier(prac.id)}
                          className="p-1 text-on-primary-container hover:text-primary hover:bg-surface-container rounded"
                          title="View Profile / Dossier"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button className="p-1 text-on-primary-container hover:text-error hover:bg-surface-container rounded" title="Suspend">
                          <span className="material-symbols-outlined text-[18px]">block</span>
                        </button>
                        <button className="p-1 text-on-primary-container hover:text-primary hover:bg-surface-container rounded" title="More Actions">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
