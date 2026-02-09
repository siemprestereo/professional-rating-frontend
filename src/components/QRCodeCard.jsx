import { memo } from 'react';
import { QrCode, Loader2 } from 'lucide-react';

const QRCodeCard = memo(({ 
  qrCode, 
  generatingQR, 
  timeLeft, 
  onGenerate, 
  onClose 
}) => {
  return (
    <div 
      className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-4 md:p-6 mb-4 animate-slideUp hover-lift relative overflow-hidden"
      onClick={(e) => {
        if (qrCode && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      
      <div className="relative z-10">
        {qrCode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute -top-1 -right-1 md:top-0 md:right-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar QR"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex items-center justify-center mb-2 md:mb-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 animate-pulse-slow">
            <QrCode className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl roboto-light text-white text-center mb-1 md:mb-2 drop-shadow-md px-2">
          🎯 Código QR para Calificaciones
        </h3>
        <p className="text-white/90 text-center text-sm md:text-base mb-3 md:mb-4 px-2">
          Generá tu QR y recibí calificaciones en tiempo real
        </p>
        
        {!qrCode ? (
          <button
            onClick={onGenerate}
            disabled={generatingQR}
            className="w-full bg-white text-orange-600 font-bold py-3 md:py-4 rounded-xl shadow-xl disabled:opacity-50 hover:scale-105 transition-all duration-300 ripple hover:shadow-2xl text-base md:text-lg"
          >
            {generatingQR ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" />
                Generando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 md:w-6 md:h-6" />
                Generar QR (Estará activo por 3 min)
              </span>
            )}
          </button>
        ) : (
          <div 
            className="text-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {qrCode.qrPngBase64 ? (
              <>
                <div className="bg-white rounded-xl p-3 md:p-4 mb-2 md:mb-3 mx-auto inline-block max-w-full">
                  <img
                    src={`data:image/png;base64,${qrCode.qrPngBase64}`}
                    alt="QR Code"
                    className="mx-auto border-2 border-orange-200 rounded-lg w-full max-w-[240px] md:max-w-xs animate-pulseGlow"
                  />
                </div>
                <p className="text-sm md:text-base text-white/90 mb-2 px-2">
                  <span className="font-semibold">Código:</span> {qrCode.code}
                </p>

                {timeLeft && !timeLeft.expired && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3 mx-auto max-w-xs">
                    <p className="text-white/90 text-sm mb-2 text-center">⏱️ Tiempo restante</p>
                    <div className="flex items-center justify-center">
                      <div className="bg-white rounded-lg px-4 py-2">
                        <span className={`text-2xl md:text-3xl font-bold ${
                          timeLeft.minutes === 0 && timeLeft.seconds <= 30 
                            ? 'text-red-600 animate-pulse' 
                            : 'text-orange-600'
                        }`}>
                          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={onGenerate}
                  className="bg-white text-orange-600 px-4 md:px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all duration-300 ripple shadow-lg text-sm md:text-base"
                >
                  Generar nuevo QR
                </button>
              </>
            ) : (
              <p className="text-white animate-shake">Error: No se pudo generar la imagen del QR</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

QRCodeCard.displayName = 'QRCodeCard';

export default QRCodeCard;