import React, { useState } from 'react';

export const ReportsView: React.FC = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Multiple failed login attempts', details: 'Account: admin_smith@clinic.com', meta: 'IP: 192.168.1.45', time: '10 mins ago', type: 'critical' },
    { id: 2, title: 'Data export anomaly detected', details: 'System: Patient Records DB', meta: 'Vol: 10GB / 5min', time: '1 hour ago', type: 'critical' },
  ]);

  const [queue] = useState([
    { channel: 'Support-A12', reason: 'Automated: Toxicity > 0.8', status: 'Active' },
    { channel: 'Gen-Chat-3', reason: 'User Reported', status: 'Active' },
    { channel: 'Counselor-D9', reason: 'Inappropriate content flag', status: 'Pending' },
    { channel: 'Patient-X1', reason: 'Automated: PII leak warning', status: 'Active' },
  ]);

  const handleDismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleReviewQueue = (channel: string) => {
    alert(`Opening moderation session for channel ${channel}...`);
  };

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Reports & Moderation Dashboard</h2>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Monitor platform safety, review flagged interactions, and manage critical alerts.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Open Reports Summary */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="font-label-caps text-xs text-on-surface-variant uppercase mb-4 font-bold tracking-wider">Open Reports Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-4 rounded border border-outline-variant/50 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-outline">gavel</span>
                <span className="bg-error/10 text-error px-2 py-0.5 rounded font-label-caps text-[9px] uppercase font-bold">High Priority</span>
              </div>
              <div>
                <div className="font-headline-md text-xl font-bold text-primary">24</div>
                <div className="font-body-sm text-xs text-on-surface-variant">Inappropriate Conduct</div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded border border-outline-variant/50 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-outline">forum</span>
                <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded font-label-caps text-[9px] uppercase font-bold">Moderate</span>
              </div>
              <div>
                <div className="font-headline-md text-xl font-bold text-primary">12</div>
                <div className="font-body-sm text-xs text-on-surface-variant">Harassment</div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded border border-outline-variant/50 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-outline">badge</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-label-caps text-[9px] uppercase font-bold">Review Required</span>
              </div>
              <div>
                <div className="font-headline-md text-xl font-bold text-primary">7</div>
                <div className="font-body-sm text-xs text-on-surface-variant">Identity Theft / Fraud</div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Security Alerts */}
        <div className="col-span-1 md:col-span-4 bg-error/5 border border-error/20 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-error">
              <span className="material-symbols-outlined font-bold">warning</span>
              <h3 className="font-label-caps text-xs uppercase font-bold tracking-wider">Critical Security Alerts</h3>
            </div>
            
            <ul className="space-y-3">
              {alerts.length === 0 ? (
                <li className="text-xs text-secondary font-semibold bg-white p-3 rounded border border-secondary/30">
                  No active security threats. System secure.
                </li>
              ) : (
                alerts.map(alert => (
                  <li key={alert.id} className="bg-surface-container-lowest border border-error/30 p-3 rounded text-xs relative group/item">
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="absolute top-2 right-2 text-outline hover:text-error opacity-0 group-hover/item:opacity-100 transition-opacity"
                      title="Dismiss Alert"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <div className="font-bold text-on-surface mb-0.5">{alert.title}</div>
                    <div className="text-on-surface-variant text-[11px]">{alert.details}</div>
                    <div className="text-error text-[10px] mt-1 font-data-mono">{alert.meta}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          {alerts.length > 0 && (
            <button className="mt-4 w-full bg-error text-on-error py-2 rounded font-label-caps text-xs font-bold uppercase hover:bg-error/90 transition-colors">
              Review All Alerts
            </button>
          )}
        </div>

        {/* Live Moderation Queue */}
        <div className="col-span-1 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low/50 flex justify-between items-center">
            <h3 className="font-label-caps text-xs text-on-surface-variant uppercase font-bold tracking-wider">Live Moderation Queue</h3>
            <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-data-mono text-[10px] font-bold">Active</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="p-3 font-label-caps font-semibold text-on-surface-variant uppercase">Channel / Room</th>
                  <th className="p-3 font-label-caps font-semibold text-on-surface-variant uppercase">Flag Reason</th>
                  <th className="p-3 font-label-caps font-semibold text-on-surface-variant uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {queue.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/30 transition-colors">
                    <td className="p-3 text-primary font-bold">{item.channel}</td>
                    <td className="p-3 text-on-surface-variant font-medium">{item.reason}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleReviewQueue(item.channel)}
                        className="text-primary hover:text-secondary font-label-caps font-bold hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Health Index */}
        <div className="col-span-1 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-label-caps text-xs text-on-surface-variant uppercase mb-4 font-bold tracking-wider">Platform Safety Index</h3>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-headline-lg text-2xl font-bold text-primary">94.2%</span>
                <span className="text-[10px] text-outline block mt-1">Acceptable compliance range &gt; 90.0%</span>
              </div>
              <span className="text-secondary font-body-sm text-xs font-bold flex items-center gap-1 bg-secondary-fixed-dim/20 px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-xs">trending_up</span> Stable
              </span>
            </div>
            
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '94.2%' }}></div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 grid grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <span className="text-outline block">Critical Issues Rate</span>
              <span className="text-primary block text-sm mt-0.5 font-bold font-data-mono">0.02%</span>
            </div>
            <div>
              <span className="text-outline block">Average Review Time</span>
              <span className="text-primary block text-sm mt-0.5 font-bold font-data-mono">12 mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
