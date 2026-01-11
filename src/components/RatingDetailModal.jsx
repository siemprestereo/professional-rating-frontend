import { X, MapPin, Briefcase, Calendar, MessageSquare } from 'lucide-react';

function RatingDetailModal({ rating, onClose, renderStars }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-4 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Detalle de Calificación</h2>
            <button
              onClick={onClose}
              className="text-white hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Estrellas */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
              {renderStars(rating.score)}
            </div>
            <p className="text-3xl font-bold text-gray-800">{rating.score}.0</p>
          </div>

          {/* Cliente */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-600 mb-1">Calificado por</p>
            <p className="text-lg font-semibold text-gray-800">
              {rating.clientName?.trim() || 'Anónimo'}
            </p>
          </div>

          {/* Business */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Lugar</p>
                <p className="font-semibold">{rating.businessName}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Posición</p>
                <p className="font-semibold">{rating.workplacePosition}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">
                  {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Comentario */}
          {rating.comment && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="flex items-start mb-2">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">Comentario</p>
              </div>
              <p className="text-gray-800 leading-relaxed">
                "{rating.comment}"
              </p>
            </div>
          )}

          {!rating.comment && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm italic">
                Esta calificación no incluye comentarios
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingDetailModal;