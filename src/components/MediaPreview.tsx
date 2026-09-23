import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { openProtectedMedia } from '../services/adminService';

export function MediaPreview() {
  const [media, setMedia] = useState<{ url: string; path: string } | null>(null);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ url: string; path: string }>).detail;
      try {
        const origin = new URL(api.defaults.baseURL!, window.location.origin).origin;
        const url = new URL(detail.url);
        if (url.origin !== origin || url.pathname !== detail.path || !/^\/uploads\/(support|community)\/[a-f0-9-]{36}\.(png|jpg|jpeg|gif|webp|pdf)$/.test(detail.path)) return;
        setError(''); setMedia(detail); dialog.current?.showModal();
      } catch { /* Ignore malformed events. */ }
    };
    window.addEventListener('admin-media-preview', open);
    return () => window.removeEventListener('admin-media-preview', open);
  }, []);
  return <dialog ref={dialog} aria-labelledby="media-preview-title" className="rounded-xl p-5 max-w-3xl w-[90vw] backdrop:bg-black/60" onClose={() => { setMedia(null); setError(''); }}>
    <div className="flex justify-between gap-4"><h2 id="media-preview-title" className="font-bold">Adjunto protegido</h2><button autoFocus onClick={() => dialog.current?.close()} className="border rounded px-3 py-1">Cerrar adjunto</button></div>
    {media && <div className="space-y-3 mt-3">
      {media.path.endsWith('.pdf') ? <p>Documento PDF. Usa el enlace para descargarlo.</p> : <img src={media.url} alt="Vista previa del adjunto autorizado" className="max-h-[65vh] max-w-full mx-auto" onError={() => setError('No se pudo cargar la imagen; el enlace puede haber caducado.')} />}
      {error && <p role="alert">{error}</p>}
      <p>Acceso temporal de 60 segundos. No compartas este enlace.</p>
      <a className="underline mr-4" href={media.url} download rel="noreferrer">Descargar adjunto</a>
      <button className="border rounded px-3 py-1" onClick={() => void openProtectedMedia(media.path).catch(() => setError('No se pudo renovar el acceso.'))}>Renovar enlace</button>
    </div>}
  </dialog>;
}
