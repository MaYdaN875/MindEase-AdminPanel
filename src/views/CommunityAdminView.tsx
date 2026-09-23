import { useEffect, useState } from 'react';
import api from '../services/api';
import { canAccess, openProtectedMedia } from '../services/adminService';

type Resource = 'channels' | 'categories' | 'posts' | 'comments' | 'history';
interface Row {
  id: string; name?: string; title?: string; slug?: string; description?: string; content?: string;
  isActive?: boolean; isHidden?: boolean; status?: string; action?: string; details?: unknown; createdAt: string;
  category?: { name: string }; psychologist?: { user: { name: string } }; author?: { name: string };
  user?: { name: string }; channel?: { name: string }; post?: { title: string };
  media?: { url: string; caption?: string }[]; _count?: { posts?: number; followers?: number; channels?: number };
}
const labels: Record<Resource, string> = { channels: 'Canales', categories: 'Categorías', posts: 'Publicaciones', comments: 'Comentarios', history: 'Historial de moderación' };
const message = (error: unknown) => {
  const value = error as { response?: { data?: { message?: string } }; message?: string };
  return value.response?.data?.message ?? value.message ?? 'Error al consultar el servidor';
};
const input = 'border rounded px-3 py-2 bg-white';

export function CommunityAdminView({ roles }: { roles: string[] }) {
  const [resource, setResource] = useState<Resource>('channels');
  const [scope, setScope] = useState<Record<string, string>>({});
  const navigate = (next: Resource, filter: Record<string, string> = {}) => { setResource(next); setScope(filter); };
  return <section className="space-y-4">
    <h2 className="text-2xl font-bold">Administración de Community</h2>
    <nav className="flex flex-wrap gap-2">{(Object.keys(labels) as Resource[]).map(value => <button key={value} className={`${input} ${resource === value ? 'font-bold border-blue-600' : ''}`} onClick={() => navigate(value)}>{labels[value]}</button>)}</nav>
    <ResourceList key={resource + JSON.stringify(scope)} resource={resource} scope={scope} canEditCategory={canAccess(roles, 'catalogs')} navigate={navigate} />
  </section>;
}

function ResourceList({ resource, scope, canEditCategory, navigate }: { resource: Resource; scope: Record<string, string>; canEditCategory: boolean; navigate: (resource: Resource, filter?: Record<string, string>) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Row[]>([]);
  const [applied, setApplied] = useState<Record<string, string>>({ ...scope });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/admin/community/${resource}`, { params: { ...scope, limit: 20 }, signal: controller.signal })
      .then(response => { setRows(response.data.data.items); setCursor(response.data.data.nextCursor); })
      .catch(failure => { if (!controller.signal.aborted) setError(message(failure)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    if (resource === 'channels') {
      void (async () => {
        const result: Row[] = []; let next: string | undefined;
        do { const response = await api.get('/admin/community/categories', { params: { limit: 100, cursor: next }, signal: controller.signal }); result.push(...response.data.data.items); next = response.data.data.nextCursor ?? undefined; } while (next);
        if (!controller.signal.aborted) setCategories(result);
      })().catch(failure => { if (!controller.signal.aborted) setError(message(failure)); });
    }
    return () => controller.abort();
  }, [resource, scope]);

  async function load(filters = applied, next?: string) {
    const response = await api.get(`/admin/community/${resource}`, { params: { ...filters, limit: 20, cursor: next } });
    const data = response.data.data;
    setRows(previous => next ? Array.from(new Map([...previous, ...data.items].map((row: Row) => [row.id, row])).values()) : data.items);
    setCursor(data.nextCursor);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (failure) { setError(message(failure)); } finally { setBusy(false); }
  }
  async function moderate(row: Row) {
    if (reason.trim().length < 3) throw new Error('Escribe un motivo de al menos 3 caracteres');
    if (resource === 'channels') await api.patch(`/admin/community/channels/${row.id}/status`, { isActive: !row.isActive, reason });
    if (resource === 'posts') await api.put(`/community/posts/${row.id}/moderate`, { action: row.status === 'HIDDEN' ? 'UNHIDE' : 'HIDE', hiddenReason: reason });
    if (resource === 'comments') await api.put(`/community/comments/${row.id}/moderate`, { action: row.isHidden ? 'UNHIDE' : 'HIDE', hiddenReason: reason });
    await load(); setNotice('Cambio guardado con trazabilidad de moderación');
  }
  function resetEditor() { setEditing(null); setName(''); setSlug(''); setDescription(''); setActive(true); }
  return <div className="space-y-4">
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {Object.keys(scope).length > 0 && <p>Mostrando contenido del recurso seleccionado. <button className="underline" onClick={() => navigate(resource)}>Quitar filtro</button></p>}
    <form className="flex gap-2 flex-wrap" onSubmit={event => { event.preventDefault(); const filters = { ...scope, ...(search ? { search } : {}), ...(state ? { [resource === 'posts' ? 'status' : 'active']: state } : {}), ...(categoryId ? { categoryId } : {}) }; setApplied(filters); void run(() => load(filters)); }}>
      {resource !== 'history' && <input aria-label="Buscar Community" className={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar contenido" />}
      {resource !== 'history' && <select aria-label="Estado Community" className={input} value={state} onChange={event => setState(event.target.value)}>
        <option value="">Todos los estados</option>
        {resource === 'posts' ? ['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED'].map(value => <option key={value}>{value}</option>) : <><option value="true">Activo / visible</option><option value="false">Inactivo / oculto</option></>}
      </select>}
      {resource === 'channels' && <select aria-label="Categoría del canal" className={input} value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Todas las categorías</option>{categories.map(row => <option key={row.id} value={row.id}>{row.name}{row.isActive ? '' : ' (inactiva)'}</option>)}</select>}
      <button disabled={busy} className={input}>Buscar / actualizar</button>
    </form>
    {['channels', 'posts', 'comments'].includes(resource) && <label className="block">Motivo de moderación (obligatorio)
      <input className={`${input} w-full`} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} />
    </label>}
    {resource === 'categories' && <p>Desactivar una categoría impide nuevas asignaciones; no elimina ni oculta sus canales existentes.</p>}
    {resource === 'categories' && canEditCategory && <form className="border rounded p-3 space-y-2" onSubmit={event => { event.preventDefault(); void run(async () => {
      const body = { name, slug, description, isActive: active };
      if (editing) await api.patch(`/admin/community/categories/${editing}`, body); else await api.post('/admin/community/categories', body);
      resetEditor(); await load(); setNotice('Categoría guardada');
    }); }}>
      <h3 className="font-bold">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
      <input required minLength={2} maxLength={100} aria-label="Nombre de categoría" placeholder="Nombre" className={input} value={name} onChange={event => setName(event.target.value)} />
      <input required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" aria-label="Slug de categoría" placeholder="identificador-sin-espacios" className={input} value={slug} onChange={event => setSlug(event.target.value)} />
      <textarea aria-label="Descripción de categoría" maxLength={1000} className={`${input} w-full`} value={description} onChange={event => setDescription(event.target.value)} />
      <label><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} /> Activa</label>
      <button disabled={busy} className={input}>Guardar categoría</button><button type="button" disabled={busy} onClick={resetEditor} className={input}>Limpiar / cancelar</button>
    </form>}
    {!busy && !rows.length && <p>No hay resultados.</p>}
    {rows.map(row => <article key={row.id} className="border rounded p-4 bg-white space-y-2">
      <h3 className="font-bold">{row.name ?? row.title ?? row.action ?? row.user?.name}</h3>
      <p className="text-sm">{row.status ?? (row.isActive !== undefined ? row.isActive ? 'Activo' : 'Inactivo' : row.isHidden !== undefined ? row.isHidden ? 'Oculto' : 'Visible' : '')} · {new Date(row.createdAt).toLocaleString('es-MX')}</p>
      {row.psychologist && <p>Profesional: {row.psychologist.user.name} · Categoría: {row.category?.name}</p>}
      {row.channel && <p>Canal: {row.channel.name} · Autor: {row.author?.name}</p>}
      {row.post && <p>Publicación: {row.post.title}</p>}
      {row.description && <p className="whitespace-pre-wrap">{row.description}</p>}
      {row.content && <details><summary>Ver contenido completo</summary><p className="whitespace-pre-wrap">{row.content}</p></details>}
      {row.action && <><p>Responsable: {row.user?.name ?? 'Sistema'}</p><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(row.details, null, 2)}</pre></>}
      {row.media?.map((media, index) => <button key={media.url} className="block underline" onClick={() => {
        if (media.url.startsWith('/uploads/')) void openProtectedMedia(media.url).catch(failure => setError(message(failure)));
        else { try { const url = new URL(media.url); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Enlace no permitido'); if (confirm(`Abrir recurso externo de ${url.host}?`)) window.open(url.href, '_blank', 'noopener,noreferrer'); } catch (failure) { setError(message(failure)); } }
      }}>Adjunto {index + 1}: {media.caption ?? 'Abrir'}</button>)}
      <div className="flex flex-wrap gap-2">
        {resource === 'categories' && canEditCategory && <button disabled={busy} className={input} onClick={() => { setEditing(row.id); setName(row.name!); setSlug(row.slug!); setDescription(row.description ?? ''); setActive(row.isActive!); }}>Editar / activar o desactivar</button>}
        {resource === 'channels' && <button className={input} onClick={() => navigate('posts', { channelId: row.id })}>Ver publicaciones ({row._count?.posts ?? 0})</button>}
        {resource === 'posts' && <button className={input} onClick={() => navigate('comments', { postId: row.id })}>Ver comentarios</button>}
        {(['channels', 'comments'].includes(resource) || resource === 'posts' && ['PUBLISHED', 'HIDDEN'].includes(row.status!)) && <button disabled={busy || reason.trim().length < 3} className={input} onClick={() => void run(() => moderate(row))}>{resource === 'channels' ? row.isActive ? 'Desactivar canal' : 'Activar canal' : row.status === 'HIDDEN' || row.isHidden ? 'Reactivar contenido' : 'Ocultar contenido'}</button>}
      </div>
    </article>)}
    {cursor && <button disabled={busy} className={input} onClick={() => void run(() => load(applied, cursor))}>Cargar más</button>}
  </div>;
}
