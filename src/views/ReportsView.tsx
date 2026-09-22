import React, { useState, useEffect } from 'react';
import {
  getCommunityReports,
  resolveCommunityReport,
  toggleCommunityPostVisibility,
  getUserConductReports,
  investigateUserConductReport,
  type CommunityReportRecord,
  type UserConductReportRecord,
} from '../services/adminService';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'community' | 'conduct'>('community');
  const [communityReports, setCommunityReports] = useState<CommunityReportRecord[]>([]);
  const [conductReports, setConductReports] = useState<UserConductReportRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Selected report for modal review
  const [selectedCommunityReport, setSelectedCommunityReport] = useState<CommunityReportRecord | null>(null);
  const [selectedConductReport, setSelectedConductReport] = useState<UserConductReportRecord | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState<string>('');
  const [hiddenReason, setHiddenReason] = useState<string>('Contenido que vulnera las normas comunitarias.');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comm, conduct] = await Promise.all([
        getCommunityReports(),
        getUserConductReports(),
      ]);
      setCommunityReports(comm);
      setConductReports(conduct);
    } catch (err: any) {
      console.error('Error fetching moderation reports:', err);
      setError('No se pudieron cargar los reportes desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const pendingCommunity = communityReports.filter((r) => r.status === 'PENDING').length;
  const pendingConduct = conductReports.filter((r) => r.status === 'PENDING').length;
  const investigatingConduct = conductReports.filter((r) => r.status === 'INVESTIGATING').length;
  const resolvedTotal =
    communityReports.filter((r) => r.status === 'RESOLVED').length +
    conductReports.filter((r) => r.status === 'RESOLVED').length;

  // Actions for Community Reports
  const handleResolveCommunity = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!selectedCommunityReport) return;
    setIsProcessing(true);
    try {
      await resolveCommunityReport(selectedCommunityReport.id, status, moderatorNotes);
      setActionSuccess(`Reporte de comunidad marcado como ${status === 'RESOLVED' ? 'Resuelto' : 'Descartado'}.`);
      setSelectedCommunityReport(null);
      setModeratorNotes('');
      await fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar el reporte');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePostVisibility = async (postId: string, action: 'HIDE' | 'UNHIDE') => {
    setIsProcessing(true);
    try {
      await toggleCommunityPostVisibility(postId, action, hiddenReason);
      setActionSuccess(`Publicación ${action === 'HIDE' ? 'ocultada del feed' : 'reactivada'}.`);
      await fetchReports();
      if (selectedCommunityReport) {
        setSelectedCommunityReport(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar visibilidad');
    } finally {
      setIsProcessing(false);
    }
  };

  // Actions for User Conduct Reports
  const handleInvestigateConduct = async (status: 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED', escalateToTicket = false) => {
    if (!selectedConductReport) return;
    setIsProcessing(true);
    try {
      const res = await investigateUserConductReport(selectedConductReport.id, {
        status,
        moderatorNotes,
        escalateToTicket,
      });
      const ticketMsg = res.ticket ? ` y escalado al Ticket #${res.ticket.ticketNumber}` : '';
      setActionSuccess(`Reporte de conducta actualizado a ${status}${ticketMsg}.`);
      setSelectedConductReport(null);
      setModeratorNotes('');
      await fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar reporte');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filters
  const filteredCommunityReports = communityReports.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const filteredConductReports = conductReports.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-stack-lg animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Moderación y Reportes</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Supervisión institucional de seguridad: publicaciones denunciadas en comunidad y conductas interpersonales.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold text-primary transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
          Sincronizar
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {actionSuccess}
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-on-secondary-container hover:opacity-75">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-error mb-2">
            <span className="font-label-caps text-[11px] uppercase tracking-wider font-bold">Comunidad Pendiente</span>
            <span className="material-symbols-outlined">forum</span>
          </div>
          <div className="font-headline-lg text-2xl font-bold text-primary">{pendingCommunity}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Posts o comentarios con reportes activos</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="font-label-caps text-[11px] uppercase tracking-wider font-bold">Conducta Pendiente</span>
            <span className="material-symbols-outlined">gavel</span>
          </div>
          <div className="font-headline-lg text-2xl font-bold text-primary">{pendingConduct}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Incidentes entre usuarios por auditar</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-primary mb-2">
            <span className="font-label-caps text-[11px] uppercase tracking-wider font-bold">En Investigación</span>
            <span className="material-symbols-outlined">biotech</span>
          </div>
          <div className="font-headline-lg text-2xl font-bold text-primary">{investigatingConduct}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Casos con expediente abierto</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="font-label-caps text-[11px] uppercase tracking-wider font-bold">Total Resueltos</span>
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="font-headline-lg text-2xl font-bold text-primary">{resolvedTotal}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Reportes concluidos con dictamen</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'community'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">article</span>
              Publicaciones Comunidad ({communityReports.length})
            </button>
            <button
              onClick={() => setActiveTab('conduct')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'conduct'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">person_alert</span>
              Conducta Interpersonal ({conductReports.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-on-surface-variant font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary outline-none focus:border-primary"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              {activeTab === 'conduct' && <option value="INVESTIGATING">En Investigación</option>}
              <option value="RESOLVED">Resuelto</option>
              <option value="DISMISSED">Descartado</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant text-xs flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-2xl animate-spin text-primary">sync</span>
              Consultando reportes en la base de datos...
            </div>
          ) : activeTab === 'community' ? (
            /* TAB 1: Community Reports Table */
            filteredCommunityReports.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">task_alt</span>
                No hay reportes de contenido en comunidad con el filtro seleccionado.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant font-label-caps text-on-surface-variant uppercase font-semibold">
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Objetivo</th>
                    <th className="p-3.5">Motivo</th>
                    <th className="p-3.5">Denunciante</th>
                    <th className="p-3.5">Estado Publicación</th>
                    <th className="p-3.5">Estado Reporte</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredCommunityReports.map((report) => {
                    const postStatus = report.post?.status;
                    const isHidden = postStatus === 'HIDDEN';
                    return (
                      <tr key={report.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-3.5 text-on-surface-variant font-data-mono">
                          {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5">
                          {report.post ? (
                            <div>
                              <div className="font-bold text-primary truncate max-w-xs">{report.post.title}</div>
                              <div className="text-[11px] text-on-surface-variant">Autor: {report.post.author.name}</div>
                            </div>
                          ) : report.comment ? (
                            <div>
                              <div className="italic text-primary truncate max-w-xs">"{report.comment.content}"</div>
                              <div className="text-[11px] text-on-surface-variant">Autor: {report.comment.user.name}</div>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant">Canal: {report.channel?.name || 'N/A'}</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold font-data-mono text-[11px]">
                            {report.reason}
                          </span>
                          {report.details && (
                            <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-1">{report.details}</p>
                          )}
                        </td>
                        <td className="p-3.5 text-on-surface">
                          <div className="font-medium">{report.reporter.name}</div>
                          <div className="text-[10px] text-on-surface-variant">{report.reporter.email}</div>
                        </td>
                        <td className="p-3.5">
                          {postStatus ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                isHidden
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-secondary-container text-on-secondary-container'
                              }`}
                            >
                              {postStatus}
                            </span>
                          ) : (
                            <span className="text-outline text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              report.status === 'PENDING'
                                ? 'bg-error/10 text-error'
                                : report.status === 'RESOLVED'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-outline-variant text-on-surface-variant'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedCommunityReport(report)}
                            className="px-2.5 py-1 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : (
            /* TAB 2: User Conduct Reports Table */
            filteredConductReports.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">task_alt</span>
                No hay reportes de conducta entre usuarios con el filtro seleccionado.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant font-label-caps text-on-surface-variant uppercase font-semibold">
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Denunciante</th>
                    <th className="p-3.5">Usuario Reportado</th>
                    <th className="p-3.5">Cita / Contexto</th>
                    <th className="p-3.5">Motivo</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredConductReports.map((report) => (
                    <tr key={report.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-3.5 text-on-surface-variant font-data-mono">
                        {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-primary">{report.reporter.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{report.reporter.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-error">{report.reportedUser.name}</div>
                        <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
                          {report.reportedUser.email}
                          {report.reportedUser.psychologistProfile && (
                            <span className="bg-primary/10 text-primary px-1 rounded text-[9px] font-bold">PSICÓLOGO</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {report.appointment ? (
                          <div className="font-data-mono text-[11px]">
                            <div>${report.appointment.price} MXN ({report.appointment.status})</div>
                            <div className="text-outline text-[10px]">
                              {new Date(report.appointment.startAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-outline text-[11px]">Sin cita directa</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold font-data-mono text-[11px]">
                          {report.reason}
                        </span>
                        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-1">{report.description}</p>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            report.status === 'PENDING'
                              ? 'bg-error/10 text-error'
                              : report.status === 'INVESTIGATING'
                              ? 'bg-primary/15 text-primary'
                              : report.status === 'RESOLVED'
                              ? 'bg-secondary/15 text-secondary'
                              : 'bg-outline-variant text-on-surface-variant'
                          }`}
                        >
                          {report.status}
                        </span>
                        {report.ticket && (
                          <span className="block mt-1 font-data-mono text-[10px] text-primary font-bold">
                            Ticket #{report.ticket.ticketNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedConductReport(report)}
                          className="px-2.5 py-1 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Investigar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* MODAL 1: Community Report Review */}
      {selectedCommunityReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
              <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-error">flag</span>
                Revisión de Reporte de Comunidad
              </h3>
              <button
                onClick={() => setSelectedCommunityReport(null)}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-surface-container-low p-3 rounded-lg space-y-1">
                <div className="text-outline font-bold uppercase text-[10px]">Contenido Denunciado</div>
                {selectedCommunityReport.post && (
                  <div>
                    <div className="font-bold text-primary text-sm">{selectedCommunityReport.post.title}</div>
                    <div className="text-on-surface-variant">Autor: {selectedCommunityReport.post.author.name}</div>
                    <div className="text-on-surface-variant">Estado actual: <span className="font-bold">{selectedCommunityReport.post.status}</span></div>
                  </div>
                )}
                {selectedCommunityReport.comment && (
                  <div>
                    <div className="italic text-primary">"{selectedCommunityReport.comment.content}"</div>
                    <div className="text-on-surface-variant">Autor: {selectedCommunityReport.comment.user.name}</div>
                  </div>
                )}
              </div>

              <div>
                <span className="text-outline font-bold uppercase text-[10px]">Motivo y Detalles</span>
                <div className="text-error font-semibold mt-0.5">{selectedCommunityReport.reason}</div>
                <div className="text-on-surface-variant bg-surface p-2 rounded mt-1 border border-outline-variant/40">
                  {selectedCommunityReport.details || 'Sin detalles adicionales provistos por el usuario.'}
                </div>
              </div>

              <div>
                <label className="text-on-surface font-semibold block mb-1">Notas del Moderador</label>
                <textarea
                  rows={2}
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Justificación o resolución institucional..."
                  className="w-full p-2.5 rounded border border-outline-variant text-xs outline-none focus:border-primary"
                />
              </div>

              {selectedCommunityReport.post && (
                <div className="pt-2 border-t border-outline-variant/40">
                  <label className="text-on-surface font-semibold block mb-1">Motivo si se oculta la publicación:</label>
                  <input
                    type="text"
                    value={hiddenReason}
                    onChange={(e) => setHiddenReason(e.target.value)}
                    className="w-full p-2 rounded border border-outline-variant text-xs outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
              {selectedCommunityReport.post && (
                selectedCommunityReport.post.status === 'HIDDEN' ? (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleTogglePostVisibility(selectedCommunityReport.post!.id, 'UNHIDE')}
                    className="px-3 py-1.5 bg-secondary text-on-secondary rounded text-xs font-bold hover:bg-secondary/90 transition-colors"
                  >
                    Reactivar Publicación
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleTogglePostVisibility(selectedCommunityReport.post!.id, 'HIDE')}
                    className="px-3 py-1.5 bg-error text-on-error rounded text-xs font-bold hover:bg-error/90 transition-colors"
                  >
                    Ocultar Publicación
                  </button>
                )
              )}

              <button
                disabled={isProcessing}
                onClick={() => handleResolveCommunity('DISMISSED')}
                className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Descartar Reporte
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleResolveCommunity('RESOLVED')}
                className="px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Resolver Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: User Conduct Report Investigation */}
      {selectedConductReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
              <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">gavel</span>
                Expediente de Conducta Interpersonal
              </h3>
              <button
                onClick={() => setSelectedConductReport(null)}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3 rounded-lg">
                <div>
                  <div className="text-outline font-bold uppercase text-[10px]">Denunciante</div>
                  <div className="font-bold text-primary">{selectedConductReport.reporter.name}</div>
                  <div className="text-[10px] text-on-surface-variant">{selectedConductReport.reporter.email}</div>
                </div>
                <div>
                  <div className="text-outline font-bold uppercase text-[10px]">Usuario Reportado</div>
                  <div className="font-bold text-error">{selectedConductReport.reportedUser.name}</div>
                  <div className="text-[10px] text-on-surface-variant">{selectedConductReport.reportedUser.email}</div>
                </div>
              </div>

              <div>
                <span className="text-outline font-bold uppercase text-[10px]">Motivo del Reporte</span>
                <div className="text-error font-semibold mt-0.5">{selectedConductReport.reason}</div>
              </div>

              <div>
                <span className="text-outline font-bold uppercase text-[10px]">Descripción de los Hechos</span>
                <div className="bg-surface p-3 rounded border border-outline-variant/40 text-on-surface-variant whitespace-pre-wrap mt-1">
                  {selectedConductReport.description}
                </div>
              </div>

              {selectedConductReport.appointment && (
                <div className="p-2.5 bg-surface-container-low rounded border border-outline-variant/30 flex justify-between items-center">
                  <div>
                    <span className="text-outline font-bold uppercase text-[10px]">Cita Vinculada</span>
                    <div className="font-bold text-primary">Consulta ${selectedConductReport.appointment.price} MXN</div>
                  </div>
                  <div className="text-right text-[10px] font-data-mono">
                    <div className="font-bold uppercase text-secondary">{selectedConductReport.appointment.status}</div>
                    <div>{new Date(selectedConductReport.appointment.startAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {selectedConductReport.evidenceUrls.length > 0 && (
                <div>
                  <span className="text-outline font-bold uppercase text-[10px]">Evidencias Adjuntas</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedConductReport.evidenceUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-[11px] font-semibold text-primary flex items-center gap-1 border border-outline-variant/50"
                      >
                        <span className="material-symbols-outlined text-xs">attach_file</span>
                        Evidencia #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-on-surface font-semibold block mb-1">Notas de la Investigación</label>
                <textarea
                  rows={2}
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Observaciones de soporte o moderación..."
                  className="w-full p-2.5 rounded border border-outline-variant text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
              {!selectedConductReport.ticketId && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleInvestigateConduct('INVESTIGATING', true)}
                  className="px-3 py-1.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded text-xs font-bold hover:bg-secondary-fixed-dim transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">confirmation_number</span>
                  Escalar a Ticket Soporte
                </button>
              )}

              <button
                disabled={isProcessing}
                onClick={() => handleInvestigateConduct('DISMISSED')}
                className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Descartar
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleInvestigateConduct('RESOLVED')}
                className="px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Resolver Caso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
