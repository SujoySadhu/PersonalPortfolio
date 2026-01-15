import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateDetails: (data) => api.put('/auth/updatedetails', data),
    updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// Projects API
export const projectsAPI = {
    getAll: (params) => api.get('/projects', { params }),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/projects/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/projects/${id}`),
    toggleFeatured: (id) => api.put(`/projects/${id}/featured`)
};

// Skills API
export const skillsAPI = {
    getAll: (params) => api.get('/skills', { params }),
    getOne: (id) => api.get(`/skills/${id}`),
    create: (data) => api.post('/skills', data),
    bulkCreate: (skills) => api.post('/skills/bulk', { skills }),
    update: (id, data) => api.put(`/skills/${id}`, data),
    delete: (id) => api.delete(`/skills/${id}`)
};

// Research API
export const researchAPI = {
    getAll: (params) => api.get('/research', { params }),
    getOne: (id) => api.get(`/research/${id}`),
    create: (data) => api.post('/research', data),
    update: (id, data) => api.put(`/research/${id}`, data),
    delete: (id) => api.delete(`/research/${id}`),
    toggleFeatured: (id) => api.put(`/research/${id}/featured`)
};

// Settings API
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    uploadProfileImage: (formData) => api.put('/settings/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Achievements API
export const achievementsAPI = {
    getAll: (params) => api.get('/achievements', { params }),
    getOne: (id) => api.get(`/achievements/${id}`),
    create: (data) => api.post('/achievements', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/achievements/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/achievements/${id}`),
    toggleFeatured: (id) => api.put(`/achievements/${id}/featured`)
};

// Categories API
export const categoriesAPI = {
    getAll: (params) => api.get('/categories', { params }),
    getBySection: (section) => api.get('/categories', { params: { section, active: 'true' } }),
    getOne: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    toggle: (id) => api.put(`/categories/${id}/toggle`),
    seed: () => api.post('/categories/seed')
};

// Blogs API
export const blogsAPI = {
    getAll: (params) => api.get('/blogs', { params }),
    getOne: (slug) => api.get(`/blogs/${slug}`),
    getTags: () => api.get('/blogs/tags'),
    create: (data) => api.post('/blogs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/blogs/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/blogs/${id}`),
    togglePublish: (id) => api.put(`/blogs/${id}/publish`),
    toggleFeatured: (id) => api.put(`/blogs/${id}/featured`)
};

// Interests API
export const interestsAPI = {
    getAll: (params) => api.get('/interests', { params }),
    getOne: (id) => api.get(`/interests/${id}`),
    create: (data) => api.post('/interests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/interests/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/interests/${id}`),
    toggle: (id) => api.put(`/interests/${id}/toggle`)
};

// Current Work API
export const currentWorkAPI = {
    getAll: (params) => api.get('/current-work', { params }),
    getOne: (id) => api.get(`/current-work/${id}`),
    create: (data) => api.post('/current-work', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/current-work/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/current-work/${id}`),
    toggleFeatured: (id) => api.put(`/current-work/${id}/featured`),
    updateProgress: (id, progress) => api.put(`/current-work/${id}/progress`, { progress })
};

export default api;
