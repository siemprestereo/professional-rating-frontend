import { ArrowLeft, Loader2, ChevronLeft, ArrowLeftCircle, ChevronsLeft } from 'lucide-react';

function FontWeightTest() {
  const weights = [
    { class: 'font-light', name: 'Light (300)', value: 300 },
    { class: 'font-normal', name: 'Normal (400)', value: 400 },
    { class: 'font-medium', name: 'Medium (500)', value: 500 },
    { class: 'font-semibold', name: 'Semibold (600)', value: 600 },
    { class: 'font-bold', name: 'Bold (700) ← ACTUAL', value: 700 },
    { class: 'font-extrabold', name: 'Extrabold (800)', value: 800 },
  ];

  const backButtonOptions = [
    {
      name: 'Opción 1: Círculo pequeño con fondo translúcido',
      component: (
        <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 2: Círculo mediano con borde',
      component: (
        <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 3: Círculo grande más visible',
      component: (
        <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
          <ArrowLeft className="w-7 h-7 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 4: Cuadrado redondeado',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:scale-110">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 5: Fondo blanco con icono de color',
      component: (
        <button className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md">
          <ArrowLeft className="w-6 h-6 text-purple-600" />
        </button>
      )
    },
    {
      name: 'Opción 6: Sin fondo, solo icono grande',
      component: (
        <button className="p-2 hover:bg-white/20 rounded-full transition-all hover:scale-110">
          <ArrowLeft className="w-8 h-8 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 7: Chevron en lugar de flecha',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 8: Icono de flecha con círculo integrado',
      component: (
        <button className="hover:scale-110 transition-all">
          <ArrowLeftCircle className="w-12 h-12 text-white hover:text-white/80" />
        </button>
      )
    },
    {
      name: 'Opción 9: Doble chevron (más énfasis)',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
          <ChevronsLeft className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 10: Pill/Pastilla horizontal con flecha',
      component: (
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full flex items-center gap-2 transition-all hover:scale-105">
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-light">Atrás</span>
        </button>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Comparación de Font Weights y Botones
        </h1>

        {/* NUEVA SECCIÓN: Opciones de botones "Volver" */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Opciones de Botón "Volver" (Solo Flecha)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backButtonOptions.map((option, index) => (
              <div key={index} className="bg-white/20 rounded-2xl p-6">
                <p className="text-xs text-white/90 mb-4 text-center font-light h-12">
                  {option.name}
                </p>
                <div className="flex items-center justify-center h-20">
                  {option.component}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección 1: Textos de Carga */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Textos de "Cargando..."
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weights.map((weight) => (
              <div key={weight.value} className="bg-white/20 rounded-2xl p-6 text-center">
                <p className="text-xs text-white/70 mb-3">{weight.name}</p>
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
                  <p className={`text-white text-xl ${weight.class}`}>Cargando...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparación con diferentes estilos de botón */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Visualización en Navbar (mis favoritas)
          </h2>
          <div className="space-y-6">
            {/* Ejemplo con Opción 2 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <p className="text-white font-light">Opción 2: Círculo con borde</p>
              </nav>
            </div>

            {/* Ejemplo con Opción 5 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md">
                  <ArrowLeft className="w-6 h-6 text-purple-600" />
                </button>
                <p className="text-white font-light">Opción 5: Fondo blanco (más contraste)</p>
              </nav>
            </div>

            {/* Ejemplo con Opción 8 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="hover:scale-110 transition-all">
                  <ArrowLeftCircle className="w-12 h-12 text-white hover:text-white/80" />
                </button>
                <p className="text-white font-light">Opción 8: Icono integrado (más simple)</p>
              </nav>
            </div>
          </div>
        </div>

        {/* Botón para volver */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-lg"
          >
            Volver a la app.
          </button>
        </div>
      </div>
    </div>
  );
}

export default FontWeightTest;