import React, { useState } from 'react';
import { downloadAuditLogsCsv } from '../services/adminService';

export interface AuditLog {
  timestamp: string;
  adminName: string;
  adminId: string;
  eventType: string;
  severity: 'critical' | 'high' | 'routine';
  description: string;
  ipAddress: string;
  rawDetails?: any;
}

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogModal, setSelectedLogModal] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await downloadAuditLogsCsv();
    } catch (err) {
      console.error(err);
      alert('Failed to export compliance CSV from backend.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity =
      severityFilter === 'all' || log.severity === severityFilter;

    let matchesEventType = true;
    if (eventTypeFilter === 'dossier') {
      matchesEventType =
        log.eventType.includes('APPLICATION') ||
        log.eventType.includes('REQUEST_CHANGES');
    } else if (eventTypeFilter === 'users') {
      matchesEventType =
        log.eventType.includes('USER') || log.eventType.includes('ROLE');
    } else if (eventTypeFilter === 'specialties') {
      matchesEventType = log.eventType.includes('SPECIALTY');
    } else if (eventTypeFilter === 'docs') {
      matchesEventType =
        log.eventType.includes('DOCUMENT') || log.eventType.includes('VIEW');
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      log.adminName.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.ipAddress.includes(q) ||
      log.eventType.toLowerCase().includes(q) ||
      log.adminId.toLowerCase().includes(q);

    return matchesSeverity && matchesEventType && matchesSearch;
  });

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
            Security & Audit Logs
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Immutable forensic record of clinical decisions, user modifications, and system events.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] ${isExporting ? 'animate-spin' : ''}`}>
            {isExporting ? 'sync' : 'download'}
          </span>
          {isExporting ? 'Generating CSV...' : 'Export Compliance CSV'}
        </button>
      </div>

      {/* Filters Bento */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 flex items-center gap-2 font-bold tracking-wider">
          <span className="material-symbols-outlined text-[16px]">tune</span>
          Filter Forensic Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search ID or Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Search Records
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                person_search
              </span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="Search Action, Admin Name, IP..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Event Category */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Event Category
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all cursor-pointer font-semibold"
            >
              <option value="all">All Events</option>
              <option value="dossier">Dossier Decisions (Approve/Reject/Changes)</option>
              <option value="users">User & Role Management</option>
              <option value="specialties">Specialties Taxonomy</option>
              <option value="docs">Document Access & Downloads</option>
            </select>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Severity Level
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all cursor-pointer font-semibold"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Security & Auth)</option>
              <option value="high">High (Decisions & Exports)</option>
              <option value="routine">Routine (Updates & Config)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Event Log Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px] text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-44">
                  Timestamp (UTC)
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Admin / Source
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-44">
                  Event Action
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Description
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-32">
                  IP Address
                </th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-16 text-center">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 text-on-surface">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-on-surface-variant text-sm font-body-sm italic"
                  >
                    No audit logs matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isCritical = log.severity === 'critical';
                  const isHigh = log.severity === 'high';

                  let badgeClass = 'bg-surface-variant text-on-surface-variant border-outline-variant/50';
                  if (isCritical) badgeClass = 'bg-error-container text-error border-red-200';
                  else if (isHigh) badgeClass = 'bg-secondary-container/20 text-secondary border-secondary';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-surface transition-colors ${
                        isCritical
                          ? 'bg-error-container/10 hover:bg-error-container/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-data-mono text-primary font-semibold whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center text-primary font-label-caps text-[9px] font-bold select-none">
                            {log.adminName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-body-sm font-semibold text-primary">
                            {log.adminName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-caps text-[9px] font-bold border ${badgeClass}`}
                        >
                          {log.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-body-sm text-on-surface-variant font-medium leading-relaxed">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 font-data-mono text-outline font-semibold">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLogModal(log)}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded"
                          title="Inspect Event Metadata"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table pagination */}
        <div className="p-4 border-t border-outline-variant bg-[#F8FAFC] flex justify-between items-center text-xs font-semibold">
          <span className="font-body-sm text-on-surface-variant">
            Showing {filteredLogs.length} of {logs.length} audit records
          </span>
          <div className="flex gap-1">
            <button
              className="px-2.5 py-1.5 border border-outline-variant/50 rounded bg-white text-on-surface-variant hover:bg-surface-container-low font-body-sm disabled:opacity-50"
              disabled
            >
              Prev
            </button>
            <button className="px-2.5 py-1.5 border border-primary bg-primary text-on-primary rounded font-body-sm">
              1
            </button>
            <button className="px-2.5 py-1.5 border border-outline-variant/50 rounded bg-white text-on-surface hover:bg-surface-container-low font-body-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg shadow-2xl animate-scale-in space-y-4">
            <div className="flex justify-between items-start border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">verified_user</span>
                  Forensic Log Inspection
                </h3>
                <span className="font-data-mono text-xs text-on-surface-variant">
                  {selectedLogModal.timestamp}
                </span>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="font-bold text-on-surface-variant">Action Type:</span>
                <span className="font-data-mono font-bold text-primary">
                  {selectedLogModal.eventType}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="font-bold text-on-surface-variant">Operator:</span>
                <span className="font-semibold text-primary">
                  {selectedLogModal.adminName} ({selectedLogModal.adminId})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="font-bold text-on-surface-variant">Origin IP:</span>
                <span className="font-data-mono text-primary">
                  {selectedLogModal.ipAddress}
                </span>
              </div>
              <div>
                <span className="font-bold text-on-surface-variant block mb-1">
                  Description:
                </span>
                <div className="p-3 bg-surface rounded border border-outline-variant/40 font-body-sm text-on-surface">
                  {selectedLogModal.description}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded font-semibold text-xs hover:bg-primary/90"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
