import axios from 'axios';

// Use deployed backend URL for production, localhost for development
const getApiUrl = () => {
  // If running in production (deployed), use the deployed backend URL
  if (window.location.hostname !== 'localhost') {
    return 'https://referal-backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api';
  }
  // For local development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
};

const API = axios.create({ 
  baseURL: getApiUrl(),
  timeout: 30000, // 30 second timeout for slower container startup
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
