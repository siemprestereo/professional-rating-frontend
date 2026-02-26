import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeoref } from '../hooks/useGeoref';

/**
 * Props:
 * - value: string con el formato "Localidad, Provincia" (o "" si no hay)
 * - onChange: función que recibe el nuevo string "Localidad, Provincia"
 * - className: clases adicionales para el wrapper
 * - required: boolean
 * - focusColor: "purple" | "blue" | "green" (default: "purple")
 */
function LocationSelector({ value = '', onChange, required = false, focusColor = 'purple' }) {
  const { provincias, localidades, loadingProvincias, loadingLocalidades, fetchLocalidades } = useGeoref();

  const [provinciaId, setProvinciaId] = useState('');
  const [provinciaNombre, setProvinciaNombre] = useState('');
  const [localidadNombre, setLocalidadNombre] = useState('');

  const focusClass = {
    purple: 'focus:border-purple-500',
    blue: 'focus:border-blue-500',
    green: 'focus:border-green-500',
  }[focusColor] || 'focus:border-purple-500';

  // Si hay un valor inicial (ej: al editar perfil), parsearlo
  useEffect(() => {
    if (value && provincias.length > 0 && !provinciaId) {
      // Formato esperado: "Localidad, Provincia"
      const parts = value.split(', ');
      if (parts.length >= 2) {
        const provNombre = parts[parts.length - 1];
        const locNombre = parts.slice(0, parts.length - 1).join(', ');
        const found = provincias.find(p =>
          p.nombre.toLowerCase() === provNombre.toLowerCase()
        );
        if (found) {
          setProvinciaId(found.id);
          setProvinciaNombre(found.nombre);
          setLocalidadNombre(locNombre);
          fetchLocalidades(found.id);
        }
      }
    }
  }, [value, provincias]);

  const handleProvinciaChange = (e) => {
    const selectedId = e.target.value;
    const selectedProv = provincias.find(p => p.id === selectedId);
    setProvinciaId(selectedId);
    setProvinciaNombre(selectedProv?.nombre || '');
    setLocalidadNombre('');
    onChange('');
    fetchLocalidades(selectedId);
  };

  const handleLocalidadChange = (e) => {
    const nombre = e.target.value;
    setLocalidadNombre(nombre);
    if (nombre && provinciaNombre) {
      onChange(`${nombre}, ${provinciaNombre}`);
    } else {
      onChange('');
    }
  };

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
            className={`w-full border-2 border-gray-200 rounded-2xl px-4 py-3 ${focusClass} focus:outline-none transition-all text-base disabled:opacity-50`}
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

      {/* Localidad */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-base">Localidad {required && '*'}</label>
        <div className="relative">
          <select
            value={localidadNombre}
            onChange={handleLocalidadChange}
            required={required}
            disabled={!provinciaId || loadingLocalidades}
            className={`w-full border-2 border-gray-200 rounded-2xl px-4 py-3 ${focusClass} focus:outline-none transition-all text-base disabled:opacity-50`}
          >
            <option value="">
              {!provinciaId
                ? 'Primero elegí una provincia'
                : loadingLocalidades
                  ? 'Cargando localidades...'
                  : 'Seleccioná una localidad'}
            </option>
            {localidades.map(l => (
              <option key={l.id} value={l.nombre}>{l.nombre}</option>
            ))}
          </select>
          {loadingLocalidades && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationSelector;