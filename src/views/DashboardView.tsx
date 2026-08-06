import React from 'react';

interface DashboardViewProps {
  onViewChange: (view: string) => void;
  pendingRequestsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewChange,
  pendingRequestsCount,
}) => {
  return (
    <div className="space-y-stack-lg animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Overview</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            System status and key metrics for today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest text-primary border border-outline-variant px-4 py-2 rounded-md font-label-caps text-label-caps uppercase hover:bg-surface-container transition-colors flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-label-caps text-label-caps uppercase hover:bg-primary/90 transition-colors flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-sm">add</span>
            New Task
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests KPI */}
        <button
          onClick={() => onViewChange('requests')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider">Pending Requests</h3>
            <span className="material-symbols-outlined text-error text-lg fill">error</span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">{pendingRequestsCount}</span>
            <span className="font-body-sm text-[11px] text-error flex items-center gap-1 font-semibold">
              Needs review
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-error/20">
            <div className="h-full bg-error" style={{ width: `${Math.min(pendingRequestsCount * 10, 100)}%` }}></div>
          </div>
        </button>

        {/* Verified Psychologists KPI */}
        <button
          onClick={() => onViewChange('users')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider">Verified Practitioners</h3>
            <span className="material-symbols-outlined text-secondary text-lg fill">verified_user</span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">1,248</span>
            <span className="font-data-mono text-[11px] text-secondary flex items-center font-semibold">
              <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_upward</span>+12%
            </span>
          </div>
        </button>

        {/* Active Patients KPI */}
        <button
          onClick={() => onViewChange('users')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider">Active Users</h3>
            <span className="material-symbols-outlined text-primary text-lg">group</span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">18.2K</span>
          </div>
          <div className="mt-2 h-4 w-full flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-1/6 bg-primary-container h-1/3 rounded-t-sm"></div>
            <div className="w-1/6 bg-primary-container h-1/2 rounded-t-sm"></div>
            <div className="w-1/6 bg-primary-container h-3/4 rounded-t-sm"></div>
            <div className="w-1/6 bg-primary-container h-2/3 rounded-t-sm"></div>
            <div className="w-1/6 bg-primary-container h-full rounded-t-sm"></div>
            <div className="w-1/6 bg-secondary h-5/6 rounded-t-sm"></div>
          </div>
        </button>

        {/* Security Alerts KPI */}
        <button
          onClick={() => onViewChange('moderation')}
          className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-secondary transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs tracking-wider">Security Alerts</h3>
            <span className="material-symbols-outlined text-error text-lg">warning</span>
          </div>
          <div className="flex items-end justify-between w-full">
            <span className="font-headline-md text-headline-md text-primary font-bold">3</span>
            <span className="font-body-sm text-[11px] text-on-surface-variant ml-2 font-semibold bg-error-container/50 px-2 py-0.5 rounded text-error">
              Requires Action
            </span>
          </div>
        </button>
      </div>

      {/* Content Area: Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart / Activity */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Daily Activity Overview</h3>
            <select className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-body-sm font-body-sm text-on-surface-variant outline-none focus:border-secondary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {/* Simulated Chart Area using basic Tailwind columns */}
          <div className="flex-1 min-h-[280px] w-full bg-surface relative rounded-lg border border-outline-variant/50 p-4 flex flex-col justify-end">
            {/* Chart Y Axis labels */}
            <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[10px] text-on-surface-variant font-data-mono h-full select-none">
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 pl-10 pr-4 py-4 flex flex-col justify-between pointer-events-none select-none">
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="w-full h-px bg-outline-variant/80"></div>
            </div>
            
            {/* Bars Container */}
            <div className="relative z-10 flex justify-between items-end h-full pl-10 pr-4 pb-0 pt-4 gap-2">
              {[
                { label: 'Mon', val: 225, pct: '45%', fill: 'bg-primary-container hover:bg-primary' },
                { label: 'Tue', val: 300, pct: '60%', fill: 'bg-primary-container hover:bg-primary' },
                { label: 'Wed', val: 175, pct: '35%', fill: 'bg-primary-container hover:bg-primary' },
                { label: 'Thu', val: 400, pct: '80%', fill: 'bg-secondary hover:bg-secondary-container' },
                { label: 'Fri', val: 275, pct: '55%', fill: 'bg-primary-container hover:bg-primary' },
                { label: 'Sat', val: 100, pct: '20%', fill: 'bg-primary-container/40 hover:bg-primary-container' },
                { label: 'Sun', val: 75, pct: '15%', fill: 'bg-primary-container/40 hover:bg-primary-container' },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full">
                  <div
                    style={{ height: bar.pct }}
                    className={`w-full max-w-[32px] rounded-t-sm transition-all duration-300 relative cursor-pointer ${bar.fill}`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none shadow-md z-20">
                      {bar.val} Consults
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-2 font-data-mono">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-outline-variant/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-secondary"></div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Consultations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary-container"></div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Registrations</span>
            </div>
          </div>
        </div>

        {/* Priority Action Center */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50 rounded-t-xl">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Priority Action Center</h3>
            <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold font-label-caps uppercase tracking-wider">
              3 Alerts
            </span>
          </div>
          
          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {/* Alert Item 1 */}
            <div
              onClick={() => onViewChange('moderation')}
              className="p-3 hover:bg-surface-container transition-colors rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/50 flex gap-3 text-left"
            >
              <div className="mt-0.5 shrink-0">
                <span className="material-symbols-outlined text-error text-lg">gpp_bad</span>
              </div>
              <div>
                <h4 className="font-body-sm text-sm font-semibold text-primary">Unusual Login Pattern</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Multiple failed attempts on Admin account ID #4492.
                </p>
                <span className="font-data-mono text-[9px] text-on-surface-variant block mt-1">10 mins ago</span>
              </div>
            </div>

            {/* Alert Item 2 */}
            <div
              onClick={() => onViewChange('requests')}
              className="p-3 hover:bg-surface-container transition-colors rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/50 flex gap-3 text-left"
            >
              <div className="mt-0.5 shrink-0">
                <span className="material-symbols-outlined text-outline text-lg">description</span>
              </div>
              <div>
                <h4 className="font-body-sm text-sm font-semibold text-primary">Pending Credential Reviews</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {pendingRequestsCount} psychologist profiles are waiting for document review.
                </p>
                <span className="font-data-mono text-[9px] text-on-surface-variant block mt-1">3 hours ago</span>
              </div>
            </div>

            {/* Alert Item 3 */}
            <div
              onClick={() => onViewChange('moderation')}
              className="p-3 hover:bg-surface-container transition-colors rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/50 flex gap-3 text-left"
            >
              <div className="mt-0.5 shrink-0">
                <span className="material-symbols-outlined text-outline text-lg">warning</span>
              </div>
              <div>
                <h4 className="font-body-sm text-sm font-semibold text-primary">High-Risk Conversation Flagged</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Support channel Support-A12 flagged for high toxicity score.
                </p>
                <span className="font-data-mono text-[9px] text-on-surface-variant block mt-1">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
