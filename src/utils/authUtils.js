/**
 * Utilidades centralizadas de autenticación
 * Usadas por ClientLogin y ProfessionalLogin
 */

import { BACKEND_URL } from '../config';

/**
 * ✅ Decodifica JWT de forma segura con soporte Unicode
 * @param {string} token - JWT token
 * @returns {object|null} - Payload decodificado o null si falla
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * ✅ Intercambia un código temporal OAuth por un JWT real
 * @param {string} code - Código temporal recibido en la URL
 * @returns {object|null} - { token, id, email, name, userType, ... } o null si falla
 */
export const exchangeOAuthCode = async (code) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error intercambiando código OAuth:', errorData.error || response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error de red al intercambiar código OAuth:', error);
    return null;
  }
};