import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { BACKEND_URL } from '../config';

function AcceptTerms() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isLoggedIn = !!token;

  const needsAcceptance = () => {
    try {
      const key = userType === 'PROFESSIONAL' ? 'professional' : 'client';
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      return isLoggedIn && stored.termsAccepted === false;
    } catch {
      return false;
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/accept-terms`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al aceptar términos');

      const key = userType === 'PROFESSIONAL' ? 'professional' : 'client';
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({ ...stored, termsAccepted: true }));
      } catch { /* silencioso */ }

      if (userType === 'PROFESSIONAL') navigate('/professional-dashboard', { replace: true });
      else navigate('/client-dashboard', { replace: true });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={handleBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl roboto-light text-white">Términos y Condiciones</h1>
              <p className="text-white/80 text-sm">Marzo 2025 — República Argentina</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-gray-700 text-sm leading-relaxed">

        <p className="text-gray-500 italic">El uso de la Plataforma implica la lectura, comprensión y aceptación total e incondicional de los presentes Términos y Condiciones. Si no está de acuerdo con alguna disposición, le solicitamos abstenerse de utilizar el Servicio.</p>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">1. Partes, Definiciones y Ámbito de Aplicación</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">1.1 Identificación del prestador del servicio</span><br />El Servicio es prestado por CALIFICALO, plataforma digital disponible en calificalo.com.ar. Toda consulta, reclamo o notificación formal podrá ser dirigida a través de los canales de contacto habilitados en dicho sitio.</p>
            <div>
              <p className="font-semibold mb-2">1.2 Definiciones</p>
              <div className="space-y-1 pl-3 border-l-2 border-gray-200">
                <p><span className="font-medium">Plataforma:</span> el sitio web calificalo.com.ar, sus subdominios, la PWA y cualquier interfaz tecnológica que Calificalo ponga a disposición.</p>
                <p><span className="font-medium">Servicio:</span> el conjunto de funcionalidades ofrecidas, incluyendo registro de perfiles, generación de QR, recepción de calificaciones y visualización del Score de Reputación.</p>
                <p><span className="font-medium">Usuario:</span> toda persona que acceda o utilice la Plataforma.</p>
                <p><span className="font-medium">Profesional:</span> el Usuario que se registra para recibir calificaciones.</p>
                <p><span className="font-medium">Cliente:</span> el Usuario que califica a un Profesional.</p>
                <p><span className="font-medium">Código QR:</span> identificador gráfico único vinculado al perfil de un Profesional.</p>
                <p><span className="font-medium">Calificación:</span> evaluación de 1 a 5 estrellas y/o comentario escrito.</p>
                <p><span className="font-medium">Score de Reputación:</span> indicador numérico calculado automáticamente por el algoritmo propietario de Calificalo.</p>
                <p><span className="font-medium">Contenido Generado por el Usuario (CGU):</span> todo texto, imagen o dato que el Usuario publique en la Plataforma.</p>
              </div>
            </div>
            <p><span className="font-semibold">1.3 Ámbito de aplicación</span><br />Los presentes Términos rigen la relación entre Calificalo y todos los Usuarios. La utilización de la Plataforma importa la aceptación plena de estas condiciones y de la Política de Privacidad.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">2. Registro, Cuenta y Responsabilidades del Usuario</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">2.1 Capacidad para contratar</span><br />El Servicio está dirigido a personas mayores de 18 años o con capacidad legal suficiente conforme a la legislación argentina.</p>
            <p><span className="font-semibold">2.2 Proceso de registro</span><br />El Usuario acepta proporcionar información veraz, actualizada y completa. Calificalo se reserva el derecho de suspender o eliminar toda Cuenta cuya información resulte falsa, inexacta o incompleta.</p>
            <p><span className="font-semibold">2.3 Credenciales de acceso</span><br />El Usuario es el único responsable de la confidencialidad de sus credenciales. Cualquier actividad realizada desde su Cuenta será imputable al titular.</p>
            <p><span className="font-semibold">2.4 Prohibiciones generales</span><br />Queda expresamente prohibido: suplantar identidades; publicar Calificaciones falsas o fraudulentas; usar bots o scripts sin autorización; intentar vulnerar la seguridad de la Plataforma; reproducir contenido sin autorización; realizar actos que dañen la Plataforma o sus servidores.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">3. El Código QR como Mecanismo de Aceptación de Términos</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">3.1 Naturaleza del Código QR</span><br />El Código QR es único, personal e intransferible, y tiene una vigencia limitada determinada por la Plataforma. Calificalo no se responsabiliza por intentos de escaneo de códigos expirados.</p>
            <p><span className="font-semibold">3.2 Aceptación de los Términos por parte del Cliente</span><br />Al completar y enviar el formulario de Calificación, el Cliente declara haber leído y aceptado los presentes Términos, confirma que la Calificación responde a una experiencia real y consiente el tratamiento de sus datos personales. El acceso al formulario se considera equivalente a la firma electrónica del consentimiento informado conforme a la Ley N.º 25.506.</p>
            <p><span className="font-semibold">3.3 Responsabilidad sobre el uso del Código QR</span><br />El Profesional es exclusivamente responsable del uso de su Código QR. Queda prohibido inducir a Calificaciones falsas o reproducir el código en contextos que puedan inducir a error sobre su naturaleza.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">4. Calificaciones y Responsabilidad Limitada de Calificalo</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">4.1 Naturaleza intermediaria</span><br />Calificalo actúa exclusivamente como intermediario tecnológico entre Clientes y Profesionales. No crea, verifica, modifica ni avala el contenido de las Calificaciones.</p>
            <p><span className="font-semibold">4.2 Limitación de responsabilidad</span><br />En la mayor medida permitida por la legislación argentina, Calificalo no será responsable por la veracidad de las Calificaciones ni por los perjuicios que pudieran derivarse para el Profesional o terceros. El Profesional podrá ejercer las acciones legales correspondientes directamente contra el autor del contenido.</p>
            <p><span className="font-semibold">4.3 Moderación de contenido</span><br />Calificalo podrá eliminar o moderar Calificaciones que contengan lenguaje ofensivo, información sensible de terceros, publicidad encubierta o que infrinjan derechos de terceros o normativa vigente.</p>
            <p><span className="font-semibold">4.4 Procedimiento de denuncia</span><br />El Profesional podrá reportar Calificaciones que vulneren sus derechos a través del mecanismo habilitado en su panel de control. Calificalo analizará la denuncia en un plazo razonable y notificará el resultado.</p>
            <p><span className="font-semibold">4.5 Perfiles duplicados y fraude reputacional</span><br />Calificalo se reserva el derecho de eliminar Cuentas que manipulen el Score de Reputación. Queda prohibida la solicitud o incentivación de Calificaciones falsas.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">5. Score de Reputación</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">5.1 Naturaleza del Score</span><br />El Score de Reputación es un indicador cuantitativo generado automáticamente con carácter meramente referencial e informativo.</p>
            <p><span className="font-semibold">5.2 Propiedad del algoritmo</span><br />El algoritmo de cálculo es propiedad intelectual exclusiva de Calificalo protegida por la Ley N.º 11.723. Calificalo podrá modificarlo en cualquier momento sin previo aviso.</p>
            <p><span className="font-semibold">5.3 Ausencia de garantía sobre el Score</span><br />Calificalo no garantiza la exactitud del Score ni que sea utilizado por terceros como criterio de contratación. El Score no constituye certificación de aptitud profesional ni garantía de calidad.</p>
            <p><span className="font-semibold">5.4 Impugnación del Score</span><br />El Profesional podrá solicitar revisión del Score aportando los elementos que estime pertinentes. Calificalo evaluará la solicitud sin obligación de modificarlo.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">6. Contenido Generado por el Usuario</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">6.1 Licencia otorgada a Calificalo</span><br />Al publicar contenido, el Usuario otorga a Calificalo una licencia no exclusiva, gratuita y mundial para usarlo en la prestación del Servicio.</p>
            <p><span className="font-semibold">6.2 Declaraciones del Usuario</span><br />El Usuario garantiza que el contenido publicado es veraz, no infringe derechos de terceros y no fue generado con fines de manipulación o publicidad encubierta.</p>
            <p><span className="font-semibold">6.3 Eliminación de contenido</span><br />El Usuario podrá solicitar la eliminación de su contenido en cualquier momento. La eliminación no afectará Calificaciones ya procesadas en el Score de Reputación.</p>
            <p><span className="font-semibold">6.4 Indemnidad</span><br />El Usuario mantendrá indemne a Calificalo frente a reclamos derivados de contenido publicado que infrinja estos Términos o derechos de terceros.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">7. Protección de Datos Personales</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">7.1 Marco normativo</span><br />El tratamiento de datos se rige por la Ley N.º 25.326 de Protección de los Datos Personales, el Decreto N.º 1558/2001 y las Disposiciones de la DNPDP.</p>
            <p><span className="font-semibold">7.2 Responsable del tratamiento</span><br />Calificalo es el responsable del banco de datos personales conforme al artículo 2 de la Ley N.º 25.326. Los datos son almacenados en servidores de infraestructura en la nube con medidas de seguridad adecuadas.</p>
            <p><span className="font-semibold">7.3 Datos recolectados</span><br />Nombre, email, datos profesionales, datos de uso (IP, dispositivo, navegador), Calificaciones emitidas y geolocalización (provincia/municipio).</p>
            <p><span className="font-semibold">7.4 Finalidad del tratamiento</span><br />Prestación del Servicio, cálculo del Score, comunicaciones operativas, mejora de la Plataforma y cumplimiento de obligaciones legales.</p>
            <p><span className="font-semibold">7.5 Derechos ARCO</span><br />El titular tiene derecho a acceder, rectificar, actualizar y suprimir sus datos (art. 14, Ley N.º 25.326). La DNPDP tiene atribución para atender denuncias relacionadas con el incumplimiento de la normativa. El ejercicio de estos derechos es gratuito y puede realizarse a través de los canales habilitados en calificalo.com.ar.</p>
            <p><span className="font-semibold">7.6 Transferencia internacional</span><br />Los datos no serán transferidos a países sin nivel adecuado de protección, salvo consentimiento expreso o cumplimiento de obligaciones legales.</p>
            <p><span className="font-semibold">7.7 Seguridad de la información</span><br />Calificalo adopta medidas técnicas razonables —incluyendo cifrado en tránsito y control de accesos— para proteger los datos. Ningún sistema es infalible; no se garantiza seguridad absoluta.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">8. Propiedad Intelectual</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">8.1 Titularidad de Calificalo</span><br />La Plataforma, su diseño, código fuente, bases de datos, logotipos, marcas y el algoritmo del Score son propiedad exclusiva de Calificalo, protegidos por la Ley N.º 11.723 y convenios internacionales.</p>
            <p><span className="font-semibold">8.2 Uso permitido</span><br />Se autoriza al Usuario a utilizar la Plataforma para los fines previstos en estos Términos. Cualquier uso no autorizado —incluyendo reproducción, distribución o ingeniería inversa— queda estrictamente prohibido.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">9. Modificaciones del Servicio y de los Términos</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">9.1 Modificación de los Términos</span><br />Calificalo podrá modificar estos Términos con aviso razonable mediante aviso en la Plataforma, correo electrónico o mensaje en el panel de control. La continuación en el uso del Servicio implicará aceptación de los nuevos Términos.</p>
            <p><span className="font-semibold">9.2 Modificación del Servicio</span><br />Calificalo podrá modificar, suspender o interrumpir el Servicio en cualquier momento, con o sin previo aviso, sin responsabilidad frente a los Usuarios.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">10. Suspensión y Terminación de la Cuenta</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">10.1 Por iniciativa del Usuario</span><br />El Usuario podrá eliminar su Cuenta en cualquier momento desde la configuración de su perfil. La eliminación no afectará Calificaciones ya publicadas ni el Score histórico de terceros.</p>
            <p><span className="font-semibold">10.2 Por iniciativa de Calificalo</span><br />Calificalo podrá suspender o eliminar Cuentas por incumplimiento de estos Términos, conducta perjudicial para otros Usuarios, inactividad prolongada, requerimiento de autoridad competente o cese de actividad de la Empresa.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">11. Responsabilidad y Garantías</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">11.1 Servicio prestado "tal como está"</span><br />La Plataforma se presta en su estado actual. Calificalo no garantiza que el Servicio sea ininterrumpido, libre de errores ni que los resultados sean precisos o confiables.</p>
            <p><span className="font-semibold">11.2 Limitación de responsabilidad</span><br />En la máxima medida permitida por la legislación argentina, Calificalo no será responsable por daños indirectos, incidentales, consecuentes o punitivos, incluyendo pérdida de ganancias, datos u oportunidades de negocio.</p>
            <p><span className="font-semibold">11.3 Relaciones entre Clientes y Profesionales</span><br />Calificalo no es parte de la relación contractual entre Cliente y Profesional. Toda controversia relativa a la prestación de servicios deberá resolverse directamente entre las partes. Calificalo no asume responsabilidad por la calidad, idoneidad ni legalidad de los servicios ofrecidos por los Profesionales.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">12. Legislación Aplicable y Jurisdicción</h2>
          <p>Los presentes Términos se rigen por las leyes de la República Argentina. Las controversias se someten a los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, sin perjuicio del derecho irrenunciable del consumidor de acudir ante los tribunales de su domicilio conforme a la Ley N.º 24.240 de Defensa del Consumidor.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">13. Disposiciones Finales</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">13.1 Divisibilidad</span><br />Si alguna disposición fuera declarada nula por autoridad competente, las demás continuarán en plena vigencia.</p>
            <p><span className="font-semibold">13.2 No renuncia</span><br />La omisión de ejercer un derecho no constituye renuncia al mismo.</p>
            <p><span className="font-semibold">13.3 Acuerdo completo</span><br />Estos Términos junto con la Política de Privacidad constituyen el acuerdo completo entre el Usuario y Calificalo en relación con el Servicio.</p>
            <p><span className="font-semibold">13.4 Contacto</span><br />Para consultas, reclamos o notificaciones, el Usuario podrá comunicarse a través de los canales habilitados en calificalo.com.ar.</p>
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
          Versión 1.0 — Marzo 2025 · © 2025 Calificalo — calificalo.com.ar — Todos los derechos reservados.
        </p>

        {/* Botón de aceptación — solo visible si está logueado y no aceptó aún */}
        {needsAcceptance() && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 shadow-lg">
            <p className="text-center text-gray-600 text-sm mb-3">
              Para continuar usando Calificalo necesitás aceptar los Términos y Condiciones
            </p>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all text-lg"
            >
              {loading
                ? <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" />Procesando...</span>
                : <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />Aceptar y continuar</span>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcceptTerms;