import { useEffect, useRef, useState } from 'react';
import { getAdminAppointment, listAdminAppointments } from '../services/appointmentAdminService';
import type { AdminAppointment, AppointmentFilters, AppointmentPage } from '../services/appointmentAdminService';

const appointmentStates = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
const consultationStates = ['NONE', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const paymentStates = ['NONE', 'PENDING', 'PROCESSING', 'AUTHORIZED', 'SUCCEEDED', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'];
const labels: Record<string, string> = { NONE: 'Sin registro', PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', COMPLETED: 'Completada', NO_SHOW: 'Inasistencia', SCHEDULED: 'Programada', IN_PROGRESS: 'En curso', PROCESSING: 'Procesando', AUTHORIZED: 'Autorizado', SUCCEEDED: 'Pagado', FAILED: 'Fallido', REFUND_PENDING: 'Reembolso pendiente', REFUNDED: 'Reembolsado', PARTIALLY_REFUNDED: 'Reembolso parcial' };
const date = (value?: string | null) => value ? new Date(value).toLocaleString('es-MX') : 'No registrado';
const blank = { search: '', status: '', consultationStatus: '', paymentStatus: '', from: '', to: '' };

export function AppointmentAdminView() {
  const [draft, setDraft] = useState(blank);
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<AppointmentPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminAppointment | null>(null);
  const detailRequest = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    detailRequest.current?.abort(); dialog.current?.close(); setDetail(null);
    setLoading(true); setError(''); setData(null);
    listAdminAppointments(filters, page, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(() => { if (!controller.signal.aborted) setError('No se pudieron cargar las citas. Verifica la conexión y tus permisos.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); detailRequest.current?.abort(); };
  }, [filters, page, revision]);
  const open = async (id: string) => {
    detailRequest.current?.abort(); const controller = new AbortController(); detailRequest.current = controller; setError('');
    try { const result = await getAdminAppointment(id, controller.signal); if (!controller.signal.aborted) { setDetail(result); dialog.current?.showModal(); } }
    catch { if (!controller.signal.aborted) setError('No se pudo consultar esta cita.'); }
  };
  const select = (key: 'status' | 'consultationStatus' | 'paymentStatus', label: string, states: string[]) => <label>{label}<select className="block border rounded p-2" value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })}><option value="">Todos</option>{states.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></label>;
  return <section className="space-y-5">
    <h2 className="text-2xl font-bold">Citas y consultas</h2>
    <p className="bg-blue-50 p-4 rounded-xl">Supervisión operativa de solo lectura. No se muestran notas clínicas, motivos privados de cancelación ni enlaces de videollamada. Esta vista no permite cambiar estados, cancelar citas o iniciar sesiones.</p>
    <form className="flex flex-wrap gap-3 items-end" onSubmit={e => {
      e.preventDefault();
      if (draft.from && draft.to && draft.from > draft.to) { setError('El inicio del rango debe ser anterior al final.'); return; }
      setFilters({ search: draft.search || undefined, status: draft.status || undefined, consultationStatus: draft.consultationStatus || undefined, paymentStatus: draft.paymentStatus || undefined,
        from: draft.from ? new Date(draft.from).toISOString() : undefined, to: draft.to ? new Date(draft.to).toISOString() : undefined });
      setPage(1); setRevision(v => v + 1);
    }}>
      <label>Nombre o ID de cita<input className="block border rounded p-2" maxLength={150} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })}/></label>
      {select('status', 'Estado de cita', appointmentStates)}{select('consultationStatus', 'Estado de consulta', consultationStates)}{select('paymentStatus', 'Estado de pago', paymentStates)}
      <label>Desde (hora local)<input className="block border rounded p-2" type="datetime-local" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })}/></label>
      <label>Hasta (hora local)<input className="block border rounded p-2" type="datetime-local" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })}/></label>
      <button className="border rounded p-2" disabled={loading}>Aplicar / actualizar</button>
      <button type="button" className="border rounded p-2" onClick={() => { setDraft(blank); setFilters({}); setPage(1); }}>Limpiar filtros</button>
    </form>
    <p>Fechas y horas locales del navegador. El rango filtra el inicio programado de la cita. Los contadores corresponden a todos los resultados filtrados.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}{loading && <p role="status">Cargando citas…</p>}
    {data && <>
      <div className="flex flex-wrap gap-3">{appointmentStates.map(status => <div className="border rounded p-3" key={status}>{labels[status]}: {data.counts.find(c => c.status === status)?.count ?? 0}</div>)}</div>
      <p>{data.total} citas · Página {data.page}</p>
      {!data.items.length ? <p>No hay citas con estos filtros.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Cita / horario', 'Paciente', 'Psicólogo', 'Cita', 'Consulta', 'Pago', 'Acciones'].map(h => <th className="border-b p-3" key={h}>{h}</th>)}</tr></thead><tbody>{data.items.map(a => <tr key={a.id}>
        <td className="border-b p-3"><p className="break-all">{a.id}</p><p>{date(a.startAt)}</p><p>Hasta {date(a.endAt)}</p></td>
        <td className="border-b p-3">{a.user.name}</td><td className="border-b p-3">{a.psychologist.user.name}</td>
        <td className="border-b p-3">{labels[a.status] ?? a.status}</td><td className="border-b p-3">{a.consultation ? labels[a.consultation.status] : 'Sin registro'}</td><td className="border-b p-3">{a.payment ? labels[a.payment.status] : 'Sin registro'}</td>
        <td className="border-b p-3"><button className="underline" onClick={() => void open(a.id)}>Ver cita</button></td>
      </tr>)}</tbody></table></div>}
      <div className="flex gap-3"><button className="border p-2 rounded" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Anterior</button><button className="border p-2 rounded" disabled={!data.hasMore || loading} onClick={() => setPage(p => p + 1)}>Siguiente</button></div>
    </>}
    <dialog ref={dialog} aria-labelledby="appointment-detail-title" className="p-6 rounded-xl max-w-2xl w-[90vw] backdrop:bg-black/50" onClose={() => setDetail(null)}>
      <div className="flex justify-between gap-3"><h3 id="appointment-detail-title" className="font-bold">Detalle operativo de cita</h3><button autoFocus className="border rounded p-2" onClick={() => dialog.current?.close()}>Cerrar detalle</button></div>
      {detail && <div className="space-y-2 break-words mt-4"><p>ID: {detail.id}</p><p>Paciente: {detail.user.name}</p><p>Psicólogo: {detail.psychologist.user.name}</p><p>Cita: {labels[detail.status]}</p><p>Horario: {date(detail.startAt)} — {date(detail.endAt)}</p><p>Creada: {date(detail.createdAt)}</p><p>Última actualización: {date(detail.updatedAt)}</p><h4 className="font-bold">Consulta</h4>{detail.consultation ? <><p>{detail.consultation.id} · {labels[detail.consultation.status]}</p><p>Inicio registrado: {date(detail.consultation.startedAt)}</p><p>Fin registrado: {date(detail.consultation.endedAt)}</p></> : <p>Sin consulta registrada.</p>}<h4 className="font-bold">Pago (estado independiente de la cita)</h4><p>{detail.payment ? `${detail.payment.id} · ${labels[detail.payment.status]}` : 'Sin pago registrado.'}</p></div>}
    </dialog>
  </section>;
}
