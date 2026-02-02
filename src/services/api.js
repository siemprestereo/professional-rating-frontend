import axios from 'axios';

const API_URL = 'https://professional-rating-backend-production.up.railway.app/api';

// Configurar axios
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ INTERCEPTOR: Agregar token JWT a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const getCurrentUser = async () => {
  const response = await apiClient.get('/');
  return response.data;
};

// ========== PROFESSIONALS ==========
export const getProfessionalProfile = async (professionalId) => {
  const response = await apiClient.get(`/cv/professional/${professionalId}`);
  return response.data;
};

// ========== RATINGS ==========
export const createRating = async (ratingData) => {
  const response = await apiClient.post(`/ratings`, ratingData);
  return response.data;
};

export const getProfessionalRatings = async (professionalId) => {
  const response = await apiClient.get(`/ratings/professional/${professionalId}`);
  return response.data;
};

// ✅ NUEVO: Actualizar rating
export const updateRating = async (ratingId, ratingData) => {
  const response = await apiClient.put(`/ratings/${ratingId}`, ratingData);
  return response.data;
};

// ✅ NUEVO: Eliminar rating
export const deleteRating = async (ratingId) => {
  const response = await apiClient.delete(`/ratings/${ratingId}`);
  return response.data;
};

// ✅ NUEVO: Obtener un rating específico por ID
export const getRatingById = async (ratingId) => {
  const response = await apiClient.get(`/ratings/${ratingId}`);
  return response.data;
};

// ========== QR ==========
export const resolveQR = async (code) => {
  const response = await apiClient.get(`/qr/resolve/${code}`);
  return response.data;
};

// ========== ROLE SWITCHING ==========
export const switchRole = async (newRole, professionType = null, professionalTitle = null) => {
  const response = await apiClient.post('/role/switch', {
    newRole,
    professionType,
    professionalTitle
  });
  return response.data;
};

export const getCurrentRole = async () => {
  const response = await apiClient.get('/role/current');
  return response.data;
};

// ========== DEFAULT EXPORT ==========
export default {
  getCurrentUser,
  getProfessionalProfile,
  createRating,
  updateRating,
  deleteRating,
  getRatingById,
  getProfessionalRatings,
  resolveQR,
  switchRole,
  getCurrentRole
};