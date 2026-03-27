import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
   timeout: 300000  // ✅ Timeout global de 5 minutos
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token:', token ? '✅ Existe' : '❌ No existe'); // ← Agrega esto
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data)
};


       export const guideAPI = {
        create: (data) => api.post('/guides', data),
        
        // ✅ AGREGAR AQUÍ (después de create, antes de createBulk)
        getSenders: () => api.get('/guides/senders'),
        
        createBulk: (formData) => 
          api.post('/guides/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }),
          
                    // ✅ MODIFICADO: Soportar FormData para upload de imágenes
                updateStatus: (id, data, config = {}) => {
                  // ✅ Si es FormData (para subir imagen), NO establecer Content-Type manualmente
                  if (data instanceof FormData) {
                    return api.put(`/guides/${id}/status`, data, {
                      ...config,
                      headers: {
                        ...config.headers
                        // ✅ IMPORTANTE: No establecer 'Content-Type' para FormData
                      }
                    });
                  }
                  
                  // ✅ Si no es FormData, usar JSON normal
                  return api.put(`/guides/${id}/status`, data, config);
                },
        
        getStatusHistory: (id) => api.get(`/guides/${id}/history`),
        getAll: (params) => api.get('/guides', { params }),
        getById: (id) => api.get(`/guides/${id}`),
        getByNumber: (number) => api.get(`/guides/number/${number}`),
        update: (id, data) => api.put(`/guides/${id}`, data),
        delete: (id) => api.delete(`/guides/${id}`),
        
        downloadPDF: (ids) =>
          api.post('/guides/download-pdf', { ids }, {
            responseType: 'blob',
            timeout: 300000,  // ✅ 5 minutos para PDFs grandes
            onDownloadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`📥 Descargando PDF: ${percentCompleted}%`);
            }
          }),
          
        getStatistics: () => api.get('/guides/stats')
      };
      
     /* export const guideAPI = {
        create: (data) => api.post('/guides', data),
        // ✅ AGREGAR AQUÍ (después de create, antes de createBulk)
        getSenders: () => api.get('/guides/senders'),
        createBulk: (formData) => 
          api.post('/guides/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }),
          // ✅ AGREGAR: Nuevos métodos para estado
        updateStatus: (id, data) => api.put(`/guides/${id}/status`, data),
        getStatusHistory: (id) => api.get(`/guides/${id}/history`),
        getAll: (params) => api.get('/guides', { params }),
        getById: (id) => api.get(`/guides/${id}`),
        getByNumber: (number) => api.get(`/guides/number/${number}`),
        update: (id, data) => api.put(`/guides/${id}`, data),
        delete: (id) => api.delete(`/guides/${id}`),
        
          /*downloadPDF: (ids) => 
          api.post('/guides/download-pdf', { ids }, {
            responseType: 'blob'
          }),
          getStatistics: () => api.get('/guides/stats')*/ /*
            downloadPDF: (ids) =>
            api.post('/guides/download-pdf', { ids }, {
              responseType: 'blob',
              timeout: 300000,  // ✅ 5 minutos para PDFs grandes
              onDownloadProgress: (progressEvent) => {
                // Opcional: mostrar progreso de descarga
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`📥 Descargando PDF: ${percentCompleted}%`);
              }
            }),
              getStatistics: () => api.get('/guides/stats')
      };*/

export const userAPI = {
  getAll: () => api.get('/auth/users'),
  getById: (id) => api.get(`/auth/users/${id}`),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
  delete: (id) => api.delete(`/auth/users/${id}`)
};

export const configAPI = {
  getGuideConfig: () => api.get('/config/guide'),
  updateGuideConfig: (data) => api.put('/config/guide', data),
  uploadLogo: (formData) =>
    api.post('/config/guide/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  resetGuideNumber: () => api.post('/config/guide/reset-number'),
  getSettings: () => api.get('/config/settings'),
  updateSetting: (data) => api.put('/config/settings', data)
};

export const senderAPI = {
  getAll: (params) => api.get('/senders', { params }),
  getById: (id) => api.get(`/senders/${id}`),
  create: (data) => api.post('/senders', data),
  update: (id, data) => api.put(`/senders/${id}`, data),
  delete: (id) => api.delete(`/senders/${id}`),
  getActive: () => api.get('/senders/active')
};

export default api;