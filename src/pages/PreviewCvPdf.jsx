import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { BACKEND_URL } from '../config';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function PreviewCvPdf() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout') || 'clasico';
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);
  const blobRef = useRef(null);

  const layoutNames = { clasico: 'Clásico', minimalista: 'Minimalista', ejecutivo: 'Ejecutivo' };

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

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setPageWidth(containerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 flex-shrink-0">
        <p className="text-white font-semibold text-sm">
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
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-800">
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
          <Document
            file={blobUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setError(true)}
            loading={
              <div className="flex items-center justify-center py-12">
                <p className="text-white">Cargando PDF...</p>
              </div>
            }
          >
            {numPages && Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="mb-2">
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        )}
      </div>

      {/* Botón Volver */}
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
