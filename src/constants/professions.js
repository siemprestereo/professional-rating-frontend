// src/constants/professions.js

export const PROFESSIONS = [
  { value: 'WAITER', label: 'Mozo/Camarero' },
  { value: 'ELECTRICIAN', label: 'Electricista' },
  { value: 'PAINTER', label: 'Pintor' },
  { value: 'HAIRDRESSER', label: 'Peluquero' },
  { value: 'PLUMBER', label: 'Plomero' },
  { value: 'CARPENTER', label: 'Carpintero' },
  { value: 'PILATES', label: 'Instructora de pilates' },
  { value: 'MECHANIC', label: 'Mecánico' },
  { value: 'CHEF', label: 'Chef' },
  { value: 'BARISTA', label: 'Barista' },
  { value: 'BARTENDER', label: 'Bartender' },
  { value: 'CLEANER', label: 'Personal de limpieza' },
  { value: 'GARDENER', label: 'Jardinero' },
  { value: 'DRIVER', label: 'Conductor' },
  { value: 'SECURITY', label: 'Seguridad' },
  { value: 'RECEPTIONIST', label: 'Recepcionista' },
  { value: 'OTHER', label: 'Otro' }
];

export const getProfessionLabel = (value) => {
  const profession = PROFESSIONS.find(p => p.value === value);
  return profession ? profession.label : value;
};