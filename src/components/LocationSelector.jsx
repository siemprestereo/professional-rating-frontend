import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useGeoref } from '../hooks/useGeoref';
import SearchableSelect from './SearchableSelect';

/**
 * Props:
 * - value: string con formato "Localidad, Provincia" (o "" si no hay)
 * - onChange: función que recibe el nuevo string "Localidad, Provincia"
 * - required: boolean
 * - focusColor: "purple" | "blue" | "green"
 */
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

  const initializedRef = useRef(false);

  const focusBorder = {
    purple: 'focus:border-purple-500',
    blue: 'focus:border-blue-500',
    green: 'focus:border-green-500',
  }[focusColor] || 'focus:border-purple-500';

  // Parsear value inicial al editar perfil
  useEffect(() => {
    if (initializedRef.current) return;
    if (!value || provincias.length === 0) return;

    const parts = value.split(', ');
    if (parts.length >= 2) {
      const provNombre = parts[parts.length - 1];
      const segNombre = parts.slice(0, parts.length - 1).join(', ');
      const found = provincias.find(
        p => p.nombre.toLowerCase() === provNombre.toLowerCase()
      );
      if (found) {
        initializedRef.current = true;
        setProvinciaId(found.id);
        setProvinciaNombre(found.nombre);
        setSegundoNivelNombre(segNombre);
        fetchSegundoNivel(found.id);
      }
    }
  }, [value, provincias]);

  const handleProvinciaChange = (e) => {
    const selectedId = e.target.value;
    const selectedProv = provincias.find(p => p.id === selectedId);
    setProvinciaId(selectedId);
    setProvinciaNombre(selectedProv?.nombre || '');
    setSegundoNivelNombre('');
    onChange('');
    fetchSegundoNivel(selectedId);
  };

  const handleSegundoNivelChange = (nombre) => {
    setSegundoNivelNombre(nombre);
    if (nombre && provinciaNombre) {
      onChange(`${nombre}, ${provinciaNombre}`);
    } else {
      onChange('');
    }
  };

  const segundoNivelLabel = getSegundoNivelLabel(provinciaId);

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
        </div>
      </div>

      {/* Partido / Barrio / Localidad */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-base">
          {segundoNivelLabel} {required && '*'}
        </label>
        <SearchableSelect
          options={segundoNivel}
          value={segundoNivelNombre}
          onChange={handleSegundoNivelChange}
          placeholder={!provinciaId ? 'Primero elegí una provincia' : `Seleccioná un ${segundoNivelLabel.toLowerCase()}`}
          searchPlaceholder={`Buscar ${segundoNivelLabel.toLowerCase()}...`}
          disabled={!provinciaId}
          loading={loadingSegundoNivel}
          focusColor={focusColor}
        />
      </div>
    </div>
  );
}

export default LocationSelector;