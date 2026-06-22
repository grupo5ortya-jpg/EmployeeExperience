import axios from 'axios';

export const apiClient = axios.create({
    baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:3002',
    withCredentials: true,   // send httpOnly cookie on every request
});

// Sesión vencida/inválida en cualquier llamada protegida -> limpiar el usuario en Redux.
// PrivateRoute ya redirige a /login solo con que `user` pase a null, así que no hace falta
// navegar manualmente acá. Import dinámico para evitar el ciclo apiClient -> store ->
// authSlice -> authService -> apiClient al cargar los módulos.
// Se excluye /auth/* porque un 401 ahí (ej. login con credenciales inválidas) es un error de
// formulario esperado, no una sesión vencida.
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const isAuthRoute = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRoute) {
            const { store } = await import('../store/store.js');
            const { clearUser } = await import('../store/authSlice.js');
            store.dispatch(clearUser());
        }
        return Promise.reject(error);
    },
);

export default apiClient;