import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

function HelpSupportModal({ onClose, professionalName }) {
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [supportSending, setSupportSending] = useState(false);

  const handleSend = async () => {
    setSupportSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/contact/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: supportMessage, senderName: professionalName })
      });
      if (res.ok) {
        setSupportSent(true);
        setSupportMessage('');
      }
    } finally {
      setSupportSending(false);
    }
  };

  const handleClose = () => {
    setSupportMessage('');
    setSupportSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={handleClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Ayuda y soporte</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-base font-bold text-gray-700">Preguntas frecuentes</h3>
          {[
            { q: '¿Cómo recibo calificaciones?', a: 'Compartí tu QR con tus clientes. Ellos lo escanean, inician sesión y pueden calificarte.' },
            { q: '¿Cómo genero mi QR?', a: 'Desde el panel principal, tocá el botón "Generar QR"' },
            { q: '¿Quién puede ver mi perfil?', a: 'Cualquier persona puede ver tu perfil público y tus calificaciones.' },
            { q: '¿Cómo edito mi CV?', a: 'Desde el menú superior o en la pantalla principal, ingresá a "Mi CV" -> "Editar CV" para agregar experiencia, educación y zonas de trabajo.' },
            { q: '¿Cómo cambio mi foto de perfil?', a: 'Tocá tu foto en "Mi perfil" para editarla.' },
            { q: '¿Puedo eliminar una calificación?', a: 'No podés eliminar calificaciones recibidas. Si creés que hay una calificación inapropiada, podés denunciarla y pasará a revisión.' },
          ].map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-800 text-sm mb-1">{item.q}</p>
              <p className="text-gray-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-600 text-sm mb-3">¿No encontraste lo que buscabas? Escribinos:</p>
          {supportSent ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-700 text-sm font-medium text-center">
              ¡Mensaje enviado! Te responderemos a tu email registrado.
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                placeholder="Describí tu consulta o problema..."
                rows={4}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
              <button
                disabled={supportSending || !supportMessage.trim()}
                onClick={handleSend}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:hover:scale-100"
              >
                {supportSending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
                Enviar mensaje
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpSupportModal;
