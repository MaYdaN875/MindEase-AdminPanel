import React, { useState, useEffect } from 'react';
import {
  getAdminSpecialties,
  createAdminSpecialty,
  updateAdminSpecialty,
  deleteAdminSpecialty,
} from '../services/adminService';
import type { SpecialtyRecord } from '../services/adminService';

interface CatalogItem {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Suspended';
  psychologistsCount?: number;
}

export const CatalogsView: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<
    'specialties' | 'motives' | 'documents' | 'rejections' | 'legal'
  >('specialties');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [specialtiesDb, setSpecialtiesDb] = useState<SpecialtyRecord[]>([]);

  // Mock catalog data states for non-specialties categories
  const [motives, setMotives] = useState<CatalogItem[]>([
    { id: 'MTV-001', name: 'Anxiety and Panic Attacks', code: 'ANX-PANIC', status: 'Active' },
    { id: 'MTV-002', name: 'Depressive Episodes', code: 'DEP-GEN', status: 'Active' },
    { id: 'MTV-003', name: 'Relationship & Family Conflicts', code: 'REL-CONF', status: 'Active' },
    { id: 'MTV-004', name: 'Burnout & Workplace Stress', code: 'WORK-BURN', status: 'Active' },
  ]);

  const [documents, setDocuments] = useState<CatalogItem[]>([
    { id: 'DOC-001', name: 'National Identity Document (INE)', code: 'ID-GOV', status: 'Active' },
    { id: 'DOC-002', name: 'Professional Licensure (Cédula)', code: 'LIC-PROF', status: 'Active' },
    { id: 'DOC-003', name: 'Medical / Clinical Degree', code: 'DEG-CLIN', status: 'Active' },
    { id: 'DOC-004', name: 'Criminal Record Certification', code: 'COMP-CRIM', status: 'Active' },
  ]);

  const [rejections, setRejections] = useState<CatalogItem[]>([
    { id: 'REJ-001', name: 'Unverifiable Professional License', code: 'ERR-LICENSE', status: 'Active' },
    { id: 'REJ-002', name: 'Incomplete Required Documentation', code: 'ERR-DOCS', status: 'Active' },
    { id: 'REJ-003', name: 'Falsified Identity Credentials', code: 'SUSP-FRAUD', status: 'Active' },
  ]);

  const [legal, setLegal] = useState<CatalogItem[]>([
    { id: 'LGL-001', name: 'Terms of Clinical Service v2.1', code: 'TOS-CLIN', status: 'Active' },
    { id: 'LGL-002', name: 'Privacy Policy & GDPR Consent', code: 'PRIVACY-GDPR', status: 'Active' },
    { id: 'LGL-003', name: 'Patient Data Protection Act Agreement', code: 'HIPAA-DATA', status: 'Active' },
  ]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true);
    try {
      const data = await getAdminSpecialties();
      setSpecialtiesDb(data);
    } catch (err) {
      console.error('Failed to load specialties from DB:', err);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const mapSpecialtyToCatalogItem = (sp: SpecialtyRecord, index: number): CatalogItem => {
    const code = sp.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .substring(0, 12);

    return {
      id: sp.id.substring(0, 8).toUpperCase() || `SPC-${String(index + 1).padStart(3, '0')}`,
      name: sp.name,
      code,
      status: 'Active',
      psychologistsCount: sp._count?.psychologists || 0,
    };
  };

  const getActiveList = (): CatalogItem[] => {
    switch (activeCatalog) {
      case 'specialties':
        return specialtiesDb.map(mapSpecialtyToCatalogItem);
      case 'motives':
        return motives;
      case 'documents':
        return documents;
      case 'rejections':
        return rejections;
      case 'legal':
        return legal;
    }
  };

  const getActiveTitle = () => {
    switch (activeCatalog) {
      case 'specialties':
        return {
          title: 'Clinical Specialties (Live Database)',
          desc: 'Manage accredited psychology specializations linked to practitioners in PostgreSQL.',
        };
      case 'motives':
        return {
          title: 'Consultation Motives',
          desc: 'Define primary reasons patients seek clinical care.',
        };
      case 'documents':
        return {
          title: 'Required Documents',
          desc: 'Define compliance files practitioners must upload.',
        };
      case 'rejections':
        return {
          title: 'Rejection Reasons',
          desc: 'Standard rejection explanations for audits.',
        };
      case 'legal':
        return {
          title: 'Legal & Policy Texts',
          desc: 'Manage system legal disclosures and agreements.',
        };
    }
  };

  const handleToggleStatus = (id: string) => {
    const updateStatus = (list: CatalogItem[]): CatalogItem[] =>
      list.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Active' ? 'Suspended' : 'Active',
            }
          : item
      );

    switch (activeCatalog) {
      case 'motives':
        setMotives((prev) => updateStatus(prev));
        break;
      case 'documents':
        setDocuments((prev) => updateStatus(prev));
        break;
      case 'rejections':
        setRejections((prev) => updateStatus(prev));
        break;
      case 'legal':
        setLegal((prev) => updateStatus(prev));
        break;
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (activeCatalog === 'specialties') {
      setIsSubmitting(true);
      try {
        await createAdminSpecialty(newName.trim());
        await fetchSpecialties();
        setNewName('');
        setNewCode('');
        setShowAddModal(false);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to create specialty in database.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (newName.trim() && newCode.trim()) {
      const activeList = getActiveList();
      const prefix = activeCatalog.substring(0, 3).toUpperCase();
      const nextNum = String(activeList.length + 1).padStart(3, '0');

      const newItem: CatalogItem = {
        id: `${prefix}-${nextNum}`,
        name: newName,
        code: newCode.toUpperCase().replace(/\s+/g, '-'),
        status: 'Active',
      };

      switch (activeCatalog) {
        case 'motives':
          setMotives((prev) => [...prev, newItem]);
          break;
        case 'documents':
          setDocuments((prev) => [...prev, newItem]);
          break;
        case 'rejections':
          setRejections((prev) => [...prev, newItem]);
          break;
        case 'legal':
          setLegal((prev) => [...prev, newItem]);
          break;
      }

      setNewName('');
      setNewCode('');
      setShowAddModal(false);
    }
  };

  const handleOpenEdit = (item: CatalogItem, origIndex: number) => {
    if (activeCatalog === 'specialties') {
      const dbRecord = specialtiesDb[origIndex];
      if (dbRecord) {
        setEditingItem({ id: dbRecord.id, name: dbRecord.name });
        setEditName(dbRecord.name);
      }
    } else {
      setEditingItem({ id: item.id, name: item.name });
      setEditName(item.name);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    if (activeCatalog === 'specialties') {
      setIsEditing(true);
      try {
        await updateAdminSpecialty(editingItem.id, editName.trim());
        await fetchSpecialties();
        setEditingItem(null);
        setEditName('');
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to update specialty.');
      } finally {
        setIsEditing(false);
      }
      return;
    }

    // Non-specialty mock edits
    const updateName = (list: CatalogItem[]): CatalogItem[] =>
      list.map((item) => (item.id === editingItem.id ? { ...item, name: editName.trim() } : item));

    switch (activeCatalog) {
      case 'motives':
        setMotives((prev) => updateName(prev));
        break;
      case 'documents':
        setDocuments((prev) => updateName(prev));
        break;
      case 'rejections':
        setRejections((prev) => updateName(prev));
        break;
      case 'legal':
        setLegal((prev) => updateName(prev));
        break;
    }

    setEditingItem(null);
    setEditName('');
  };

  const handleDeleteSpecialty = async (dbIndex: number) => {
    const dbRecord = specialtiesDb[dbIndex];
    if (!dbRecord) return;

    if (
      !confirm(
        `Are you sure you want to delete the clinical specialty "${dbRecord.name}" from the database?`
      )
    ) {
      return;
    }

    try {
      await deleteAdminSpecialty(dbRecord.id);
      await fetchSpecialties();
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          'Failed to delete specialty. Ensure no practitioners are currently assigned.'
      );
    }
  };

  const rawList = getActiveList();
  const filteredList = rawList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssignedPsychologists = specialtiesDb.reduce(
    (acc, s) => acc + (s._count?.psychologists || 0),
    0
  );

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
            Catalogs & Taxonomies
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Configure clinical specialties, taxonomies, and compliance requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeCatalog === 'specialties' && (
            <button
              onClick={fetchSpecialties}
              className="p-2 border border-outline-variant/60 rounded-lg hover:bg-surface-variant text-primary transition-colors"
              title="Refresh from Database"
            >
              <span className={`material-symbols-outlined text-sm ${loadingSpecialties ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-body-md text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Entry
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Catalog Navigation */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-2 shadow-sm">
            <nav className="flex flex-col gap-1">
              {[
                {
                  id: 'specialties',
                  name: 'Specialties (DB)',
                  icon: 'psychology',
                  count: specialtiesDb.length,
                  live: true,
                },
                {
                  id: 'motives',
                  name: 'Consultation Motives',
                  icon: 'assignment_late',
                  count: motives.length,
                },
                {
                  id: 'documents',
                  name: 'Document Types',
                  icon: 'description',
                  count: documents.length,
                },
                {
                  id: 'rejections',
                  name: 'Rejection Reasons',
                  icon: 'cancel',
                  count: rejections.length,
                },
                {
                  id: 'legal',
                  name: 'Legal Texts',
                  icon: 'gavel',
                  count: legal.length,
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCatalog(cat.id as any);
                    setSearchQuery('');
                  }}
                  className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-lg font-body-md text-xs transition-colors border-l-2 ${
                    activeCatalog === cat.id
                      ? 'bg-surface-container-low text-primary font-bold border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-low/50 hover:text-primary border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        activeCatalog === cat.id ? 'text-secondary font-bold' : ''
                      }`}
                    >
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cat.live && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected to PostgreSQL" />
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        activeCatalog === cat.id
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Database Taxonomy Statistics */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-sm space-y-4">
            <h3 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>PostgreSQL Taxonomy Stats</span>
              <span className="material-symbols-outlined text-xs text-secondary">database</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Active Specialties:</span>
                <span className="font-data-mono text-xs font-bold text-primary">
                  {specialtiesDb.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Assigned Practitioners:</span>
                <span className="font-data-mono text-xs font-bold text-secondary">
                  {totalAssignedPsychologists}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/30">
              <div className="flex items-end justify-between mb-1">
                <span className="text-[10px] text-on-surface-variant font-semibold uppercase">Coverage Index</span>
                <span className="text-[10px] text-emerald-700 font-bold font-data-mono">100% Sync</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Data Grid */}
        <div className="lg:col-span-9 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm min-h-[500px] flex flex-col w-full">
          <div className="p-5 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary">
                {getActiveTitle()?.title}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                {getActiveTitle()?.desc}
              </p>
            </div>

            <div className="relative w-full sm:w-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                placeholder="Filter entries..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F1F5F9] sticky top-0 z-10">
                <tr className="border-b border-outline-variant/30">
                  <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                    Entry ID
                  </th>
                  <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                    System Code
                  </th>
                  {activeCatalog === 'specialties' && (
                    <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                      Assigned Psychologists
                    </th>
                  )}
                  <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-5 font-label-caps text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {filteredList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeCatalog === 'specialties' ? 6 : 5}
                      className="p-8 text-center text-on-surface-variant text-sm font-body-sm italic"
                    >
                      {loadingSpecialties
                        ? 'Loading taxonomy entries from PostgreSQL database...'
                        : 'No taxonomy entries match your filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="py-3 px-5 font-data-mono text-on-surface-variant/70 font-semibold">
                        {item.id}
                      </td>
                      <td className="py-3 px-5 font-semibold text-primary">
                        {item.name}
                      </td>
                      <td className="py-3 px-5 font-data-mono text-outline font-semibold">
                        {item.code}
                      </td>
                      {activeCatalog === 'specialties' && (
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">medical_services</span>
                            {item.psychologistsCount} {item.psychologistsCount === 1 ? 'Specialist' : 'Specialists'}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                            item.status === 'Active'
                              ? 'bg-secondary-fixed/30 text-on-secondary-fixed-variant'
                              : 'bg-error-container/30 text-error'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(item, idx)}
                            className="p-1.5 text-outline hover:text-primary transition-colors rounded hover:bg-surface-container-high"
                            title="Edit Taxonomy Name"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          {/* Delete or Archive */}
                          {activeCatalog === 'specialties' ? (
                            <button
                              onClick={() => handleDeleteSpecialty(idx)}
                              className="p-1.5 text-outline hover:text-error transition-colors rounded hover:bg-error-container/50"
                              title="Delete Specialty from Database"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="p-1.5 text-outline hover:text-error transition-colors rounded hover:bg-error-container/50"
                              title={item.status === 'Active' ? 'Suspend Entry' : 'Activate Entry'}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {item.status === 'Active' ? 'archive' : 'unarchive'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-[#F8FAFC] rounded-b-xl text-xs font-semibold">
            <span className="font-body-sm text-on-surface-variant">
              Showing {filteredList.length} of {rawList.length} entries
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
      </div>

      {/* Add Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              Add New {activeCatalog === 'specialties' ? 'Clinical Specialty' : 'Taxonomy Entry'}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  {activeCatalog === 'specialties' ? 'Specialty Name' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    activeCatalog === 'specialties'
                      ? 'e.g. Terapia Cognitivo-Conductual'
                      : 'e.g. Psychoanalytic Therapy'
                  }
                  required
                  className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
                />
              </div>

              {activeCatalog !== 'specialties' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                    System Short Code
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. PSY-ANA-GEN"
                    required
                    className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 text-xs font-semibold">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddModal(false);
                    setNewName('');
                    setNewCode('');
                  }}
                  className="px-4 py-2 border border-outline-variant rounded hover:bg-surface-container text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/95 flex items-center gap-1.5"
                >
                  {isSubmitting && (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  )}
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit</span>
              Edit Taxonomy Entry
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="p-2.5 border border-outline-variant rounded bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs font-semibold">
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => {
                    setEditingItem(null);
                    setEditName('');
                  }}
                  className="px-4 py-2 border border-outline-variant rounded hover:bg-surface-container text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/95 flex items-center gap-1.5"
                >
                  {isEditing && (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
