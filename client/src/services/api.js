import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the JWT auth token if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common error patterns globally (like session expiration)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or unauthorized, clear localStorage (only if they had token, to avoid infinite loops)
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let the application layer know or trigger a soft reload if required
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },
};

// Resume CRUD endpoints
export const resumeService = {
  createResume: async (resumeData) => {
    const response = await API.post('/resume', resumeData);
    return response.data;
  },
  getAllResumes: async () => {
    const response = await API.get('/resume');
    return response.data;
  },
  getResumeById: async (id) => {
    const response = await API.get(`/resume/${id}`);
    return response.data;
  },
  updateResume: async (id, resumeData) => {
    const response = await API.put(`/resume/${id}`, resumeData);
    return response.data;
  },
  rollbackVersion: async (id, versionNumber) => {
    const response = await API.post(`/resume/${id}/rollback`, { versionNumber });
    return response.data;
  },
  deleteResume: async (id) => {
    const response = await API.delete(`/resume/${id}`);
    return response.data;
  },
};

// ATS and Resume Intelligence endpoints
export const atsService = {
  analyze: async (formData) => {
    // Note: PDF upload is multipart/form-data
    const response = await API.post('/ats/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  aiRewrite: async (text, jobRoleContext) => {
    const response = await API.post('/ats/ai-rewrite', { text, jobRoleContext });
    return response.data;
  },
  parsePDFOnly: async (formData) => {
    const response = await API.post('/ats/parse-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default API;
