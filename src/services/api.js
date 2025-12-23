import axios from 'axios';

// ✅ Ahora usa rutas relativas (el proxy de Vite las redirige al backend)
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Configurar axios
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

// ========== QR ==========
export const resolveQR = async (code) => {
  const response = await apiClient.get(`/qr/resolve/${code}`);
  return response.data;
};

// ========== DEFAULT EXPORT ==========
export default {
  getCurrentUser,
  getProfessionalProfile,
  createRating,
  getProfessionalRatings,
  resolveQR
};