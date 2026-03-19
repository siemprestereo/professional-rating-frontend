import { useState } from 'react';
import { X, MapPin, Briefcase, Calendar, MessageSquare, Flag, AlertTriangle, Clock } from 'lucide-react';
import { BACKEND_URL } from '../config';

const REPORT_REASONS = [
  { value: 'FAKE_REVIEW', label: 'Reseña falsa o fraudulenta' },
  { value: 'OFFENSIVE_CONTENT', label: 'Contenido ofensivo o inapropiado' },
  { value: 'WRONG_PERSON', label: 'No me conoce / persona equivocada' },
  { value: 'BLACKMAIL', label: 'Extorsión o amenaza' },
  { value: 'OTHER', label: 'Otro motivo' },
];

function RatingDetailModal({ rating, onClose, renderStars, canReport = false }) {
  const [view, setView] = useState('detail');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReport = async () => {
    if (!reason) {
      setError('Seleccioná un motivo para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/reports/ratings/${rating.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason, description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al enviar la denuncia');
      }

      setView('success');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl ring-4 ring-purple-200/50">

        {/* Header */}
        <div className={`sticky top-0 px-6 py-4 rounded-t-3xl bg-gradient-to-br ${
          view === 'report' ? 'from-orange-400 to-red-500' : 'from-blue-500 to-purple-600'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl roboto-light">
              {view === 'detail' && 'Detalle de Calificación'}
              {view === 'report' && 'Denunciar Calificación'}
              {view === 'success' && 'Denuncia Enviada'}
            </h2>
            <button onClick={onClose} className="text-white hover:scale-110 transition-transform">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── VISTA DETALLE ── */}
        {view === 'detail' && (
          <>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">{renderStars(rating.score)}</div>
                <p className="text-3xl font-bold text-gray-800">{rating.score}.0</p>
                {rating.hasPendingReport && (
                  <div className="flex justify-center mt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4" /> Calificación bajo revisión
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Calificado por</p>
                <p className="text-lg font-semibold text-gray-800">
                  {rating.clientName?.trim() || 'Anónimo'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lugar</p>
                    <p className="font-semibold text-base">{rating.businessName}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Posición</p>
                    <p className="font-semibold text-base">{rating.workplacePosition}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-semibold text-base">
                      {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {rating.comment ? (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="flex items-start mb-2">
                    <MessageSquare className="w-5 h-5 mr-2 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">Comentario</p>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-base">"{rating.comment}"</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm italic">Esta calificación no incluye comentarios</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform text-base"
              >
                Cerrar
              </button>
              {canReport && !rating.hasPendingReport && (
                <button
                  onClick={() => setView('report')}
                  className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 py-3 rounded-2xl hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <Flag className="w-4 h-4" />
                  Denunciar esta calificación
                </button>
              )}
            </div>
          </>
        )}

        {/* ── VISTA DENUNCIA ── */}
        {view === 'report' && (
          <>
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Revisaremos tu denuncia y tomaremos las medidas necesarias.
                  No se notificará al cliente que la denunciaste.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la denuncia <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="">Seleccioná un motivo...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción adicional{' '}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contanos más sobre el problema..."
                  maxLength={500}
                  rows={4}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={handleReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform text-base disabled:opacity-60 disabled:scale-100"
              >
                {loading ? 'Enviando...' : 'Confirmar denuncia'}
              </button>
              <button
                onClick={() => { setView('detail'); setError(''); setReason(''); setDescription(''); }}
                className="w-full text-gray-500 border border-gray-200 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* ── VISTA ÉXITO ── */}
        {view === 'success' && (
          <>
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Flag className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Denuncia recibida</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Revisaremos el caso a la brevedad. Si encontramos una violación a nuestras
                  políticas, tomaremos las medidas correspondientes.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform text-base"
              >
                Entendido
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default RatingDetailModal;