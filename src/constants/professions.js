export const PROFESSION_CATEGORIES = [
  {
    id: 'gastronomy',
    label: '🍽️ Gastronomía',
    professions: [
      { value: 'WAITER',     label: 'Mozo/Camarero' },
      { value: 'CHEF',       label: 'Chef/Cocinero' },
      { value: 'BARISTA',    label: 'Barista' },
      { value: 'BARTENDER',  label: 'Bartender' },
    ]
  },
  {
    id: 'maintenance',
    label: '🔧 Mantenimiento y oficios',
    professions: [
      { value: 'GENERAL_MAINTENANCE',        label: 'Mantenimiento general' },
      { value: 'ELECTRICIAN',                label: 'Electricista' },
      { value: 'PLUMBER',                    label: 'Plomero/a' },
      { value: 'PAINTER',                    label: 'Pintor/a' },
      { value: 'CARPENTER',                  label: 'Carpintero/a' },
      { value: 'AIR_CONDITIONING_TECHNICIAN',label: 'Instalador de A/A' },
      { value: 'CONSTRUCTION_WORKER',        label: 'Obrero de construcción' },
    ]
  },
  {
    id: 'beauty',
    label: '💆 Belleza y bienestar',
    professions: [
      { value: 'HAIRDRESSER', label: 'Peluquero/a' },
      { value: 'PILATES',     label: 'Instructor/a de Pilates' },
    ]
  },
  {
    id: 'home',
    label: '🏠 Hogar',
    professions: [
      { value: 'CLEANER',   label: 'Personal de limpieza' },
      { value: 'GARDENER',  label: 'Jardinero/a' },
    ]
  },
  {
    id: 'transport',
    label: '🚗 Transporte',
    professions: [
      { value: 'DRIVER',    label: 'Conductor' },
      { value: 'MECHANIC',  label: 'Mecánico/a' },
    ]
  },
  {
    id: 'services',
    label: '🔒 Servicios',
    professions: [
      { value: 'SECURITY',     label: 'Personal de seguridad' },
      { value: 'RECEPTIONIST', label: 'Recepcionista' },
    ]
  },
  {
    id: 'education',
    label: '📚 Educación',
    professions: [
      { value: 'TUTORING_GENERAL', label: 'Clases particulares (general)' },
      { value: 'MATH_TUTOR',       label: 'Docente de matemáticas' },
      { value: 'ENGLISH_TUTOR',    label: 'Docente de inglés' },
      { value: 'OTHER_TUTOR',      label: 'Docente de otras materias' },
    ]
  },
  {
    id: 'other',
    label: '🔵 Otro',
    professions: [
      { value: 'OTHER', label: 'Otro' },
    ]
  },
];

// Lista plana — para compatibilidad con el resto de la app
export const PROFESSIONS = PROFESSION_CATEGORIES.flatMap(cat => cat.professions);

export const getProfessionLabel = (value) => {
  const found = PROFESSIONS.find(p => p.value === value);
  return found ? found.label : value;
};