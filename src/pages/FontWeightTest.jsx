import { ArrowLeft, Loader2, Home, House } from 'lucide-react';

function FontWeightTest() {
  const weights = [
    { class: 'font-light', name: 'Light (300)', value: 300 },
    { class: 'font-normal', name: 'Normal (400)', value: 400 },
    { class: 'font-medium', name: 'Medium (500)', value: 500 },
    { class: 'font-semibold', name: 'Semibold (600)', value: 600 },
    { class: 'font-bold', name: 'Bold (700) ← ACTUAL', value: 700 },
    { class: 'font-extrabold', name: 'Extrabold (800)', value: 800 },
  ];

  const homeButtonOptions = [
    {
      name: 'Opción 1: Home - Círculo pequeño translúcido',
      component: (
        <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
          <Home className="w-5 h-5 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 2: Home - Círculo mediano con borde',
      component: (
        <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
          <Home className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 3: Home - Círculo grande más visible',
      component: (
        <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
          <Home className="w-7 h-7 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 4: Home - Cuadrado redondeado',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:scale-110">
          <Home className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 5: Home - Fondo blanco con icono de color',
      component: (
        <button className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md">
          <Home className="w-6 h-6 text-purple-600" />
        </button>
      )
    },
    {
      name: 'Opción 6: Home - Sin fondo, solo icono grande',
      component: (
        <button className="p-2 hover:bg-white/20 rounded-full transition-all hover:scale-110">
          <Home className="w-8 h-8 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 7: House (variante) - Círculo con borde',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/30">
          <House className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 8: Home - Cuadrado con sombra',
      component: (
        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg">
          <Home className="w-6 h-6 text-white" />
        </button>
      )
    },
    {
      name: 'Opción 9: Home - Pill/Pastilla con texto',
      component: (
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full flex items-center gap-2 transition-all hover:scale-105">
          <Home className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-light">Inicio</span>
        </button>
      )
    },
    {
      name: 'Opción 10: Home - Fondo gradiente',
      component: (
        <button className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
          <Home className="w-6 h-6 text-white" />
        </button>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Comparación: Font Weights y Botones Home
        </h1>

        {/* SECCIÓN: Opciones de botones Home */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Opciones de Botón "Home" (Volver al Dashboard)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeButtonOptions.map((option, index) => (
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

        {/* Comparación en contexto de Navbar */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Visualización en Navbar (Mis Favoritas)
          </h2>
          <div className="space-y-6">
            {/* Navbar con Opción 2 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <p className="text-center text-white/70 text-xs mb-2">Opción 2 - Recomendada</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
                  <Home className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-white font-light text-lg">Editar Perfil</h2>
                <div className="w-12"></div> {/* Spacer para centrar título */}
              </nav>
            </div>

            {/* Navbar con Opción 5 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <p className="text-center text-white/70 text-xs mb-2">Opción 5 - Alto contraste</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md">
                  <Home className="w-6 h-6 text-purple-600" />
                </button>
                <h2 className="text-white font-light text-lg">Mi CV</h2>
                <div className="w-12"></div>
              </nav>
            </div>

            {/* Navbar con Opción 6 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <p className="text-center text-white/70 text-xs mb-2">Opción 6 - Minimalista</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="p-2 hover:bg-white/20 rounded-full transition-all hover:scale-110">
                  <Home className="w-8 h-8 text-white" />
                </button>
                <h2 className="text-white font-light text-lg">Estadísticas</h2>
                <div className="w-12"></div>
              </nav>
            </div>

            {/* Navbar con Opción 10 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 border-2 border-white/30">
              <p className="text-center text-white/70 text-xs mb-2">Opción 10 - Con gradiente</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl flex items-center justify-between">
                <button className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20">
                  <Home className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-white font-light text-lg">Mi Perfil</h2>
                <div className="w-12"></div>
              </nav>
            </div>
          </div>
        </div>

        {/* Sección de Textos de Carga con font-light destacado */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Textos de "Cargando..." - Tu selección: font-light
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weights.map((weight) => (
              <div 
                key={weight.value} 
                className={`rounded-2xl p-6 text-center ${weight.class === 'font-light' ? 'bg-green-500/30 border-2 border-green-400' : 'bg-white/20'}`}
              >
                <p className="text-xs text-white/70 mb-3">
                  {weight.name} {weight.class === 'font-light' && '✓ SELECCIONADO'}
                </p>
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
                  <p className={`text-white text-xl ${weight.class}`}>Cargando...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para volver */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-lg"
          >
            Volver a la app
          </button>
        </div>
      </div>
    </div>
  );
}

export default FontWeightTest;