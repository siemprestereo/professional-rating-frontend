import { useState } from 'react';
import { ChevronDown, ChevronUp, X, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: '¿Qué pasa si tenés dos empleos?',
    a: 'Podés cargar ambos como activos marcando "Aún trabajo aquí" en cada uno. Cuando un cliente escanee tu QR, va a ver los dos y podrá elegir por cuál te está calificando.'
  },
  {
    q: '¿Cuántos trabajos activos puedo tener?',
    a: 'Hasta 3 simultáneamente. Si querés agregar uno más, primero desactivá uno de los existentes.'
  },
  {
    q: '¿Las calificaciones que recibo son anónimas?',
    a: 'El único dato que podrás ver del cliente que te calificó es su nombre, pero para registrarse en la plataforma tiene que tener un mail asociado a su cuenta.'
  },
  {
    q: '¿Un cliente puede calificarme más de una vez?',
    a: 'Sí, pero debe esperar 6 meses entre una calificación y la siguiente. Esto evita que una sola persona infle o baje tu puntaje artificialmente.'
  },
  {
    q: '¿Puedo editar un trabajo que ya tiene calificaciones?',
    a: 'El puesto y la empresa quedan bloqueados para mantener la integridad de las calificaciones. Sí podés editar las fechas, descripción y datos de referencia.'
  },
  {
    q: '¿Qué pasa con mis calificaciones si cambio de trabajo?',
    a: 'Te acompañan. Las calificaciones son tuyas, no del lugar donde trabajás.'
  },
  {
    q: '¿Cómo comparto mi CV con un empleador?',
    a: 'Desde tu CV podés tocar el botón "Compartir CV" y enviarlo por WhatsApp, mail o copiar el link. Cualquier persona a la que se lo compartas podrá verlo sin necesidad de registrarse.'
  },
  {
    q: '¿Para qué sirve el QR?',
    a: 'A través del QR que generás desde el panel principal (que tu cliente escanea con su cámara de fotos, sin necesidad de tener ninguna aplicación instalada) en segundos puede dejarte una calificación.'
  },
  {
    q: '¿Le sirve a mi empleador?',
    a: 'Sí. Tu empleador puede registrarse como cliente, guardar tu perfil en su lista de profesionales y comparar el desempeño de su equipo según las calificaciones recibidas. Una herramienta útil para reconocer a los mejores.'
  },
  {
    q: '¿Puedo agregar educación y capacitaciones?',
    a: 'Sí, desde la sección "Educación y capacitaciones" podés sumar títulos, cursos y cualquier formación relevante para tu perfil.'
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left gap-3 focus:outline-none"
      >
        <span className="text-gray-800 font-medium text-sm">{question}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-purple-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && <p className="text-gray-600 text-sm pb-3 leading-relaxed">{answer}</p>}
    </div>
  );
}

function ProfessionalFaqModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col animate-slideUp">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Preguntas frecuentes</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-2">
          {FAQS.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalFaqModal;
