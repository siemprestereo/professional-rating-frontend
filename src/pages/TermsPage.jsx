import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Scale, ShieldCheck, Fingerprint } from 'lucide-react';

function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fadeIn">
      {/* Header Superior */}
      <header className="bg-gradient-to-br from-blue-600 to-purple-700 px-4 py-10 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-all mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Términos y Condiciones
              </h1>
              <p className="text-blue-100/80 text-sm mt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Versión 1.0 — Actualizado Marzo 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 space-y-10 text-gray-700 text-sm leading-relaxed border border-gray-100">
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
            <p className="text-blue-900 font-medium italic">
              El uso de la Plataforma implica la lectura, comprensión y aceptación total e incondicional de los presentes Términos y Condiciones. Si no está de acuerdo, le solicitamos abstenerse de utilizar el Servicio.
            </p>
          </div>

          {/* Sección 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-base">1</span>
              Partes y Definiciones
            </h2>
            <div className="space-y-4 pl-10">
              <p><span className="font-bold text-gray-800">1.1 Prestador:</span> El Servicio es provisto por CALIFICALO (<a href="https://calificalo.com.ar" className="text-blue-600 hover:underline">calificalo.com.ar</a>).</p>
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100">
                <p><span className="font-semibold text-gray-900 underline decoration-blue-200">Plataforma:</span> Web, subdominios, PWA e interfaces tecnológicas de Calificalo.</p>
                <p><span className="font-semibold text-gray-900 underline decoration-blue-200">Profesional:</span> Usuario registrado para recibir calificaciones.</p>
                <p><span className="font-semibold text-gray-900 underline decoration-blue-200">Score:</span> Indicador numérico calculado mediante algoritmos propietarios.</p>
              </div>
            </div>
          </section>

          {/* Sección 3 - El corazón del sistema (QR) */}
          <section className="relative overflow-hidden bg-purple-50 rounded-3xl p-6 border border-purple-100">
            <Fingerprint className="absolute -right-4 -bottom-4 w-32 h-32 text-purple-200/50 rotate-12" />
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2 relative">
              <span className="bg-purple-200 text-purple-700 w-8 h-8 rounded-lg flex items-center justify-center text-base">3</span>
              El Código QR y Consentimiento
            </h2>
            <div className="space-y-4 relative">
              <p className="text-purple-900/80">
                <span className="font-bold text-purple-900">3.2 Firma Electrónica:</span> Conforme a la <span className="underline decoration-purple-300">Ley N.º 25.506</span>, el acceso y envío del formulario mediante el escaneo del QR se considera equivalente a la firma electrónica del consentimiento informado.
              </p>
              <p className="text-purple-900/80">
                <span className="font-bold text-purple-900">3.3 Responsabilidad:</span> El Profesional es custodio de su QR. La inducción a calificaciones falsas resultará en la baja inmediata de la cuenta.
              </p>
            </div>
          </section>

          {/* Sección 5 - Algoritmo */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-base">5</span>
              Score de Reputación
            </h2>
            <div className="space-y-3 pl-10">
              <p>El Score es meramente referencial. El algoritmo de cálculo es <strong>propiedad intelectual exclusiva</strong> bajo la Ley N.º 11.723. Calificalo no garantiza que el Score sea utilizado por terceros como criterio de contratación.</p>
            </div>
          </section>

          {/* Sección 7 - Datos */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-base">7</span>
              Protección de Datos (Ley 25.326)
            </h2>
            <div className="grid md:grid-cols-2 gap-4 pl-10">
              <div className="border border-gray-200 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-2">Datos Recolectados</h4>
                <p className="text-xs text-gray-500 italic">Nombre, email, ubicación, IP y métricas de uso profesional.</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-2">Derechos ARCO</h4>
                <p className="text-xs text-gray-500 italic">Podés rectificar o suprimir tus datos mediante el panel de control o contacto oficial.</p>
              </div>
            </div>
          </section>

          {/* Sección 12 - Jurisdicción */}
          <section className="bg-gray-900 text-white p-6 rounded-2xl shadow-inner">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-400">
              <Scale className="w-5 h-5" />
              12. Legislación y Jurisdicción
            </h2>
            <p className="text-gray-300 text-xs">
              Sujeto a las leyes de la República Argentina. Controversias radicadas en los Tribunales Ordinarios de la CABA, respetando el domicilio del consumidor según Ley N.º 24.240.
            </p>
          </section>

          {/* Footer de la Página */}
          <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
              © 2026 CALIFICALO — TODOS LOS DERECHOS RESERVADOS <br />
              BUENOS AIRES, ARGENTINA
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;