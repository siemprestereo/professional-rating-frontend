import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';

/**
 * Props:
 * - options: array de { id, nombre }
 * - value: string con el nombre seleccionado
 * - onChange: función que recibe el nombre seleccionado
 * - placeholder: texto cuando no hay nada seleccionado
 * - searchPlaceholder: texto del input de búsqueda
 * - disabled: boolean
 * - loading: boolean
 * - focusColor: "purple" | "blue" | "green"
 */
function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Seleccioná una opción',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  loading = false,
  focusColor = 'purple'
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const accentBg = {
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
  }[focusColor] || 'bg-purple-50';

  const accentText = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  }[focusColor] || 'text-purple-600';

  const focusBorder = {
    purple: 'focus:border-purple-500',
    blue: 'focus:border-blue-500',
    green: 'focus:border-green-500',
  }[focusColor] || 'focus:border-purple-500';

  const activeBorder = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
  }[focusColor] || 'border-purple-500';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleToggle = () => {
    if (disabled || loading) return;
    setOpen(prev => !prev);
    setSearch('');
  };

  const handleSelect = (nombre) => {
    onChange(nombre);
    setOpen(false);
    setSearch('');
  };

  const filtered = options.filter(opt =>
    opt.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Botón principal */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`w-full border-2 rounded-2xl px-4 py-3 text-left transition-all text-base flex items-center justify-between
          ${disabled || loading ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white cursor-pointer hover:border-gray-300'}
          ${open ? activeBorder : ''}
          ${value ? 'text-gray-800' : 'text-gray-400'}
        `}
      >
        <span className="truncate">{value || placeholder}</span>
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
          : <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Input búsqueda */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none ${focusBorder} transition-all`}
              />
            </div>
          </div>

          {/* Lista */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <li
                  key={opt.id}
                  onClick={() => handleSelect(opt.nombre)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                    ${opt.nombre === value
                      ? `${accentBg} ${accentText} font-semibold`
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {opt.nombre}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-gray-400 text-center">
                No se encontraron resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;