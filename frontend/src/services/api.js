/**
 * ============================================
 * API SERVICE - Centralized API Configuration
 * ============================================
 * 
 * This module provides a centralized configuration for all API calls.
 * It handles:
 * - Base URL configuration (dev/production)
 * - Axios instance with default settings
 * - Request interceptors for authentication
 * - Response interceptors for error handling
 * - API endpoint methods for each feature
 * 
 * Environment Variables (set in .env / .env.production):
 * - REACT_APP_API_URL: Base API URL (e.g., http://localhost:5000/api)
 * - REACT_APP_BACKEND_URL: Backend server URL for static files
 * 
 * @author Portfolio Admin
 */

import axios from 'axios';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
// These values automatically switch between development and production
// based on the .env and .env.production files
// In development: Uses localhost:5000
// In production: Uses the deployed backend URL

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// ============================================
// IMAGE URL HELPER
// ============================================
/**
 * Constructs the full URL for an image path
 * Handles both absolute URLs (http/https) and relative paths
 * 
 * @param {string} imagePath - The image path (can be relative or absolute)
 * @returns {string|null} Full image URL or null if no path provided
 * 
 * @example
 * getImageUrl('/uploads/images/project.jpg')
 * // Returns: 'http://localhost:5000/uploads/images/project.jpg' (dev)
 * // Returns: 'https://your-backend.com/uploads/images/project.jpg' (prod)
 * 
 * getImageUrl('https://external-cdn.com/image.jpg')
 * // Returns: 'https://external-cdn.com/image.jpg' (unchanged)
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
};

// ============================================
// AXIOS INSTANCE CREATION
// ============================================
// Create a custom axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
/**
 * Automatically attaches JWT token to all outgoing requests
 * Token is retrieved from localStorage if available
 */
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

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
/**
 * Handles global response errors
 * Automatically logs out user on 401 (Unauthorized) responses
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle authentication errors globally
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTHENTICATION API
// ============================================
/**
 * API methods for user authentication
 * - login: Authenticate user and receive JWT token
 * - register: Create new user account
 * - getMe: Get current authenticated user details
 * - updateDetails: Update user profile information
 * - updatePassword: Change user password
 */
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateDetails: (data) => api.put('/auth/updatedetails', data),
    updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// ============================================
// PROJECTS API
// ============================================
/**
 * CRUD operations for portfolio projects
 * Supports file uploads for project images/thumbnails
 */
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

// ============================================
// SKILLS API
// ============================================
/**
 * CRUD operations for technical skills
 * Supports bulk creation for efficiency
 */
export const skillsAPI = {
    getAll: (params) => api.get('/skills', { params }),
    getOne: (id) => api.get(`/skills/${id}`),
    create: (data) => api.post('/skills', data),
    bulkCreate: (skills) => api.post('/skills/bulk', { skills }),
    update: (id, data) => api.put(`/skills/${id}`, data),
    delete: (id) => api.delete(`/skills/${id}`)
};

// ============================================
// RESEARCH API
// ============================================
/**
 * CRUD operations for research papers/publications
 */
export const researchAPI = {
    getAll: (params) => api.get('/research', { params }),
    getOne: (id) => api.get(`/research/${id}`),
    create: (data) => api.post('/research', data),
    update: (id, data) => api.put(`/research/${id}`, data),
    delete: (id) => api.delete(`/research/${id}`),
    toggleFeatured: (id) => api.put(`/research/${id}/featured`)
};

// ============================================
// SETTINGS API
// ============================================
/**
 * Profile settings and configuration
 * Includes profile image upload functionality
 */
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    uploadProfileImage: (formData) => api.put('/settings/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// ============================================
// ACHIEVEMENTS API
// ============================================
/**
 * CRUD operations for achievements and certifications
 * Supports file uploads for achievement images
 */
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

// ============================================
// CATEGORIES API
// ============================================
/**
 * CRUD operations for project/achievement categories
 * Used for filtering and organizing content
 */
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

// ============================================
// BLOGS API
// ============================================
/**
 * CRUD operations for blog posts
 * Supports cover image uploads and tag management
 */
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

// ============================================
// INTERESTS API
// ============================================
/**
 * CRUD operations for personal interests section
 * Displays hobbies and non-professional interests
 */
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

// ============================================
// CURRENT WORK API
// ============================================
/**
 * CRUD operations for "Currently Working On" section
 * Shows ongoing projects with progress tracking
 */
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

// ============================================
// DEFAULT EXPORT
// ============================================
// Export the configured axios instance for custom API calls
export default api;
