import axios from 'axios';

// Use environment variable for local development, fall back to /api for production
const getApiUrl = () => {
  // Check if we have a custom API URL (for local development)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // In unified container, nginx proxies /api/ to backend
  // Use relative path so it works in any environment
  return '/api';
};

const API = axios.create({ 
  baseURL: getApiUrl(),
  timeout: 60000, // 60 second timeout to handle Azure Container App cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export default API;
