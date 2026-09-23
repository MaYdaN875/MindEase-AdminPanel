import { useEffect, useRef, useState } from 'react';
import { getFinanceList, getFinancePayment, getFinanceSummary } from '../services/financeService';
import type { FinanceFilters, FinancePage, FinanceResource, FinanceRow, FinanceSummary } from '../services/financeService';

const states = {
  payments: ['PENDING', 'PROCESSING', 'AUTHORIZED', 'SUCCEEDED', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  refunds: ['REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  payouts: ['REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED'],
};
const money = (value: string | undefined, currency: string) => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(value ?? 0));
const date = (value?: string) => value ? new Date(value).toLocaleString('es-MX') : '—';
const cards: [keyof FinanceSummary, string][] = [
  ['completedGross', 'Bruto de consultas completadas'], ['earnedFees', 'Comisiones de consultas completadas'],
  ['availableBalance', 'Disponible contable neto'], ['heldBalance', 'Neto en custodia'],
  ['pendingPayoutBalance', 'Reserva para retiros'], ['totalWithdrawn', 'Retiros registrados completados'],
  ['reviewBalance', 'Neto que requiere revisión'], ['refundedAmount', 'Reembolsado íntegramente'],
  ['pendingRefundAmount', 'Reembolso pendiente (bruto)'],
];

export function FinanceView() {
  const [currency, setCurrency] = useState('MXN');
  const [resource, setResource] = useState<FinanceResource>('payments');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [result, setResult] = useState<FinancePage | null>(null);
  const [draft, setDraft] = useState({ search: '', status: '', from: '', to: '' });
  const [applied, setApplied] = useState<FinanceFilters>({ currency: 'MXN' });
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<FinanceRow | null>(null);
  const detailRequest = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    detailRequest.current?.abort(); setDetail(null); dialog.current?.close();
    setLoading(true); setError(''); setResult(null); setSummary(null);
    Promise.all([getFinanceSummary(applied.currency, controller.signal), getFinanceList(resource, applied, page, controller.signal)])
      .then(([s, rows]) => { if (!controller.signal.aborted) { setSummary(s); setResult(rows); } })
      .catch(() => { if (!controller.signal.aborted) setError('No se pudo cargar Finanzas. Verifica tu conexión y permisos.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); detailRequest.current?.abort(); };
  }, [resource, applied, page, revision]);

  const showDetail = async (id: string) => {
    detailRequest.current?.abort(); const controller = new AbortController(); detailRequest.current = controller;
    setError('');
    try { const row = await getFinancePayment(id, controller.signal); if (!controller.signal.aborted) { setDetail(row); dialog.current?.showModal(); } }
    catch { if (!controller.signal.aborted) setError('No se pudo consultar el detalle del pago.'); }
  };
  const changeTab = (next: FinanceResource) => {
    setResource(next); setDraft({ search: '', status: '', from: '', to: '' }); setApplied({ currency }); setPage(1);
  };
  return <section className="space-y-5">
    <h2 className="text-2xl font-bold">Finanzas</h2>
    <p className="rounded-lg bg-amber-50 p-4 text-amber-950">Supervisión de solo lectura. Los saldos son registros internos de MindEase, no el saldo bancario ni una conciliación con Stripe. No se ejecutan cobros, reembolsos o transferencias desde este panel. Los retiros reales requieren Stripe Connect.</p>
    <label className="block">Moneda <select className="border rounded p-2" value={currency} onChange={e => { setCurrency(e.target.value); setApplied({ ...applied, currency: e.target.value }); setPage(1); }}><option>MXN</option><option>USD</option><option>EUR</option></select></label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading && <p role="status">Cargando información financiera…</p>}
    {summary && <>
      <p>Proveedor configurado: {summary.provider} · Consulta: {date(summary.asOf)}. Resumen histórico de {summary.currency}; los filtros de abajo solo afectan al listado.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{cards.map(([key, label]) => <div key={key} className="rounded-xl border bg-white p-4"><h3>{label}</h3><p className="text-xl font-bold">{money(String(summary[key]), summary.currency)}</p></div>)}</div>
      <p>Disponible = neto de consultas completadas − retiros reservados − retiros completados. Las comisiones mostradas no descuentan cargos del procesador.</p>
      {summary.partialRefundCount > 0 && <p role="alert" className="text-amber-800">Hay {summary.partialRefundCount} pagos parcialmente reembolsados. El modelo no registra su importe devuelto: se excluyen del saldo disponible y requieren conciliación.</p>}
      {Number(summary.availableBalance) < 0 && <p role="alert" className="text-red-700">Saldo contable negativo: revisar pagos y retiros antes de autorizar operaciones externas.</p>}
      <div className="flex flex-wrap gap-3">{summary.paymentsByStatus.map(s => <span key={s.status} className="border rounded px-2 py-1">{s.status}: {s.count} · {money(s.amount, summary.currency)}</span>)}</div>
    </>}
    <nav aria-label="Secciones financieras" className="flex gap-3">{(['payments', 'refunds', 'payouts'] as const).map(r => <button key={r} aria-pressed={resource === r} className={`border rounded p-2 ${resource === r ? 'bg-primary-container text-white' : ''}`} onClick={() => changeTab(r)}>{r === 'payments' ? 'Pagos' : r === 'refunds' ? 'Reembolsos' : 'Retiros'}</button>)}</nav>
    <form className="flex flex-wrap items-end gap-3" onSubmit={e => {
      e.preventDefault();
      if (draft.from && draft.to && draft.from > draft.to) { setError('La fecha inicial debe ser anterior a la final.'); return; }
      setApplied({ currency, search: draft.search || undefined, status: draft.status || undefined,
        from: draft.from ? new Date(draft.from).toISOString() : undefined, to: draft.to ? new Date(draft.to).toISOString() : undefined }); setPage(1); setRevision(v => v + 1);
    }}>
      <label>Buscar por nombre o ID<input className="block border rounded p-2" maxLength={150} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })}/></label>
      <label>Estado<select className="block border rounded p-2" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">Todos</option>{states[resource].map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Desde (hora local)<input className="block border rounded p-2" type="datetime-local" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })}/></label>
      <label>Hasta (hora local)<input className="block border rounded p-2" type="datetime-local" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })}/></label>
      <button className="border rounded p-2" disabled={loading}>Aplicar / actualizar</button>
    </form>
    <p>Fechas por creación del pago o solicitud de retiro, no por fecha de reembolso. Importes de reembolsos: monto original del pago; los parciales requieren revisión.</p>
    {result && <>
      <p>{result.total} registros · Página {result.page}</p>
      {!result.items.length ? <p>No hay movimientos con estos filtros.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Referencia / fecha', 'Personas', 'Estado', 'Importes', 'Detalle'].map(h => <th key={h} className="p-3 border-b">{h}</th>)}</tr></thead><tbody>{result.items.map(row => <tr key={row.id}>
        <td className="p-3 border-b"><span className="break-all">{row.id}</span><p>{date(row.createdAt ?? row.requestedAt)}</p></td>
        <td className="p-3 border-b">Psicólogo: {row.psychologist.user.name}{row.patient && <p>Paciente: {row.patient.name}</p>}</td>
        <td className="p-3 border-b">{row.status}{row.appointment && <p>Cita: {row.appointment.status}</p>}</td>
        <td className="p-3 border-b">{money(row.amount, row.currency)}{row.platformFee !== undefined && <><p>Comisión: {money(row.platformFee, row.currency)}</p><p>Neto: {money(row.netAmount, row.currency)}</p></>}</td>
        <td className="p-3 border-b">{resource === 'payouts' ? <>{row.bankName}<p>{row.accountClabe}</p><p>Sin transferencia desde este panel</p></> : <button className="underline" onClick={() => void showDetail(row.id)}>Ver pago</button>}</td>
      </tr>)}</tbody></table></div>}
      <div className="flex gap-3"><button className="border p-2 rounded" disabled={loading || page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button><button className="border p-2 rounded" disabled={loading || !result.hasMore} onClick={() => setPage(p => p + 1)}>Siguiente</button></div>
    </>}
    <dialog ref={dialog} aria-labelledby="finance-detail-title" className="p-6 rounded-xl max-w-2xl w-[90vw] backdrop:bg-black/50" onClose={() => setDetail(null)}>
      <div className="flex justify-between gap-3"><h3 id="finance-detail-title" className="font-bold">Detalle financiero</h3><button autoFocus className="border rounded p-2" onClick={() => dialog.current?.close()}>Cerrar detalle</button></div>
      {detail && <div className="space-y-2 break-words mt-4"><p>Pago: {detail.id}</p><p>Cita: {detail.appointmentId} · {detail.appointment?.status}</p><p>Estado: {detail.status} · {money(detail.amount, detail.currency)}</p><p>Comisión: {money(detail.platformFee, detail.currency)} · Neto: {money(detail.netAmount, detail.currency)}</p><p>Referencia del procesador: {detail.transactionId ?? 'No registrada'}</p><p>Referencia de reembolso: {detail.refundId ?? 'No registrada'} · Fecha: {date(detail.refundedAt)}</p><p>Intentos de reembolso: {detail.refundAttempts}</p><h4 className="font-bold">Intentos de pago</h4>{!detail.attempts?.length && <p>Sin intentos registrados.</p>}{detail.attempts?.map(a => <p key={a.id}>{a.provider} · {a.status} · {date(a.createdAt)}</p>)}</div>}
    </dialog>
  </section>;
}
