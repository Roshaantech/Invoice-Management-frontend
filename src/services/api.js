import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ---------- Invoices ----------
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoice/${id}`);
export const createInvoice = (data) => api.post('/invoice', data);
export const updateInvoice = (id, data) => api.put(`/invoice/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoice/${id}`);

// ---------- Public Invoice ----------
export const getPublicInvoice = (shareId) => api.get(`/public/invoice/${shareId}`);

export default api;