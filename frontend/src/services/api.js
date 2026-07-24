import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de respuesta: así manejás errores en un solo lugar
api.interceptors.response.use(
    (response) => response.data,   // devuelve directo el data, sin tener que hacer .data en cada llamada
    (error) => {
        const mensaje = error.response?.data?.error || 'Error de conexión con el servidor';
        console.error('Error en la petición:', mensaje);
        return Promise.reject(new Error(mensaje));
    }
);