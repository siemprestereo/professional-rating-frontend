import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

function ShareModal({ professionalId, professionalName, onClose }) {
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  
  const publicUrl = `${window.location.origin}/public-cv/${professionalId}`;

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#5B21B6',
          light: '#FFFFFF'
        }
      });
      setQrImage(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `CV_${professionalName.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header - sticky en mobile */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 rounded-t-3xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Compartir CV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {qrImage && (
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg border-4 border-purple-200">
                <img 
                  src={qrImage} 
                  alt="QR Code del CV" 
                  className="w-48 h-48 sm:w-64 sm:h-64" 
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center">
                Escaneá este código para ver el CV
              </p>
              <button 
                onClick={handleDownloadQR} 
                className="mt-2 sm:mt-3 text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-semibold"
              >
                Descargar QR
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Link público del CV
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={publicUrl} 
                readOnly 
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600 bg-gray-50" 
              />
              <button 
                onClick={handleCopy} 
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-xs sm:text-sm text-green-600 mt-2 font-semibold">
                ✓ Link copiado al portapapeles
              </p>
            )}
          </div>

          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-semibold">
              Compartir en:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`¡Mirá el CV de ${professionalName}! ${publicUrl}`)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-500 transition-all"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-xs sm:text-sm mt-2 text-gray-600 font-semibold">WhatsApp</span>
              </a>

              <a 
                href={`mailto:?subject=${encodeURIComponent('Mi CV Profesional')}&body=${encodeURIComponent(`Te comparto mi CV: ${publicUrl}`)}`} 
                className="flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm mt-2 text-gray-600 font-semibold">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;