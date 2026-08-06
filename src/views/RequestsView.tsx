import React, { useState } from 'react';

export interface PsychologistApplication {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  state: string;
  date: string;
  time: string;
  status: 'Pending' | 'Incomplete' | 'Verified' | 'Requires Changes' | 'Rejected';
  revisor: string;
  avatarUrl?: string;
  bio?: string;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  academicBackground?: string;
  experience?: string;
  consultationPrice?: number;
}

interface RequestsViewProps {
  applications: PsychologistApplication[];
  onOpenDossier: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  applications,
  onOpenDossier,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stats calculation
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const incompleteCount = applications.filter((a) => a.status === 'Incomplete' || a.status === 'Requires Changes').length;
  const verifiedCount = applications.filter((a) => a.status === 'Verified').length;

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'All' || app.specialty === specialtyFilter;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSpecialty && matchesSearch;
  });

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Title */}
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Psychologist Applications</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Review and audit incoming practitioner credentials for compliance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Pending Review</h3>
            <div className="w-8 h-8 rounded-full bg-[#fef3c7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#b45309] text-[18px]">hourglass_empty</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-on-background font-bold">{pendingCount}</span>
            <span className="font-body-sm text-xs text-error flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12% vs last week
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Awaiting Docs / Changes</h3>
            <div className="w-8 h-8 rounded-full bg-error-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error-container text-[18px]">description</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-on-background font-bold">{incompleteCount}</span>
            <span className="font-body-sm text-xs text-secondary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_down</span> 4% vs last week
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-semibold">Verified Total</h3>
            <div className="w-8 h-8 rounded-full bg-secondary-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-on-background font-bold">{verifiedCount}</span>
            <span className="font-body-sm text-xs text-outline font-semibold">Consistent volume</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-4 border-b border-outline-variant bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface-variant bg-surface-container-lowest hover:bg-surface-variant transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed text-xs">
              Bulk Actions
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>
            <div className="w-px h-6 bg-outline-variant mx-1 hidden sm:block"></div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 border border-outline-variant rounded-lg font-body-sm text-xs text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-secondary focus:border-secondary shadow-sm outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Requires Changes">Requires Changes</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 border border-outline-variant rounded-lg font-body-sm text-xs text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-secondary focus:border-secondary shadow-sm outline-none"
              >
                <option value="All">Specialty: All</option>
                <option value="Clinical Psychology">Clinical Psychology</option>
                <option value="Neuropsychology">Neuropsychology</option>
                <option value="Counseling Psychology">Counseling</option>
                <option value="Child Psychology">Child Psychology</option>
              </select>
            </div>
          </div>

          {/* Table Search */}
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
            <input
              className="pl-8 pr-3 py-1.5 border border-outline-variant rounded-lg font-body-sm text-xs text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-secondary focus:border-secondary w-full sm:w-48 shadow-sm outline-none"
              placeholder="Search names or IDs..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-outline-variant">
                <th className="p-3 w-12 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">Psychologist Name</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">Specialty & State</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">Submitted Date</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">Status</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">Revisor</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-on-surface-variant text-sm font-body-sm">
                    No psychologist applications match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-3 text-center">
                      <input className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {app.avatarUrl ? (
                          <img alt={app.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant" src={app.avatarUrl} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                            {app.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-body-md text-sm font-semibold text-on-background">{app.name}</p>
                          <p className="font-data-mono text-[10px] text-outline">{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-body-sm text-xs text-on-surface">{app.specialty}</p>
                      <p className="font-body-sm text-xs text-outline">{app.state}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-body-sm text-xs text-on-surface">{app.date}</p>
                      <p className="font-body-sm text-[11px] text-outline">{app.time}</p>
                    </td>
                    <td className="py-3 px-4">
                      {app.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] font-label-caps text-[10px] border border-[#fde68a] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span>
                          Pending
                        </span>
                      )}
                      {app.status === 'Incomplete' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-[10px] border border-outline-variant/50 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          Incomplete
                        </span>
                      )}
                      {app.status === 'Requires Changes' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-label-caps text-[10px] border border-orange-200 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Needs Changes
                        </span>
                      )}
                      {app.status === 'Verified' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] font-label-caps text-[10px] border border-[#bbf7d0] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                          Verified
                        </span>
                      )}
                      {app.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-label-caps text-[10px] border border-red-200 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-body-sm text-xs text-on-surface font-semibold">
                      {app.revisor === 'Unassigned' ? (
                        <span className="text-outline italic">Unassigned</span>
                      ) : (
                        app.revisor
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onOpenDossier(app.id)}
                          className="p-1 text-outline hover:text-primary hover:bg-surface-container rounded transition-colors"
                          title="Open Dossier"
                        >
                          <span className="material-symbols-outlined text-[18px]">folder_open</span>
                        </button>
                        {app.status !== 'Verified' && app.status !== 'Rejected' && (
                          <>
                            <button
                              onClick={() => onApprove(app.id)}
                              className="p-1 text-outline hover:text-secondary hover:bg-surface-container rounded transition-colors"
                              title="Approve"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                            <button
                              onClick={() => onRequestChanges(app.id)}
                              className="p-1 text-outline hover:text-[#b45309] hover:bg-surface-container rounded transition-colors"
                              title="Request Changes"
                            >
                              <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                            </button>
                            <button
                              onClick={() => onReject(app.id)}
                              className="p-1 text-outline hover:text-error hover:bg-surface-container rounded transition-colors"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="font-body-sm text-xs text-outline font-semibold">
            Showing 1 to {filteredApps.length} of {filteredApps.length} entries
          </span>
          <div className="flex gap-1 text-xs font-semibold">
            <button className="px-2.5 py-1.5 border border-outline-variant rounded bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-50 font-body-sm" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1.5 border border-primary bg-primary text-on-primary rounded font-body-sm">
              1
            </button>
            <button className="px-2.5 py-1.5 border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-variant rounded font-body-sm transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
