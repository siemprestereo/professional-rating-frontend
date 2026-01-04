import { ArrowLeft, Loader2 } from 'lucide-react';

function FontWeightTest() {
  const weights = [
    { class: 'font-light', name: 'Light (300)', value: 300 },
    { class: 'font-normal', name: 'Normal (400)', value: 400 },
    { class: 'font-medium', name: 'Medium (500)', value: 500 },
    { class: 'font-semibold', name: 'Semibold (600)', value: 600 },
    { class: 'font-bold', name: 'Bold (700) ← ACTUAL', value: 700 },
    { class: 'font-extrabold', name: 'Extrabold (800)', value: 800 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Comparación de Font Weights
        </h1>

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

        {/* Sección 2: Botones "Volver" */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Botones "Volver al panel principal"
          </h2>
          <div className="space-y-4">
            {weights.map((weight) => (
              <div key={weight.value} className="bg-white/20 rounded-2xl p-6">
                <p className="text-xs text-white/70 mb-3 text-center">{weight.name}</p>
                <div className="flex items-center justify-center">
                  <div className={`text-xl text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 ${weight.class}`}>
                    <ArrowLeft className="w-5 h-5" />
                    Volver al panel principal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección 3: Comparación lado a lado de tu diseño actual */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Pantalla completa - Comparación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Versión actual (Bold) */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 border-4 border-yellow-400">
              <p className="text-center text-yellow-400 font-bold mb-4 text-sm">ACTUAL (Bold)</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl mb-6">
                <div className="text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Volver al panel principal
                </div>
              </nav>
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-xl">Cargando...</p>
              </div>
            </div>

            {/* Versión recomendada (Medium) */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 border-4 border-green-400">
              <p className="text-center text-green-400 font-bold mb-4 text-sm">RECOMENDADO (Medium)</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl mb-6">
                <div className="text-xl font-medium text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Volver al panel principal
                </div>
              </nav>
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-xl font-medium">Cargando...</p>
              </div>
            </div>

            {/* Versión Semibold */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 border-4 border-blue-400">
              <p className="text-center text-blue-400 font-bold mb-4 text-sm">ALTERNATIVA (Semibold)</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl mb-6">
                <div className="text-xl font-semibold text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Volver al panel principal
                </div>
              </nav>
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-xl font-semibold">Cargando...</p>
              </div>
            </div>

            {/* Versión Normal */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 border-4 border-purple-400">
              <p className="text-center text-purple-400 font-bold mb-4 text-sm">MÁS LIVIANO (Normal)</p>
              <nav className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl mb-6">
                <div className="text-xl font-normal text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Volver al panel principal
                </div>
              </nav>
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-xl font-normal">Cargando...</p>
              </div>
            </div>
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