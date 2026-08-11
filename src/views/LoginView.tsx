import React, { useState } from 'react';
import { loginAdmin } from '../services/adminService';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Suggestions from local database check
  const suggestEmail = 'admin.val_1785967730381@mindease.com';
  const suggestPassword = 'adminPassword123';

  const handlePrefill = () => {
    setEmail(suggestEmail);
    setPassword(suggestPassword);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginAdmin(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to authenticate. Please check your credentials or database status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-background px-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-on-primary-fixed fill text-2xl">psychology</span>
        </div>
        <div className="text-left">
          <h1 className="font-headline-lg text-2xl font-bold text-primary">ClinicalAdmin</h1>
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">MindEase Portal</p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-md text-left">
        <h2 className="font-headline-sm text-lg font-bold text-primary mb-1">Administrative Access</h2>
        <p className="font-body-sm text-xs text-on-surface-variant mb-6">
          Authorized personnel only. Please sign in to audit credentials.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded bg-error-container/30 border border-error/20 text-error text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mindease.com"
              required
              className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-primary text-on-primary rounded font-label-caps text-xs font-bold uppercase hover:bg-primary/95 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Local Test Database Suggestions Box */}
      <div className="w-full max-w-md mt-6 p-4 rounded-xl border border-dashed border-outline/30 bg-surface-container-low/40 text-left">
        <h3 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-sm">construction</span>
          Local Developer Helper
        </h3>
        <p className="text-[11px] text-on-surface-variant leading-normal mb-3">
          We scanned your database and found a local administrator user. Click below to prefill these testing credentials.
        </p>
        <div className="flex justify-between items-center bg-surface-container-lowest p-3 border border-outline-variant/60 rounded-lg">
          <div className="text-[10px] space-y-0.5">
            <div>
              <span className="text-outline font-semibold">User: </span>
              <span className="font-data-mono font-bold text-primary">{suggestEmail}</span>
            </div>
            <div>
              <span className="text-outline font-semibold">Pass: </span>
              <span className="font-data-mono font-bold text-primary">{suggestPassword}</span>
            </div>
          </div>
          <button
            onClick={handlePrefill}
            className="px-2.5 py-1.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded text-[10px] font-bold uppercase hover:bg-secondary-fixed-dim transition-colors"
          >
            Prefill
          </button>
        </div>
      </div>
    </div>
  );
};
