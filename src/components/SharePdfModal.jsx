import { useState } from 'react';
import { X } from 'lucide-react';

const BASE_URL = 'https://www.calificalo.com.ar';

function SharePdfModal({ pdfBlob, professionalName, professionalId, onClose }) {
  const [sharing, setSharing] = useState(false);
  const [sharedNative, setSharedNative] = useState(false);
  const publicUrl = `${BASE_URL}/public-cv/${professionalId}`;

  const sanitize = (name) =>
    (name || 'Profesional')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  const handleNativeShare = async () => {
    if (!pdfBlob) return;
    setSharing(true);
    try {
      const file = new File([pdfBlob], `CV_${sanitize(professionalName)}.pdf`, { type: 'application/pdf' });
      await navigator.share({ files: [file], title: `CV de ${professionalName}` });
      setSharedNative(true);
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      setSharing(false);
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' &&
    !!navigator.share && !!navigator.canShare;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fadeIn p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Compartir PDF de tu CV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-3">
          {/* Web Share API — adjunta el archivo real */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              disabled={sharing || !pdfBlob}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
                sharedNative
                  ? 'border-green-400 bg-green-50'
                  : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400 active:scale-95'
              }`}
            >
              <span className="text-2xl">{sharedNative ? '✓' : '📤'}</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">
                  {sharing ? 'Preparando...' : sharedNative ? 'Compartido' : 'Compartir archivo PDF'}
                </p>
                <p className="text-xs text-gray-500">Abre WhatsApp, Gmail, Drive y más</p>
              </div>
            </button>
          )}

          <div className={canNativeShare ? 'pt-2 border-t border-gray-100' : ''}>
            {canNativeShare && (
              <p className="text-xs text-gray-400 mb-3 text-center">O compartí el link de tu CV público</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`¡Mirá mi CV profesional! ${publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:bg-green-50 hover:border-green-400 transition-all"
              >
                <svg className="w-9 h-9 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-xs mt-2 text-gray-600 font-semibold">WhatsApp</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent('Mi CV Profesional - Calificalo')}&body=${encodeURIComponent(`Te comparto mi CV profesional: ${publicUrl}`)}`}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <svg className="w-9 h-9 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-2 text-gray-600 font-semibold">Email</span>
              </a>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <p className="text-xs text-indigo-800">
              <strong>💡 Tip:</strong> Usá "Compartir archivo PDF" para enviar el PDF directamente. WhatsApp y Email comparten el link de tu CV público.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharePdfModal;
