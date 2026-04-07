import { X, Search } from 'lucide-react';

function SearchComingSoonModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scaleIn shadow-2xl">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Próximamente</h2>
        <p className="text-gray-500 text-base mb-6">
          Esta función estará disponible muy pronto.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

export default SearchComingSoonModal;
