import React, { useEffect, useState } from 'react';
import {
  getDashboardStats,
  downloadAuditLogsCsv,
} from '../services/adminService';
import type { DashboardStats } from '../services/adminService';

interface DashboardViewProps {
  onViewChange: (view: string) => void;
  pendingRequestsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewChange,
  pendingRequestsCount,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [pendingRequestsCount]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadAuditLogsCsv();
    } catch (err) {
      console.error(err);
      alert('Failed to generate compliance report.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalUsers = stats?.totalUsers || 0;
  const verifiedPractitioners = stats?.verifiedPsychologists || 0;
  const pendingCount = stats ? stats.pendingRequests : pendingRequestsCount;
  const approvalRate = stats?.approvalRate ?? 100;
  const topSpecialties = stats?.topSpecialties || [];
  const recentLogs = stats?.recentAuditLogs || [];

  const maxSpecialtyCount = Math.max(...topSpecialties.map((s) => s.count), 1);

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
            Clinical Overview
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Real-time operational KPIs and clinical compliance telemetry.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            className="p-2 border border-outline-variant/60 rounded-lg hover:bg-surface-variant text-primary transition-colors"
            title="Refresh Metrics"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-surface-container-lowest text-primary border border-outline-variant px-4 py-2 rounded-md font-label-caps text-label-caps uppercase hover:bg-surface-container transition-colors flex items-center gap-2 text-xs font-semibold shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
          <button
            onClick={() => onViewChange('requests')}
            className="bg-primary text-on-primary px-4 py-2 rounded-md font-label-caps text-label-caps uppercase hover:bg-primary/90 transition-colors flex items-center gap-2 text-xs font-semibold shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">clinical_notes</span>
            Review Requests
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests KPI */}
        <button
          onClick={() => onViewChange('requests')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider font-semibold">
              Pending Requests
            </h3>
            <span className={`material-symbols-outlined text-lg fill ${pendingCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {pendingCount > 0 ? 'hourglass_top' : 'check_circle'}
            </span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {pendingCount}
            </span>
            <span className={`font-body-sm text-[11px] flex items-center gap-1 font-semibold ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingCount > 0 ? 'Action required' : 'All clear'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-outline-variant/20">
            <div
              className={`h-full ${pendingCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(pendingCount * 25, 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Verified Practitioners KPI */}
        <button
          onClick={() => onViewChange('users')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider font-semibold">
              Verified Practitioners
            </h3>
            <span className="material-symbols-outlined text-secondary text-lg fill">
              verified_user
            </span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {verifiedPractitioners}
            </span>
            <span className="font-data-mono text-[11px] text-secondary flex items-center font-semibold">
              <span className="material-symbols-outlined text-[12px] mr-0.5">medical_services</span>
              Active
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary/20">
            <div className="h-full bg-secondary w-full"></div>
          </div>
        </button>

        {/* Active Patients KPI */}
        <button
          onClick={() => onViewChange('users')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider font-semibold">
              System Accounts
            </h3>
            <span className="material-symbols-outlined text-primary text-lg">
              group
            </span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {totalUsers}
            </span>
            <span className="font-body-sm text-[11px] text-primary font-semibold">
              {stats?.activeUsers || totalUsers} active
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </button>

        {/* Clinical Approval Rate KPI */}
        <button
          onClick={() => onViewChange('requests')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider font-semibold">
              Clinical Approval Rate
            </h3>
            <span className="material-symbols-outlined text-emerald-600 text-lg">
              fact_check
            </span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {approvalRate}%
            </span>
            <span className="font-body-sm text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Audit Standard
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-200">
            <div className="h-full bg-emerald-600" style={{ width: `${approvalRate}%` }}></div>
          </div>
        </button>
      </div>

      {/* Content Area: Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section: Top Demanded Specialties & Verification Status Breakdown */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
                  Clinical Specialty Distribution
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Top psychology areas registered across accredited practitioners in PostgreSQL.
                </p>
              </div>
              <button
                onClick={() => onViewChange('catalogs')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                Manage Specialties
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            {/* Specialties Bar Distribution */}
            <div className="space-y-3.5 mt-4">
              {topSpecialties.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-xs italic">
                  No practitioner specialties recorded yet.
                </div>
              ) : (
                topSpecialties.map((spec) => {
                  const pct = Math.round((spec.count / maxSpecialtyCount) * 100);
                  return (
                    <div key={spec.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-primary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            psychology
                          </span>
                          {spec.name}
                        </span>
                        <span className="font-data-mono text-on-surface-variant font-bold">
                          {spec.count} {spec.count === 1 ? 'Specialist' : 'Specialists'}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clinical Status Breakdown Pills */}
          <div className="pt-4 border-t border-outline-variant/40">
            <h4 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-3">
              Dossier Status Taxonomy
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats?.statusDistribution || {}).map(([st, count]) => {
                let badgeClass = 'bg-surface-variant text-on-surface-variant border-outline-variant';
                if (st === 'VERIFICADO') badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                else if (st === 'PENDIENTE_REVISION') badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                else if (st === 'REQUIERE_CAMBIOS') badgeClass = 'bg-orange-50 text-orange-800 border-orange-200';
                else if (st === 'RECHAZADO' || st === 'SUSPENDIDO') badgeClass = 'bg-red-50 text-red-800 border-red-200';

                return (
                  <span
                    key={st}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 font-label-caps ${badgeClass}`}
                  >
                    <span className="font-bold">{st}:</span>
                    <span className="font-data-mono">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Action Center & Live Audit Feed */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50 rounded-t-xl">
            <h3 className="font-headline-sm text-sm font-semibold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                security
              </span>
              Security & Audit Feed
            </h3>
            <button
              onClick={() => onViewChange('audit')}
              className="text-xs text-secondary hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-y-auto divide-y divide-outline-variant/20">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-xs italic">
                No recent security actions logged.
              </div>
            ) : (
              recentLogs.slice(0, 5).map((log) => {
                const dateStr = new Date(log.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric',
                });

                let icon = 'shield';
                let iconColor = 'text-primary';
                if (log.action.includes('APPROVE')) {
                  icon = 'check_circle';
                  iconColor = 'text-emerald-600';
                } else if (log.action.includes('REJECT') || log.action.includes('SUSPEND')) {
                  icon = 'cancel';
                  iconColor = 'text-error';
                } else if (log.action.includes('CHANGES')) {
                  icon = 'edit_note';
                  iconColor = 'text-orange-500';
                } else if (log.action.includes('SPECIALTY')) {
                  icon = 'psychology';
                  iconColor = 'text-purple-600';
                }

                return (
                  <div key={log.id} className="pt-2 first:pt-0 flex gap-2.5 items-start text-left">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${iconColor}`}>
                      {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-label-caps text-[10px] font-bold text-primary truncate">
                          {log.action}
                        </span>
                        <span className="font-data-mono text-[9px] text-on-surface-variant shrink-0 ml-1">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        By {log.user?.name || 'Admin'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
