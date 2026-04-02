import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function PreviewCvPdf() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout') || 'clasico';
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const blobRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/api/cv/me/preview-pdf?layout=${layout}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setBlobUrl(url);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); };
  }, [layout]);

  const layoutNames = { clasico: 'Clásico', minimalista: 'Minimalista', ejecutivo: 'Ejecutivo' };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 flex-shrink-0">
        <p className="text-white font-semibold">
          Vista previa — {layoutNames[layout] || layout}
        </p>
        <button
          onClick={() => navigate('/generate-pdf')}
          className="text-white p-1"
          aria-label="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Cargando vista previa...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-white text-center">No se pudo cargar la vista previa.</p>
          </div>
        )}

        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            className="w-full h-full"
            title="Vista previa del CV"
          />
        )}
      </div>

      {/* Botón Volver siempre visible abajo */}
      <div className="bg-gray-900 px-4 py-4 flex-shrink-0">
        <button
          onClick={() => navigate('/generate-pdf')}
          className="w-full py-3 rounded-2xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default PreviewCvPdf;
