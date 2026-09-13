import React, { useState } from 'react';
import type { AdminUserRecord, RoleRecord } from '../services/adminService';

interface UserManagementViewProps {
  users: AdminUserRecord[];
  roles: RoleRecord[];
  onUpdateRoles: (userId: string, newRoles: string[]) => Promise<void>;
  onUpdateStatus: (userId: string, newStatus: string) => Promise<void>;
  onOpenDossier?: (requestId: string) => void;
  onRefresh: () => void;
}

type TabType = 'all' | 'patients' | 'practitioners' | 'staff';

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  roles,
  onUpdateRoles,
  onUpdateStatus,
  onOpenDossier,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Role Management Modal State
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleOpenRoleModal = (user: AdminUserRecord) => {
    setEditingUser(user);
    setSelectedRoles(user.userRoles.map((ur) => ur.role.name));
  };

  const handleCloseRoleModal = () => {
    setEditingUser(null);
    setSelectedRoles([]);
  };

  const handleToggleRoleInModal = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    if (selectedRoles.length === 0) {
      alert('A user must have at least one role.');
      return;
    }

    setIsSavingRoles(true);
    try {
      await onUpdateRoles(editingUser.id, selectedRoles);
      handleCloseRoleModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update roles.');
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleToggleSuspension = async (user: AdminUserRecord) => {
    const isSuspended =
      user.status !== 'ACTIVE';

    const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';

    if (
      !confirm(
        `Are you sure you want to ${isSuspended ? 'reactivate' : 'suspend'} account: ${user.name}?`
      )
    ) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await onUpdateStatus(user.id, newStatus);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper filters
  const filterByTab = (user: AdminUserRecord): boolean => {
    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    if (activeTab === 'patients') {
      return userRoleNames.includes('USER') && !user.psychologistProfile;
    }
    if (activeTab === 'practitioners') {
      return (
        !!user.psychologistProfile ||
        userRoleNames.some((r) => r.startsWith('PSYCHOLOGIST'))
      );
    }
    if (activeTab === 'staff') {
      return userRoleNames.some((r) =>
        ['ADMIN', 'SUPERADMIN', 'REVISOR', 'MODERATOR', 'SUPPORT'].includes(r)
      );
    }
    return true;
  };

  const filteredUsers = users
    .filter(filterByTab)
    .filter((user) => {
      if (selectedRoleFilter === 'all') return true;
      return user.userRoles.some((ur) => ur.role.name === selectedRoleFilter);
    })
    .filter((user) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone && user.phone.includes(q)) ||
        user.id.toLowerCase().includes(q)
      );
    });

  // Calculate real metrics
  const totalPatients = users.filter(
    (u) =>
      u.userRoles.some((ur) => ur.role.name === 'USER') && !u.psychologistProfile
  ).length;

  const totalPractitioners = users.filter(
    (u) =>
      !!u.psychologistProfile ||
      u.userRoles.some((ur) => ur.role.name.startsWith('PSYCHOLOGIST'))
  ).length;

  const totalStaff = users.filter((u) =>
    u.userRoles.some((ur) =>
      ['ADMIN', 'SUPERADMIN', 'REVISOR', 'MODERATOR', 'SUPPORT'].includes(
        ur.role.name
      )
    )
  ).length;

  const totalSuspended = users.filter(
    (u) =>
      u.status === 'SUSPENDED'
  ).length;

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REVISOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MODERATOR':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SUPPORT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PSYCHOLOGIST_VERIFIED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PSYCHOLOGIST_APPLICANT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (user: AdminUserRecord) => {
    const isSuspended =
      user.status === 'SUSPENDED';

    if (isSuspended) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#fecaca] font-semibold font-label-caps text-[10px] uppercase">
          Suspended
        </span>
      );
    }

    if (user.status !== 'ACTIVE') {
      return <span className="text-xs font-semibold">{user.status}</span>;
    }

    if (user.psychologistProfile) {
      const st = user.psychologistProfile.status;
      if (st === 'VERIFICADO') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary-container text-[#166534] border border-secondary/20 font-semibold font-label-caps text-[10px] uppercase">
            Verified
          </span>
        );
      }
      if (st === 'PENDIENTE_REVISION' || st === 'EN_REVISION') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FFEDD5] text-[#9A3412] border border-[#fed7aa] font-semibold font-label-caps text-[10px] uppercase">
            Under Review
          </span>
        );
      }
      if (st === 'REQUIERE_CAMBIOS') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-semibold font-label-caps text-[10px] uppercase">
            Needs Changes
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant border border-outline-variant font-semibold font-label-caps text-[10px] uppercase">
          {st}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary-container text-[#166534] border border-secondary/20 font-semibold font-label-caps text-[10px] uppercase">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
            User & Role Management
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Oversee database accounts, manage RBAC permissions, audit legal consents, and control account statuses.
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="inline-flex bg-surface-container-high rounded-lg p-1 shrink-0 shadow-inner flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className={`px-4 py-1.5 rounded font-label-caps text-xs font-bold transition-all text-center uppercase ${
              activeTab === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('patients');
              setSearchQuery('');
            }}
            className={`px-4 py-1.5 rounded font-label-caps text-xs font-bold transition-all text-center uppercase ${
              activeTab === 'patients'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Patients ({totalPatients})
          </button>
          <button
            onClick={() => {
              setActiveTab('practitioners');
              setSearchQuery('');
            }}
            className={`px-4 py-1.5 rounded font-label-caps text-xs font-bold transition-all text-center uppercase ${
              activeTab === 'practitioners'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Practitioners ({totalPractitioners})
          </button>
          <button
            onClick={() => {
              setActiveTab('staff');
              setSearchQuery('');
            }}
            className={`px-4 py-1.5 rounded font-label-caps text-xs font-bold transition-all text-center uppercase ${
              activeTab === 'staff'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Staff & Admins ({totalStaff})
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Total Database Users
          </span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-primary">
              {users.length}
            </span>
            <span className="font-body-sm text-xs text-secondary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">groups</span> Global
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Practitioners Registered
          </span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-secondary">
              {totalPractitioners}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">psychology</span> Clinical
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Platform Staff & Revisors
          </span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-purple-700">
              {totalStaff}
            </span>
            <span className="font-body-sm text-xs text-purple-600 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">shield_person</span> RBAC
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-error/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Suspended Accounts
          </span>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-lg md:text-xl font-bold text-error">
              {totalSuspended}
            </span>
            <span className="font-body-sm text-xs text-error flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">block</span> Restricted
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter Dropdown */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest font-label-caps text-xs text-on-surface outline-none cursor-pointer font-semibold"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest font-label-caps text-xs text-on-surface flex items-center gap-1 hover:bg-surface-variant transition-colors font-semibold"
              title="Refresh from Database"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          {/* Search bar inside toolbar */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
              search
            </span>
            <input
              className="pl-8 pr-3 py-1.5 border border-outline-variant rounded-lg font-body-sm text-xs text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-secondary focus:border-secondary w-full shadow-sm outline-none"
              placeholder="Search by name, email or ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-outline-variant/40">
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase w-[260px]">
                  User / Contact
                </th>
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Assigned Roles
                </th>
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Status
                </th>
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Compliance / Consent
                </th>
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase">
                  Joined Date
                </th>
                <th className="py-3 px-6 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const initials = user.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  const joinedDate = new Date(user.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  );

                  const isSuspended =
                    user.status !== 'ACTIVE';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-surface-bright transition-colors group ${
                        isSuspended ? 'bg-red-50/25' : ''
                      }`}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 select-none">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-body-md text-sm font-semibold text-primary truncate">
                              {user.name}
                            </div>
                            <div className="font-data-mono text-[10px] text-on-surface-variant truncate">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-outline">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Roles Badges */}
                      <td className="py-3 px-6">
                        <div className="flex flex-wrap gap-1">
                          {user.userRoles.map((ur) => (
                            <span
                              key={ur.roleId}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold font-label-caps uppercase ${getRoleBadgeClass(
                                ur.role.name
                              )}`}
                            >
                              {ur.role.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-6">{getStatusBadge(user)}</td>

                      {/* Compliance / Consent */}
                      <td className="py-3 px-6">
                        {user.consents && user.consents.length > 0 ? (
                          <div className="space-y-0.5">
                            {user.consents.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold"
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  verified
                                </span>
                                {c.consentType}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-outline italic">
                            No consents logged
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-6 font-data-mono text-on-surface-variant">
                        {joinedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Roles Button */}
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="px-2 py-1 rounded bg-surface border border-outline-variant/60 hover:bg-primary hover:text-white transition-colors text-[10px] font-bold uppercase font-label-caps flex items-center gap-1 shadow-2xs"
                            title="Manage System Roles"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              admin_panel_settings
                            </span>
                            Roles
                          </button>

                          {/* Open Dossier if practitioner */}
                          {user.psychologistProfile && onOpenDossier && (
                            <button
                              onClick={() => onOpenDossier(user.psychologistProfile!.id)}
                              className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface transition-colors"
                              title="View Psychologist Dossier"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                          )}

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleSuspension(user)}
                            disabled={actionLoadingId === user.id}
                            className={`p-1.5 rounded transition-colors ${
                              isSuspended
                                ? 'text-secondary hover:bg-secondary/10'
                                : 'text-outline hover:text-error hover:bg-error/10'
                            }`}
                            title={
                              isSuspended ? 'Reactivate Account' : 'Suspend Account'
                            }
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isSuspended ? 'lock_open' : 'block'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 text-left">
            <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-primary">
                  Manage System Roles
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  User: <span className="font-bold text-primary">{editingUser.name}</span> ({editingUser.email})
                </p>
              </div>
              <button
                onClick={handleCloseRoleModal}
                className="p-1 text-outline hover:text-primary rounded-full hover:bg-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Select the system permissions and RBAC roles to grant to this user. Changes take effect immediately and are recorded in the security audit log.
            </p>

            {/* Roles Checkbox List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {roles.map((role) => {
                const isChecked = selectedRoles.includes(role.name);
                return (
                  <label
                    key={role.id}
                    onClick={() => handleToggleRoleInModal(role.name)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-secondary bg-secondary-container/10'
                        : 'border-outline-variant hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded border-outline text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span className="font-label-caps text-xs font-bold text-primary uppercase">
                        {role.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-label-caps uppercase ${getRoleBadgeClass(
                        role.name
                      )}`}
                    >
                      {role.name}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={handleCloseRoleModal}
                className="px-4 py-2 border border-outline-variant rounded-lg font-semibold text-xs text-on-surface hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={isSavingRoles}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-xs hover:bg-primary/95 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingRoles && (
                  <span className="material-symbols-outlined text-xs animate-spin">
                    sync
                  </span>
                )}
                {isSavingRoles ? 'Saving Roles...' : 'Save Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
