import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Briefcase } from 'lucide-react';
import { PROFESSION_CATEGORIES, getProfessionLabel } from '../constants/professions';

/**
 * Props:
 * - value: string con el value de la profesión (ej: 'ELECTRICIAN')
 * - onChange: función que recibe el value seleccionado
 * - required: boolean
 * - focusColor: "purple" | "blue" | "green"
 * - placeholder: string
 */
function ProfessionSelector({
  value = '',
  onChange,
  required = false,
  focusColor = 'purple',
  placeholder = 'Seleccioná una profesión',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
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

  const accentBorder = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
  }[focusColor] || 'border-purple-500';

  const focusBorder = {
    purple: 'focus:border-purple-500',
    blue: 'focus:border-blue-500',
    green: 'focus:border-green-500',
  }[focusColor] || 'focus:border-purple-500';

  // Cerrar al hacer click afuera
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

  // Focus en búsqueda al abrir
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Al buscar, expandir automáticamente las categorías con resultados
  useEffect(() => {
    if (search.trim()) {
      const expanded = {};
      PROFESSION_CATEGORIES.forEach(cat => {
        const hasMatch = cat.professions.some(p =>
          p.label.toLowerCase().includes(search.toLowerCase())
        );
        if (hasMatch) expanded[cat.id] = true;
      });
      setExpandedCategories(expanded);
    }
  }, [search]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleSelect = (profValue) => {
    onChange(profValue);
    setOpen(false);
    setSearch('');
  };

  const handleToggle = () => {
    setOpen(prev => !prev);
    setSearch('');
  };

  // Filtrar categorías y profesiones según búsqueda
  const filteredCategories = PROFESSION_CATEGORIES
    .map(cat => ({
      ...cat,
      professions: search.trim()
        ? cat.professions.filter(p =>
            p.label.toLowerCase().includes(search.toLowerCase())
          )
        : cat.professions,
    }))
    .filter(cat => cat.professions.length > 0);

  const selectedLabel = value ? getProfessionLabel(value) : '';

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
        <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
        Profesión {required && '*'}
      </label>

      {/* Botón principal */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full border-2 rounded-2xl px-4 py-3 text-left transition-all text-base flex items-center justify-between bg-white
          ${open ? accentBorder : 'border-gray-200 hover:border-gray-300'}
          ${selectedLabel ? 'text-gray-800' : 'text-gray-400'}
        `}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* Búsqueda */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar profesión..."
                className={`w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none ${focusBorder} transition-all`}
              />
            </div>
          </div>

          {/* Lista con categorías */}
          <ul className="max-h-72 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <li key={cat.id}>
                  {/* Header de categoría */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
                  >
                    <span>{cat.label}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${expandedCategories[cat.id] ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Profesiones de la categoría */}
                  {expandedCategories[cat.id] && (
                    <ul>
                      {cat.professions.map(prof => (
                        <li
                          key={prof.value}
                          onClick={() => handleSelect(prof.value)}
                          className={`pl-8 pr-4 py-2.5 text-sm cursor-pointer transition-colors
                            ${prof.value === value
                              ? `${accentBg} ${accentText} font-semibold`
                              : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {prof.label}
                        </li>
                      ))}
                    </ul>
                  )}
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

export default ProfessionSelector;