import { useState, useEffect } from 'react';

const GEOREF_BASE = 'https://apis.datos.gob.ar/georef/api';

const PROVINCIA_ID = {
  BUENOS_AIRES: '06',
  CABA: '02',
};

const BARRIOS_CABA = [
  'Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano',
  'Boedo', 'Caballito', 'Chacarita', 'Coghlan', 'Colegiales',
  'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal',
  'Liniers', 'Mataderos', 'Monte Castro', 'Montserrat', 'Nueva Pompeya',
  'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco',
  'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta',
  'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás', 'San Telmo',
  'Vélez Sársfield', 'Versalles', 'Villa Crespo', 'Villa del Parque',
  'Villa Devoto', 'Villa General Mitre', 'Villa Gorriti', 'Villa Lugano',
  'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real',
  'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza'
];

export function useGeoref() {
  const [provincias, setProvincias] = useState([]);
  const [segundoNivel, setSegundoNivel] = useState([]); // partidos, barrios o localidades
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingSegundoNivel, setLoadingSegundoNivel] = useState(false);

  useEffect(() => {
    setLoadingProvincias(true);
    fetch(`${GEOREF_BASE}/provincias?orden=nombre&campos=id,nombre&max=24`)
      .then(r => r.json())
      .then(data => setProvincias(data.provincias || []))
      .catch(() => setProvincias([]))
      .finally(() => setLoadingProvincias(false));
  }, []);

  const fetchSegundoNivel = (provinciaId) => {
    if (!provinciaId) {
      setSegundoNivel([]);
      return;
    }

    // CABA: hardcodeado
    if (provinciaId === PROVINCIA_ID.CABA) {
      setSegundoNivel(BARRIOS_CABA.map(nombre => ({ id: nombre, nombre })));
      return;
    }

    setLoadingSegundoNivel(true);

    // Buenos Aires: partidos (municipios)
    if (provinciaId === PROVINCIA_ID.BUENOS_AIRES) {
      fetch(`${GEOREF_BASE}/municipios?provincia=${provinciaId}&orden=nombre&campos=id,nombre&max=200`)
        .then(r => r.json())
        .then(data => setSegundoNivel(data.municipios || []))
        .catch(() => setSegundoNivel([]))
        .finally(() => setLoadingSegundoNivel(false));
      return;
    }

    // Resto: localidades
    fetch(`${GEOREF_BASE}/localidades?provincia=${provinciaId}&orden=nombre&campos=id,nombre&max=1000`)
      .then(r => r.json())
      .then(data => setSegundoNivel(data.localidades || []))
      .catch(() => setSegundoNivel([]))
      .finally(() => setLoadingSegundoNivel(false));
  };

  const getSegundoNivelLabel = (provinciaId) => {
    if (provinciaId === PROVINCIA_ID.CABA) return 'Barrio';
    if (provinciaId === PROVINCIA_ID.BUENOS_AIRES) return 'Partido';
    return 'Localidad';
  };

  return {
    provincias,
    segundoNivel,
    loadingProvincias,
    loadingSegundoNivel,
    fetchSegundoNivel,
    getSegundoNivelLabel,
    PROVINCIA_ID,
  };
}