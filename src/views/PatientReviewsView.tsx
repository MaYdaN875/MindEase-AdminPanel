import { useEffect, useState } from 'react';
import api from '../services/api';

type Review = { id: string; rating: number; comment: string; status: string; moderationReason: string | null };
export function PatientReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState<Record<string, string>>({});
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true); setError(''); setReviews([]);
    api.get('/reviews/moderation', { params: { page, status } }).then(({ data }) => {
      if (active) { setReviews(data.data.reviews); setHasMore(data.data.hasMore); }
    }).catch(() => { if (active) setError('No se pudieron cargar las reseñas.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [page, status, reload]);
  async function moderate(id: string, decision: string) {
    setBusy(true); setError('');
    try {
      await api.post(`/reviews/moderation/${id}`, { status: decision, reason: reason[id]?.trim() });
      setReload(n => n + 1);
    } catch { setError('No se pudo guardar el dictamen.'); setBusy(false); }
  }
  return <section className="p-6 space-y-4">
    <h1 className="text-2xl font-bold">Reseñas de consultas</h1>
    <p>Modera solo el texto: no publiques datos personales, diagnósticos ni detalles clínicos. Las críticas respetuosas deben permitirse. Aprobar o rechazar un comentario no cambia la calificación del profesional.</p>
    <label>Estado <select value={status} disabled={busy} onChange={e => { setStatus(e.target.value); setPage(1); }}>
      <option value="PENDING">Pendientes</option><option value="APPROVED">Publicadas</option><option value="REJECTED">No publicadas</option>
    </select></label>
    {error && <p role="alert">{error}</p>}
    <button disabled={busy} onClick={() => setReload(n => n + 1)}>Actualizar</button>
    {busy && <p role="status">Cargando…</p>}
    {!busy && !error && reviews.length === 0 && <p>No hay reseñas en esta página.</p>}
    {reviews.map(review => <article key={review.id} className="p-4 rounded-xl border space-y-3">
      <h2>Paciente anónimo · {review.rating} ★</h2>
      <p className="whitespace-pre-wrap break-words">{review.comment}</p>
      {review.moderationReason && <p>Último motivo: {review.moderationReason}</p>}
      <label className="block">Motivo del dictamen
        <textarea className="block w-full border rounded p-2" disabled={busy} maxLength={500}
          value={reason[review.id] ?? ''} onChange={e => setReason(r => ({ ...r, [review.id]: e.target.value }))} />
      </label>
      <div className="flex gap-4">
        <button disabled={busy || (reason[review.id]?.trim().length ?? 0) < 3} onClick={() => moderate(review.id, 'APPROVED')}>Publicar comentario</button>
        <button disabled={busy || (reason[review.id]?.trim().length ?? 0) < 3} onClick={() => moderate(review.id, 'REJECTED')}>No publicar / retirar</button>
      </div>
    </article>)}
    <div className="flex gap-4">
      <button disabled={busy || page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
      <span>Página {page}</span>
      <button disabled={busy || !hasMore} onClick={() => setPage(p => p + 1)}>Siguiente</button>
    </div>
  </section>;
}
