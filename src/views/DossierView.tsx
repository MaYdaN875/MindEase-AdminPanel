import React, { useState, useEffect } from 'react';
import type { PsychologistApplication } from './RequestsView';
import type { ProfessionalDocument, VerificationStatusHistory } from '../services/adminService';
import { getDocumentBlobUrl, updateDocumentStatus } from '../services/adminService';

interface DossierViewProps {
  app: PsychologistApplication;
  documents: ProfessionalDocument[];
  statusHistory: VerificationStatusHistory[];
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  onRequestChanges: (id: string, notes: string) => void;
  onAssignRevisor: (id: string) => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
  app,
  documents,
  statusHistory,
  onBack,
  onApprove,
  onReject,
  onRequestChanges,
  onAssignRevisor,
}) => {
  const [activeTab, setActiveTab] = useState<string>('tab-general');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Document Viewer & Validation State
  const [docList, setDocList] = useState<ProfessionalDocument[]>(documents);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docExpirationInput, setDocExpirationInput] = useState<string>('');
  const [updatingDocStatus, setUpdatingDocStatus] = useState(false);

  useEffect(() => {
    setDocList(documents);
  }, [documents]);

  const handleApprove = () => {
    onApprove(app.id);
  };

  const handleAssign = () => {
    onAssignRevisor(app.id);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onReject(app.id, notes);
      setNotes('');
      setShowRejectForm(false);
    }
  };

  const handleChangesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onRequestChanges(app.id, notes);
      setNotes('');
      setShowChangesForm(false);
    }
  };

  const handleSelectDocument = async (docId: string, filename: string) => {
    setSelectedDocId(docId);
    setLoadingDoc(true);
    setSelectedDocUrl(null);
    setSelectedDocName(filename);

    const docObj = docList.find((d) => d.id === docId);
    if (docObj?.expiresAt) {
      setDocExpirationInput(docObj.expiresAt.substring(0, 10));
    } else {
      setDocExpirationInput('');
    }

    try {
      const url = await getDocumentBlobUrl(docId, filename);
      setSelectedDocUrl(url);
    } catch (err) {
      console.error(err);
      alert('Failed to securely download document from the backend.');
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleUpdateDocStatus = async (newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (!selectedDocId) return;
    setUpdatingDocStatus(true);
    try {
      const updated = await updateDocumentStatus(
        selectedDocId,
        newStatus,
        docExpirationInput ? new Date(docExpirationInput).toISOString() : null
      );
      setDocList((prev) =>
        prev.map((d) => (d.id === selectedDocId ? { ...d, status: updated.status, expiresAt: updated.expiresAt } : d))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update document status on backend.');
    } finally {
      setUpdatingDocStatus(false);
    }
  };

  const handleSaveExpirationDate = async () => {
    if (!selectedDocId) return;
    const currentDoc = docList.find((d) => d.id === selectedDocId);
    if (!currentDoc) return;

    setUpdatingDocStatus(true);
    try {
      const updated = await updateDocumentStatus(
        selectedDocId,
        currentDoc.status,
        docExpirationInput ? new Date(docExpirationInput).toISOString() : null
      );
      setDocList((prev) =>
        prev.map((d) => (d.id === selectedDocId ? { ...d, expiresAt: updated.expiresAt } : d))
      );
      alert('Document expiration date saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save document expiration date.');
    } finally {
      setUpdatingDocStatus(false);
    }
  };

  const handleClearExpirationDate = async () => {
    if (!selectedDocId) return;
    const currentDoc = docList.find((d) => d.id === selectedDocId);
    if (!currentDoc) return;

    setUpdatingDocStatus(true);
    try {
      const updated = await updateDocumentStatus(selectedDocId, currentDoc.status, null);
      setDocExpirationInput('');
      setDocList((prev) =>
        prev.map((d) => (d.id === selectedDocId ? { ...d, expiresAt: updated.expiresAt } : d))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to clear expiration date.');
    } finally {
      setUpdatingDocStatus(false);
    }
  };

  // Auto-select first document on entering documentation tab
  useEffect(() => {
    if (activeTab === 'tab-docs' && docList.length > 0 && !selectedDocId) {
      handleSelectDocument(docList[0].id, docList[0].originalFilename);
    }
  }, [activeTab, docList, selectedDocId]);

  const tabs = [
    { id: 'tab-general', label: 'General Info' },
    { id: 'tab-professional', label: 'Professional Info' },
    { id: 'tab-docs', label: 'Documentation' },
    { id: 'tab-availability', label: 'Availability & Rates' },
    { id: 'tab-history', label: 'Admin History' },
  ];

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-xs">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[16px] font-bold">arrow_back</span>
          Applications List
        </button>
        <span>/</span>
        <span className="text-primary font-bold">{app.name}</span>
      </div>

      {/* Header Dossier Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden shadow-sm">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-surface-container-low to-transparent pointer-events-none"></div>
        
        {app.avatarUrl ? (
          <img
            alt={app.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-outline-variant z-10 shadow-sm shrink-0"
            src={app.avatarUrl}
          />
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-2xl z-10 shadow-sm shrink-0">
            {app.initials}
          </div>
        )}

        <div className="flex-1 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-primary">{app.name}</h2>
                
                {app.status === 'Verified' && (
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed/30 text-secondary border border-secondary/20 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] fill">verified</span> Verified
                  </span>
                )}
                {app.status === 'Pending' && (
                  <span className="px-2 py-0.5 rounded bg-[#fef3c7] text-[#b45309] border border-[#fde68a] font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span> Pending Review
                  </span>
                )}
                {app.status === 'Incomplete' && (
                  <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant border border-outline-variant/50 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">description</span> Incomplete
                  </span>
                )}
                {app.status === 'Requires Changes' && (
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">assignment_return</span> Needs Changes
                  </span>
                )}
                {app.status === 'Rejected' && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">cancel</span> Rejected
                  </span>
                )}
              </div>
              
              <p className="font-body-lg text-sm text-on-surface-variant font-semibold">
                {app.specialty} • License ID: {app.licenseNumber || 'N/A'}
              </p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">location_on</span> {app.state}
              </p>
            </div>
            
            {/* Top actions card */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {app.revisor === 'Unassigned' && (
                <button
                  onClick={handleAssign}
                  className="px-3 py-2 border border-outline-variant bg-surface-container-lowest text-primary rounded font-label-caps hover:bg-surface-container transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                  Assign to Me
                </button>
              )}
              <button className="px-3 py-2 border border-outline-variant bg-surface-container-lowest text-primary rounded font-label-caps hover:bg-surface-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Message
              </button>
              <button className="px-3 py-2 bg-primary text-on-primary rounded font-label-caps hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-label-caps text-xs tracking-wider uppercase whitespace-nowrap transition-all border-b-2 font-semibold ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === 'tab-general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Professional Biography</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {app.bio || `Dr. specialized in Clinical Psychology focused on patient resilience and emotional management.`}
                </p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Core Focus & Demographics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-surface rounded border border-outline-variant/30">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">Accepted Age Groups</span>
                    <span className="font-body-md text-sm text-primary font-bold mt-1 block">Adults (18-64), Couples</span>
                  </div>
                  <div className="p-3 bg-surface rounded border border-outline-variant/30">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">Languages</span>
                    <span className="font-body-md text-sm text-primary font-bold mt-1 block">Spanish (Native), English (Fluent)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-base font-bold text-primary mb-4 border-b border-outline-variant pb-2">Contact Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">mail</span>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Primary Email</p>
                      <p className="font-body-md text-sm text-primary font-bold">{app.email || 'e.rostova@clinicalnetwork.org'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">phone</span>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Phone Number</p>
                      <p className="font-data-mono text-sm text-primary font-bold">{app.phone || '+34 600 123 456'}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-professional' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Credentials & Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Academic Background</h4>
                <p className="font-body-md text-sm text-primary leading-relaxed bg-surface p-4 rounded border border-outline-variant/30">
                  {app.academicBackground || `No academic background provided.`}
                </p>
              </div>
              <div>
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Clinical Experience</h4>
                <p className="font-body-md text-sm text-primary leading-relaxed bg-surface p-4 rounded border border-outline-variant/30">
                  {app.experience || `No experience description provided.`}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-outline text-xs block font-semibold">Specialization Cédula</span>
                <span className="font-data-mono text-sm text-primary font-bold mt-1 block">{app.licenseNumber || 'CED-99887766'}</span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Accredited by</span>
                <span className="text-sm text-primary font-bold mt-1 block">Comité de Salud Mental</span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Liability Insurance</span>
                <span className="text-sm text-secondary font-bold mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Active (Covered)
                </span>
              </div>
              <div>
                <span className="text-outline text-xs block font-semibold">Criminal Records</span>
                <span className="text-sm text-secondary font-bold mt-1 block flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified_user</span> Clean (Verified)
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-docs' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-primary">
                  Validación Forense y Acreditación Documental
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Revisa, aprueba o rechaza cada documento individualmente y define sus fechas de vigencia / caducidad.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant font-data-mono">
                  {docList.filter((d) => d.status === 'APPROVED').length} / {docList.length} Validados
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document Lists */}
              <div className="lg:col-span-4 space-y-3">
                {docList && docList.length > 0 ? (
                  docList.map((doc) => {
                    const isActive = selectedDocId === doc.id;
                    const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date();
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDocument(doc.id, doc.originalFilename)}
                        className={`p-3.5 border rounded-xl hover:bg-surface transition-all cursor-pointer flex justify-between items-center text-left ${
                          isActive
                            ? 'border-secondary bg-secondary-container/10 shadow-xs'
                            : 'border-outline-variant bg-surface-container-low/30'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${isActive ? 'text-secondary' : 'text-primary'}`}>
                            description
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-body-sm text-xs font-bold text-primary truncate">
                                {doc.documentType}
                              </h4>
                              {isExpired && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Expirado
                                </span>
                              )}
                            </div>
                            <p className="font-data-mono text-[10px] text-outline mt-0.5 truncate">
                              {doc.originalFilename} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {doc.expiresAt && (
                              <span className="text-[10px] text-secondary font-data-mono block mt-1">
                                Vence: {new Date(doc.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 ml-2">
                          {doc.status === 'APPROVED' ? (
                            <span className="text-secondary material-symbols-outlined text-xl fill" title="Documento Aprobado">
                              check_circle
                            </span>
                          ) : doc.status === 'REJECTED' ? (
                            <span className="text-error material-symbols-outlined text-xl fill" title="Documento Rechazado">
                              cancel
                            </span>
                          ) : (
                            <span className="text-amber-500 material-symbols-outlined text-xl" title="Pendiente de Validación">
                              hourglass_top
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-on-surface-variant italic p-4 text-center">
                    No documents uploaded for this psychologist profile.
                  </div>
                )}
              </div>

              {/* PDF/Image Document Viewer & Individual Validation Toolbar */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                {/* Document Preview Frame */}
                <div className="border border-outline-variant/60 rounded-xl bg-surface p-4 flex flex-col items-center justify-center min-h-[380px] relative">
                  {selectedDocUrl ? (
                    selectedDocName?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={selectedDocUrl}
                        title="Document Preview"
                        className="w-full h-[420px] border-none rounded-lg bg-white shadow-sm"
                      />
                    ) : (
                      <img
                        src={selectedDocUrl}
                        alt="Document Preview"
                        className="max-w-full max-h-[420px] object-contain rounded-lg shadow-sm"
                      />
                    )
                  ) : loadingDoc ? (
                    <div className="text-center p-8">
                      <span className="material-symbols-outlined text-3xl text-secondary animate-spin">sync</span>
                      <p className="text-xs text-outline mt-2 font-semibold">
                        Downloading file from secure clinical storage...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8 max-w-sm">
                      <span className="material-symbols-outlined text-5xl text-outline mb-4">picture_as_pdf</span>
                      <h4 className="font-body-md text-sm font-bold text-primary mb-2">No Document Selected</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Select a document from the left list to load and preview its validation credentials in the secure frame.
                      </p>
                    </div>
                  )}
                </div>

                {/* Individual Document Verification & Expiration Toolbar */}
                {selectedDocId && (
                  (() => {
                    const activeDoc = docList.find((d) => d.id === selectedDocId);
                    if (!activeDoc) return null;

                    return (
                      <div className="bg-surface-container-low/80 border border-outline-variant rounded-xl p-4 space-y-4 text-left shadow-2xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary">
                                Validación Individual: {activeDoc.documentType}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-label-caps ${
                                  activeDoc.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : activeDoc.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {activeDoc.status === 'APPROVED'
                                  ? 'Aprobado'
                                  : activeDoc.status === 'REJECTED'
                                  ? 'Rechazado'
                                  : 'Pendiente'}
                              </span>
                            </div>
                            <span className="font-data-mono text-[10px] text-on-surface-variant">
                              Archivo: {activeDoc.originalFilename}
                            </span>
                          </div>

                          {/* Quick Status Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateDocStatus('APPROVED')}
                              disabled={updatingDocStatus || activeDoc.status === 'APPROVED'}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                              title="Aprobar este documento"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleUpdateDocStatus('REJECTED')}
                              disabled={updatingDocStatus || activeDoc.status === 'REJECTED'}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                              title="Rechazar este documento"
                            >
                              <span className="material-symbols-outlined text-[14px]">cancel</span>
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleUpdateDocStatus('PENDING')}
                              disabled={updatingDocStatus || activeDoc.status === 'PENDING'}
                              className="px-3 py-1.5 bg-surface-container border border-outline-variant hover:bg-surface-variant text-on-surface rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                              title="Marcar como pendiente"
                            >
                              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                              Pendiente
                            </button>
                          </div>
                        </div>

                        {/* Expiration Date Section */}
                        <div className="pt-3 border-t border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="font-semibold text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                event
                              </span>
                              Fecha de Expiración / Caducidad (Cédula, Licencia, Póliza):
                            </label>
                            <input
                              type="date"
                              value={docExpirationInput}
                              onChange={(e) => setDocExpirationInput(e.target.value)}
                              className="px-2.5 py-1 bg-surface border border-outline-variant rounded font-data-mono text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveExpirationDate}
                              disabled={updatingDocStatus || !docExpirationInput}
                              className="px-3 py-1 bg-primary text-on-primary rounded font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                            >
                              {updatingDocStatus && (
                                <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                              )}
                              Guardar Vigencia
                            </button>
                            {activeDoc.expiresAt && (
                              <button
                                onClick={handleClearExpirationDate}
                                disabled={updatingDocStatus}
                                className="px-2.5 py-1 border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded font-semibold text-xs transition-colors"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-availability' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Rates & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-surface border border-outline-variant/30 rounded-xl text-center">
                <span className="material-symbols-outlined text-3xl text-secondary mb-2">payments</span>
                <h4 className="text-xs font-label-caps text-on-surface-variant uppercase font-bold">Standard Consultation Price</h4>
                <p className="text-2xl font-bold text-primary mt-2">${app.consultationPrice || 700}.00 MXN</p>
                <span className="text-[10px] text-outline mt-1 block">Per 50-minute clinical session</span>
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Weekly Slots Overview</h4>
                <div className="grid grid-cols-5 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/30 bg-surface rounded text-center">
                      <span className="text-xs font-bold text-primary block">{day}</span>
                      <span className="text-[10px] text-secondary font-bold mt-1.5 block">09:00 - 18:00</span>
                      <span className="text-[9px] text-outline mt-0.5 block">Open slots available</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tab-history' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-4">Administrative Action Logs</h3>
            <div className="space-y-4">
              <div className="relative pl-6 border-l-2 border-outline-variant/60 space-y-6 text-sm">
                {statusHistory && statusHistory.length > 0 ? (
                  statusHistory.map((hist) => {
                    const histDate = new Date(hist.changedAt);
                    const timestampStr = `${histDate.toLocaleDateString()} ${histDate.toLocaleTimeString()}`;
                    return (
                      <div key={hist.id} className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-secondary border-2 border-surface-container-lowest"></div>
                        <div className="bg-surface p-3 rounded-lg border border-outline-variant/20">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-primary">
                              Status Shift: {hist.fromStatus} ➜ {hist.toStatus}
                            </span>
                            <span className="font-data-mono text-[10px] text-outline">{timestampStr}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {hist.comment || 'Status updated during credential audit.'}
                          </p>
                          <span className="text-[9px] text-outline block mt-2 font-semibold">
                            Changed by: {hist.changedBy.name} ({hist.changedBy.email})
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-on-surface-variant italic">No status changes logged.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Action Panels */}
      {app.status !== 'Verified' && app.status !== 'Rejected' && (
        <div className="mt-8 bg-surface-container-low/60 border border-outline-variant rounded-xl p-6 shadow-inner space-y-4">
          <h3 className="font-headline-sm text-sm font-bold text-primary uppercase tracking-wider">
            Revisor Verification Decisions
          </h3>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleApprove}
              className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary/90 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] fill">check_circle</span>
              Approve Psychologist
            </button>

            <button
              onClick={() => {
                setShowChangesForm(true);
                setShowRejectForm(false);
              }}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_return</span>
              Request Corrections
            </button>

            <button
              onClick={() => {
                setShowRejectForm(true);
                setShowChangesForm(false);
              }}
              className="px-5 py-2.5 bg-error text-on-error rounded-lg font-semibold hover:bg-error/90 transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject Application
            </button>
          </div>

          {/* Request Changes Form */}
          {showChangesForm && (
            <form onSubmit={handleChangesSubmit} className="mt-4 p-4 border border-outline-variant bg-surface rounded-lg space-y-3 animate-slide-in">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block font-bold">
                Corrections Note (Applicant will see this)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please re-upload your official degree certificate, the current photo is blurred."
                required
                className="w-full h-24 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-semibold text-xs hover:bg-amber-700">
                  Send Corrections Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangesForm(false)}
                  className="px-4 py-2 border border-outline-variant rounded font-semibold text-xs hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="mt-4 p-4 border border-outline-variant bg-surface rounded-lg space-y-3 animate-slide-in">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block font-bold">
                Reason for Rejection (Auditor compliance note)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Identity verification failed. License number is registered under a different name."
                required
                className="w-full h-24 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-error text-on-error rounded font-semibold text-xs hover:bg-error/90">
                  Confirm Administrative Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 border border-outline-variant rounded font-semibold text-xs hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
