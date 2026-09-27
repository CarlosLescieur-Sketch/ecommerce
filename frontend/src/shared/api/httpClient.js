import axios from 'axios';

/**
 * Adaptador de red único y aislado. Todos los servicios de módulo
 * (auth, catalog, orders) pasan por aquí en lugar de llamar a axios
 * directamente, de modo que cambiar la base URL o agregar
 * interceptores (tokens, manejo de errores) se hace en un solo lugar.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const httpClient = axios.create({
  baseURL: API_URL,
  // Sin Content-Type fijo: axios pone "application/json" para objetos
  // normales y deja que el navegador arme el boundary de
  // "multipart/form-data" cuando el body es un FormData (subida de imagen).
});

// Raíz del backend sin el sufijo "/api", para armar URLs absolutas de
// archivos servidos estáticamente (ej. /uploads/producto-123.jpg).
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

export default httpClient;
