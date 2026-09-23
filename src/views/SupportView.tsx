import { useEffect, useState } from 'react';
import api from '../services/api';
import { openProtectedMedia } from '../services/adminService';

interface Ticket {
  id: string; ticketNumber: number; subject: string; status: string; priority: string;
  user: { name: string; email: string }; assignedTo?: { id: string; name: string } | null;
  messages?: { id: string; content: string; isInternalNote: boolean; attachments: string[]; sender: { name: string }; createdAt: string }[];
}
const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const errorMessage = (error: unknown) => {
  const failure = error as { response?: { data?: { message?: string } }; message?: string };
  return failure.response?.data?.message ?? failure.message ?? 'No se pudo completar la operación';
};

export function SupportView({ userId, initialTicketId }: { userId: string; initialTicketId?: string }) {
  const [items, setItems] = useState<Ticket[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [assigned, setAssigned] = useState('');
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [content, setContent] = useState('');
  const [internal, setInternal] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function list(next?: string, filters = applied) {
    const response = await api.get('/support/agent/tickets', { params: { ...filters, cursor: next, limit: 20 } });
    const page = response.data.data;
    setItems(previous => next ? Array.from(new Map([...previous, ...page.items].map((t: Ticket) => [t.id, t])).values()) : page.items);
    setCursor(page.hasMore ? page.nextCursor : null);
    const summary = await api.get('/support/agent/metrics'); setMetrics(summary.data.data);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  }
  async function detail(id: string) {
    const response = await api.get(`/support/tickets/${id}`);
    setSelected(response.data.data.ticket);
  }
  useEffect(() => {
    const controller = new AbortController();
    api.get('/support/agent/tickets', { params: { limit: 20 }, signal: controller.signal })
      .then(response => { setItems(response.data.data.items); setCursor(response.data.data.hasMore ? response.data.data.nextCursor : null); })
      .catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    api.get('/support/agent/agents', { signal: controller.signal }).then(response => setAgents(response.data.data.agents)).catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); });
    api.get('/support/agent/metrics', { signal: controller.signal }).then(response => setMetrics(response.data.data)).catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); });
    if (initialTicketId) api.get(`/support/tickets/${initialTicketId}`, { signal: controller.signal }).then(response => setSelected(response.data.data.ticket)).catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); });
    return () => controller.abort();
  }, [initialTicketId]);
  async function mutate(path: string, body: object) {
    await api.put(path, body);
    await detail(selected!.id); await list(); setNotice('Ticket actualizado');
  }
  const inputClass = 'border rounded px-3 py-2 bg-white';
  return <section className="space-y-4">
    <h2 className="text-2xl font-bold">Soporte y tickets</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[['Abiertos', 'openCount'], ['En atención', 'inProgressCount'], ['Esperando usuario', 'waitingUserCount'], ['Resueltos', 'resolvedCount'], ['Cerrados', 'closedCount'], ['Sin asignar', 'unassignedCount'], ['Urgentes', 'urgentOpenCount']].map(([label, key]) => <div key={key} className="border rounded p-3 bg-white"><p>{label}</p><strong>{metrics[key] ?? '—'}</strong></div>)}</div>
    <p>Primera respuesta promedio: {metrics.avgFirstResponseMinutes ?? '—'} min. Muestra: {metrics.responseSampleSize ?? '—'} de los últimos 100 tickets respondidos.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    <form className="flex gap-2 flex-wrap" onSubmit={event => { event.preventDefault(); const filters = Object.fromEntries(Object.entries({ status, search, priority, category, assigned }).filter(([, value]) => value)); setApplied(filters); void run(() => list(undefined, filters)); }}>
      <input aria-label="Buscar tickets" className={inputClass} value={search} onChange={event => setSearch(event.target.value)} placeholder="Asunto, usuario o correo" />
      <select aria-label="Filtrar estado" className={inputClass} value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">Todos los estados</option>{statuses.map(value => <option key={value}>{value}</option>)}
      </select>
      <select aria-label="Filtrar prioridad" className={inputClass} value={priority} onChange={event => setPriority(event.target.value)}><option value="">Todas las prioridades</option>{priorities.map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filtrar categoría" className={inputClass} value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas las categorías</option>{['ACCOUNT', 'APPOINTMENT', 'PAYMENT', 'PSYCHOLOGIST', 'TECHNICAL', 'REPORT', 'OTHER'].map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filtrar agente" className={inputClass} value={assigned} onChange={event => setAssigned(event.target.value)}><option value="">Todos los agentes</option><option value="me">Asignados a mí</option><option value="unassigned">Sin asignar</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
      <button disabled={busy} className={inputClass}>Buscar / actualizar</button>
    </form>
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-2">
        {!items.length && !busy && <p>No hay tickets para estos filtros.</p>}
        {items.map(ticket => <button key={ticket.id} disabled={busy} className="block text-left w-full border rounded p-3 bg-white" onClick={() => {
          if ((content || attachments.length) && !confirm('Hay una respuesta sin enviar. ¿Descartarla y cambiar de ticket?')) return;
          void run(async () => { await detail(ticket.id); setContent(''); setAttachments([]); setInternal(false); });
        }}>
          <strong>#{ticket.ticketNumber} — {ticket.subject}</strong>
          <p>{ticket.user.name} · {ticket.status} · {ticket.priority}</p>
          <small>Asignado: {ticket.assignedTo?.name ?? 'Sin asignar'}</small>
        </button>)}
        {cursor && <button disabled={busy} className={inputClass} onClick={() => void run(() => list(cursor))}>Cargar más</button>}
      </div>
      {selected && <article className="border rounded p-4 bg-white space-y-4">
        <h3 className="font-bold">#{selected.ticketNumber} — {selected.subject}</h3>
        <p>{selected.user.name} · {selected.user.email}</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Asignar a agente" disabled={busy} className={inputClass} value={selected.assignedTo?.id ?? ''} onChange={event => void run(() => mutate(`/support/agent/tickets/${selected.id}/assign`, { agentId: event.target.value || null }))}>
            <option value="">Sin asignar</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
          <button disabled={busy} className={inputClass} onClick={() => void run(() => mutate(`/support/agent/tickets/${selected.id}/assign`, { agentId: userId }))}>Asignarme</button>
          <button disabled={busy} className={inputClass} onClick={() => void run(() => mutate(`/support/agent/tickets/${selected.id}/assign`, { agentId: null }))}>Desasignar</button>
          <select aria-label="Estado del ticket" disabled={busy} className={inputClass} value={selected.status} onChange={event => void run(() => mutate(`/support/agent/tickets/${selected.id}/status`, { status: event.target.value }))}>
            {statuses.map(value => <option key={value}>{value}</option>)}
          </select>
          <select aria-label="Prioridad" disabled={busy} className={inputClass} value={selected.priority} onChange={event => void run(() => mutate(`/support/agent/tickets/${selected.id}/status`, { status: selected.status, priority: event.target.value }))}>
            {priorities.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        <div className="max-h-96 overflow-auto space-y-3">
          {selected.messages?.map(message => <div key={message.id} className={`border rounded p-3 ${message.isInternalNote ? 'bg-amber-50' : ''}`}>
            <strong>{message.sender.name}{message.isInternalNote ? ' — Nota interna (no visible al paciente)' : ''}</strong>
            <p className="whitespace-pre-wrap">{message.content}</p>
            <small>{new Date(message.createdAt).toLocaleString('es-MX')}</small>
            {message.attachments.map((url, index) => <button key={url} className="block underline" onClick={() => void openProtectedMedia(url).catch(failure => setError(errorMessage(failure)))}>Abrir adjunto {index + 1}</button>)}
          </div>)}
        </div>
        <form className="space-y-2" onSubmit={event => {
          event.preventDefault();
          void run(async () => {
            await api.post(`/support/agent/tickets/${selected.id}/messages`, { content, isInternalNote: internal, attachments });
            setContent(''); setAttachments([]); setInternal(false);
            await detail(selected.id); await list(); setNotice('Mensaje guardado');
          });
        }}>
          <textarea aria-label="Respuesta" required maxLength={3000} className={`${inputClass} w-full`} value={content} onChange={event => setContent(event.target.value)} />
          <label className="block"><input type="checkbox" checked={internal} onChange={event => setInternal(event.target.checked)} /> Nota interna, no enviar al paciente</label>
          <label className="block">Adjuntar imagen o PDF (hasta 5 archivos, 10 MB cada uno)
            <input type="file" disabled={busy || attachments.length >= 5} accept="image/png,image/jpeg,image/gif,image/webp,application/pdf" onChange={event => {
              const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
              void run(async () => {
                if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera 10 MB');
                const form = new FormData(); form.append('file', file);
                const response = await api.post('/support/upload', form);
                setAttachments(previous => [...previous, response.data.data.url]);
              });
            }} />
          </label>
          {attachments.map((url, index) => <button type="button" key={url} disabled={busy} className="block underline" onClick={() => setAttachments(previous => previous.filter(item => item !== url))}>Quitar adjunto {index + 1}</button>)}
          <button disabled={busy || !content.trim()} className={inputClass}>{busy ? 'Procesando…' : internal ? 'Guardar nota interna' : 'Enviar respuesta'}</button>
        </form>
      </article>}
    </div>
  </section>;
}
