import { memo } from 'react';
import { Loader2 } from 'lucide-react';

const QRIcon = ({ size = 40, color = '#f97316' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top-left square */}
    <rect x="5" y="5" width="38" height="38" rx="4" fill={color}/>
    <rect x="13" y="13" width="22" height="22" rx="2" fill="white"/>
    <rect x="19" y="19" width="10" height="10" fill={color}/>
    {/* Top-right square */}
    <rect x="57" y="5" width="38" height="38" rx="4" fill={color}/>
    <rect x="65" y="13" width="22" height="22" rx="2" fill="white"/>
    <rect x="71" y="19" width="10" height="10" fill={color}/>
    {/* Bottom-left square */}
    <rect x="5" y="57" width="38" height="38" rx="4" fill={color}/>
    <rect x="13" y="65" width="22" height="22" rx="2" fill="white"/>
    <rect x="19" y="71" width="10" height="10" fill={color}/>
    {/* Data dots - right bottom area */}
    <rect x="57" y="57" width="10" height="10" rx="1" fill={color}/>
    <rect x="71" y="57" width="10" height="10" rx="1" fill={color}/>
    <rect x="85" y="57" width="10" height="10" rx="1" fill={color}/>
    <rect x="57" y="71" width="10" height="10" rx="1" fill={color}/>
    <rect x="85" y="71" width="10" height="10" rx="1" fill={color}/>
    <rect x="57" y="85" width="10" height="10" rx="1" fill={color}/>
    <rect x="71" y="85" width="10" height="10" rx="1" fill={color}/>
    <rect x="85" y="85" width="10" height="10" rx="1" fill={color}/>
    {/* Extra data dots */}
    <rect x="71" y="71" width="10" height="10" rx="1" fill={color}/>
  </svg>
);

const QRCodeCard = memo(({ 
  qrCode, 
  generatingQR, 
  timeLeft, 
  onGenerate, 
  onClose 
}) => {
  return (
    <div className="mb-20 animate-slideUp relative">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl px-6 pt-6 pb-24 text-center relative overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {qrCode && (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 hover:scale-110 z-10"
            aria-label="Cerrar QR"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl roboto-light text-white mb-2 drop-shadow-md">
            Código QR para Calificaciones
          </h3>
          <p className="text-white/90 text-sm md:text-base mb-3">
            Generá tu QR y recibí calificaciones en tiempo real
          </p>

          {!qrCode ? (
            <p className="text-white font-semibold text-base md:text-lg">
              {generatingQR ? 'Generando...' : 'Generar QR (Estará activo por 3 min)'}
            </p>
          ) : (
            <div className="animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              {qrCode.qrPngBase64 ? (
                <>
                  <div className="bg-white rounded-xl p-3 md:p-4 mb-3 mx-auto inline-block">
                    <img
                      src={`data:image/png;base64,${qrCode.qrPngBase64}`}
                      alt="QR Code"
                      className="mx-auto border-2 border-orange-200 rounded-lg w-full max-w-[240px] md:max-w-xs animate-pulseGlow"
                    />
                  </div>

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

                  <p className="text-white font-semibold text-base md:text-lg">
                    Generar nuevo QR
                  </p>
                </>
              ) : (
                <p className="text-white animate-shake">Error: No se pudo generar la imagen del QR</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
        <button
          onClick={onGenerate}
          disabled={generatingQR}
          className="w-24 h-24 rounded-full bg-white border-4 border-orange-500 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50"
        >
          {generatingQR ? (
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          ) : (
            <QRIcon size={44} color="#f97316" />
          )}
        </button>
      </div>
    </div>
  );
});

QRCodeCard.displayName = 'QRCodeCard';

export default QRCodeCard;