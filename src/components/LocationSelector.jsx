import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search, ChevronDown } from 'lucide-react';
import { useGeoref } from '../hooks/useGeoref';

function LocationSelector({ value = '', onChange, required = false, focusColor = 'purple' }) {
  const {
    provincias,
    segundoNivel,
    loadingProvincias,
    loadingSegundoNivel,
    fetchSegundoNivel,
    getSegundoNivelLabel,
  } = useGeoref();

  const [provinciaId, setProvinciaId] = useState('');
  const [provinciaNombre, setProvinciaNombre] = useState('');
  const [segundoNivelNombre, setSegundoNivelNombre] = useState('');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const focusBorder = {
    purple: 'focus:border-purple-500',
    blue: 'focus:border-blue-500',
    green: 'focus:border-green-500',
  }[focusColor] || 'focus:border-purple-500';

  const accentColor = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  }[focusColor] || 'text-purple-600';

  const accentBg = {
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
  }[focusColor] || 'bg-purple-50';

  // Parsear value inicial al editar perfil
  useEffect(() => {
    if (value && provincias.length > 0 && !provinciaId) {
      const parts = value.split(', ');
      if (parts.length >= 2) {
        const provNombre = parts[parts.length - 1];
        const segNombre = parts.slice(0, parts.length - 1).join(', ');
        const found = provincias.find(
          p => p.nombre.toLowerCase() === provNombre.toLowerCase()
        );
        if (found) {
          setProvinciaId(found.id);
          setProvinciaNombre(found.nombre);
          setSegundoNivelNombre(segNombre);
          fetchSegundoNivel(found.id);
        }
      }
    }
  }, [value, provincias]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus en el input de búsqueda al abrir
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  const handleProvinciaChange = (e) => {
    const selectedId = e.target.value;
    const selectedProv = provincias.find(p => p.id === selectedId);
    setProvinciaId(selectedId);
    setProvinciaNombre(selectedProv?.nombre || '');
    setSegundoNivelNombre('');
    setSearchText('');
    setDropdownOpen(false);
    onChange('');
    fetchSegundoNivel(selectedId);
  };

  const handleSelectSegundoNivel = (nombre) => {
    setSegundoNivelNombre(nombre);
    setDropdownOpen(false);
    setSearchText('');
    if (nombre && provinciaNombre) {
      onChange(`${nombre}, ${provinciaNombre}`);
    } else {
      onChange('');
    }
  };

  const toggleDropdown = () => {
    if (!provinciaId || loadingSegundoNivel) return;
    setDropdownOpen(prev => !prev);
    setSearchText('');
  };

  const filteredItems = segundoNivel.filter(item =>
    item.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const segundoNivelLabel = getSegundoNivelLabel(provinciaId);

  const getPlaceholderBoton = () => {
    if (!provinciaId) return 'Primero elegí una provincia';
    if (loadingSegundoNivel) return `Cargando ${segundoNivelLabel.toLowerCase()}s...`;
    if (segundoNivelNombre) return segundoNivelNombre;
    return `Seleccioná un ${segundoNivelLabel.toLowerCase()}`;
  };

  const disabled = !provinciaId || loadingSegundoNivel;

  return (
    <div className="space-y-3">
      {/* Provincia */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          Provincia {required && '*'}
        </label>
        <div className="relative">
          <select
            value={provinciaId}
            onChange={handleProvinciaChange}
            required={required}
            disabled={loadingProvincias}
            className={`w-full border-2 border-gray-200 rounded-2xl px-4 py-3 ${focusBorder} focus:outline-none transition-all text-base disabled:opacity-50`}
          >
            <option value="">
              {loadingProvincias ? 'Cargando provincias...' : 'Seleccioná una provincia'}
            </option>
            {provincias.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          {loadingProvincias && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {/* Partido / Barrio / Localidad — dropdown custom con búsqueda */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-gray-700 font-semibold mb-2 text-base">
          {segundoNivelLabel} {required && '*'}
        </label>

        {/* Botón que simula el select */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`w-full border-2 rounded-2xl px-4 py-3 text-left transition-all text-base flex items-center justify-between
            ${disabled ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white cursor-pointer hover:border-gray-300'}
            ${dropdownOpen ? (focusBorder + ' outline-none') : ''}
            ${segundoNivelNombre ? 'text-gray-800' : 'text-gray-400'}
          `}
        >
          <span className="truncate">{getPlaceholderBoton()}</span>
          {loadingSegundoNivel
            ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
            : <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          }
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Input de búsqueda */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={`Buscar ${segundoNivelLabel.toLowerCase()}...`}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Lista filtrada */}
            <ul className="max-h-52 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <li
                    key={item.id}
                    onClick={() => handleSelectSegundoNivel(item.nombre)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${item.nombre === segundoNivelNombre
                        ? `${accentBg} ${accentColor} font-semibold`
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.nombre}
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
    </div>
  );
}

export default LocationSelector;