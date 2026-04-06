import axios from 'axios';
import { BACKEND_URL } from '../config';

const API_URL = `${BACKEND_URL}/api`;

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

// ✅ INTERCEPTOR: Manejar errores 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido, redirigiendo al login...');
      
      const userType = localStorage.getItem('userType');
      
      // Limpiar todo el localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('client');
      localStorage.removeItem('professional');
      localStorage.removeItem('userType');
      localStorage.removeItem('redirectAfterLogin');
      
      // Redirigir según el tipo de usuario
      window.location.href = userType === 'PROFESSIONAL' ? '/professional-login' : '/client-login';
    }
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

export const updateRating = async (ratingId, ratingData) => {
  const response = await apiClient.put(`/ratings/${ratingId}`, ratingData);
  return response.data;
};

export const deleteRating = async (ratingId) => {
  const response = await apiClient.delete(`/ratings/${ratingId}`);
  return response.data;
};

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
// ✅ CORREGIDO: newRole coincide con el DTO del backend
export const switchRole = async (newRole, professionTypes = null, professionalTitle = null) => {
  const types = Array.isArray(professionTypes) ? professionTypes : (professionTypes ? [professionTypes] : []);
  const response = await apiClient.post('/role/switch', {
    newRole,  // ← CRÍTICO: debe ser "newRole", no "targetRole"
    professionTypes: types,
    professionType: types[0] || null,
    professionalTitle
  });
  return response.data;
};

export const getCurrentRole = async () => {
  const response = await apiClient.get('/role/current');
  return response.data;
};

export const suggestProfession = async (suggestion, professionalName) => {
  const response = await apiClient.post('/suggestions/profession', { suggestion, professionalName });
  return response.data;
};

// ========== BANNED WORDS (admin) ==========
export const getBannedWords = async () => {
  const response = await apiClient.get('/admin/banned-words');
  return response.data;
};

export const addBannedWord = async (word) => {
  const response = await apiClient.post('/admin/banned-words', { word });
  return response.data;
};

export const deleteBannedWord = async (id) => {
  await apiClient.delete(`/admin/banned-words/${id}`);
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