import { useState, useEffect } from 'react';

const GEOREF_BASE = 'https://apis.datos.gob.ar/georef/api';

export function useGeoref() {
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  useEffect(() => {
    setLoadingProvincias(true);
    fetch(`${GEOREF_BASE}/provincias?orden=nombre&campos=id,nombre&max=24`)
      .then(r => r.json())
      .then(data => setProvincias(data.provincias || []))
      .catch(() => setProvincias([]))
      .finally(() => setLoadingProvincias(false));
  }, []);

  const fetchLocalidades = (provinciaId) => {
    if (!provinciaId) { setLocalidades([]); return; }
    setLoadingLocalidades(true);
    fetch(`${GEOREF_BASE}/localidades?provincia=${provinciaId}&orden=nombre&campos=id,nombre&max=1000`)
      .then(r => r.json())
      .then(data => setLocalidades(data.localidades || []))
      .catch(() => setLocalidades([]))
      .finally(() => setLoadingLocalidades(false));
  };

  return { provincias, localidades, loadingProvincias, loadingLocalidades, fetchLocalidades };
}