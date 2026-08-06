import React, { useState } from 'react';

export interface AuditLog {
  timestamp: string;
  adminName: string;
  adminId: string;
  eventType: 'AUTH_FAILURE' | 'DATA_EXPORT' | 'SESSION_START' | 'APPROVE_APPLICATION' | 'REJECT_APPLICATION' | 'REQUEST_CHANGES';
  severity: 'critical' | 'high' | 'routine';
  description: string;
  ipAddress: string;
}

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesEventType = eventTypeFilter === 'all' || 
      (eventTypeFilter === 'login' && log.eventType === 'SESSION_START') ||
      (eventTypeFilter === 'dossier' && (log.eventType === 'APPROVE_APPLICATION' || log.eventType === 'REJECT_APPLICATION' || log.eventType === 'REQUEST_CHANGES')) ||
      (eventTypeFilter === 'config' && log.eventType === 'DATA_EXPORT');
      
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSeverity && matchesEventType && matchesSearch;
  });

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Security & Audit Logs</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Immutable record of system events, access patterns, and administrative actions.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Compliance CSV
        </button>
      </div>

      {/* Filters Bento */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 flex items-center gap-2 font-bold tracking-wider">
          <span className="material-symbols-outlined text-[16px]">tune</span>
          Filter Criteria
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search ID or Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Admin / User ID</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">person_search</span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="Search ID, Name, Action"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            >
              <option value="all">All Events</option>
              <option value="login">Authentication</option>
              <option value="dossier">Dossier Actions</option>
              <option value="config">Data Export</option>
            </select>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Severity Level</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant font-body-sm text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical / Unauthorized</option>
              <option value="high">High Value Operations</option>
              <option value="routine">Routine</option>
            </select>
          </div>

          {/* Date Range - Mock static label */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Date Range</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg border border-outline-variant font-body-sm text-xs cursor-not-allowed select-none outline-none"
                value="Oct 24 - Oct 31, 2023"
                disabled
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Event Log Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px] text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-48">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Admin / Source</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-40">Event Type</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">Description</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-32">IP Address</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 text-on-surface">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-on-surface-variant text-sm font-body-sm">
                    No audit logs matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isCritical = log.severity === 'critical';
                  const isHigh = log.severity === 'high';
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-surface transition-colors ${
                        isCritical ? 'bg-error-container/10 hover:bg-error-container/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-data-mono text-primary font-semibold whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-caps text-[9px] font-bold select-none">
                            {log.adminId.substring(0, 3)}
                          </div>
                          <span className="font-body-sm font-semibold text-primary">
                            {log.adminName} ({log.adminId})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-label-caps text-[9px] font-bold border border-red-200">
                            <span className="material-symbols-outlined text-[12px] font-bold">warning</span>
                            {log.eventType}
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-secondary text-secondary font-label-caps text-[9px] font-bold bg-secondary-container/20">
                            <span className="material-symbols-outlined text-[12px] font-bold">folder_special</span>
                            {log.eventType}
                          </span>
                        )}
                        {log.severity === 'routine' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-caps text-[9px] font-bold border border-outline-variant/50">
                            <span className="material-symbols-outlined text-[12px]">login</span>
                            {log.eventType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-body-sm text-on-surface-variant font-medium leading-relaxed">{log.description}</td>
                      <td className="py-3 px-4 font-data-mono text-outline font-semibold">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
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
          <span className="font-body-sm text-on-surface-variant">Showing {filteredLogs.length} entries</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1.5 border border-outline-variant/50 rounded bg-white text-on-surface-variant hover:bg-surface-container-low font-body-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-2.5 py-1.5 border border-primary bg-primary text-on-primary rounded font-body-sm">1</button>
            <button className="px-2.5 py-1.5 border border-outline-variant/50 rounded bg-white text-on-surface hover:bg-surface-container-low font-body-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
