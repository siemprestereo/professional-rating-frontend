import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fadeIn">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-white leading-tight">
                Términos y Condiciones
              </h1>
              <p className="text-white/70 text-sm mt-1">Marzo 2026 — República Argentina</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10 text-gray-700 text-sm leading-relaxed">
        
        <p className="text-gray-500 italic bg-gray-100 p-4 rounded-xl border-l-4 border-purple-400">
          El uso de la Plataforma implica la lectura, comprensión y aceptación total e incondicional de los presentes Términos y Condiciones. Si no está de acuerdo con alguna disposición, le solicitamos abstenerse de utilizar el Servicio.
        </p>

        {/* Sección 1 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">1.</span> Partes, Definiciones y Ámbito
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">1.1 Identificación del prestador</h3>
              <p>El Servicio es prestado por <strong>CALIFICALO</strong>, plataforma digital disponible en <a href="https://calificalo.com.ar" className="text-blue-600 underline">calificalo.com.ar</a>. Toda consulta o reclamo podrá ser dirigida a través de los canales habilitados.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1.2 Definiciones</h3>
              <ul className="space-y-2 pl-4 border-l-2 border-purple-100">
                <li><span className="font-medium text-gray-900">Plataforma:</span> el sitio web, sus subdominios, la PWA e interfaces tecnológicas.</li>
                <li><span className="font-medium text-gray-900">Servicio:</span> registro de perfiles, generación de QR, recepción de calificaciones y visualización del Score.</li>
                <li><span className="font-medium text-gray-900">Profesional:</span> Usuario que se registra para recibir calificaciones.</li>
                <li><span className="font-medium text-gray-900">Cliente:</span> Usuario que califica a un Profesional.</li>
                <li><span className="font-medium text-gray-900">Score de Reputación:</span> indicador numérico calculado por el algoritmo de Calificalo.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 2 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">2.</span> Registro y Responsabilidades
          </h2>
          <div className="grid gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="font-semibold text-gray-900">2.1 Capacidad:</span> Dirigido a mayores de 18 años con capacidad legal en Argentina.
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="font-semibold text-gray-900">2.2 Veracidad:</span> El Usuario debe proporcionar información real. Calificalo puede suspender cuentas con datos falsos.
            </div>
          </div>
        </section>

        {/* Sección 3 - QR */}
        <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">3. El Código QR y Aceptación</h2>
          <div className="space-y-3 text-blue-800">
            <p><span className="font-semibold">3.1 Firma Electrónica:</span> Conforme a la Ley N.º 25.506, el envío del formulario mediante el escaneo del QR se considera equivalente a la firma electrónica del consentimiento.</p>
            <p><span className="font-semibold">3.2 Uso del QR:</span> El Profesional es el único responsable de su código. Queda prohibida la inducción a calificaciones fraudulentas.</p>
          </div>
        </section>

        {/* El resto de las secciones seguirían este patrón visual... */}
        {/* Agregué un separador visual para el final */}
        
        <div className="pt-10 border-t border-gray-200">
          <section className="grid md:grid-cols-2 gap-8 text-xs text-gray-500">
            <div>
              <h4 className="font-bold uppercase mb-2">Legislación</h4>
              <p>Rige la Ley de Defensa del Consumidor N.º 24.240 y la Ley de Protección de Datos Personales N.º 25.326.</p>
            </div>
            <div className="md:text-right">
              <h4 className="font-bold uppercase mb-2">Contacto</h4>
              <p>Soporte técnico y legal: <br /> hola@calificalo.com.ar</p>
            </div>
          </section>

          <footer className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Versión 1.0 — Actualizado Marzo 2026 · © 2026 Calificalo
          </footer>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;