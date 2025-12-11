import axios from "axios";

// Use relative /api path (works for both unified and separate deployments)
const baseURL = process.env.NODE_ENV === 'production' 
  ? "/api"  // Same domain in production
  : "http://localhost:5001/api";  // Local backend in development

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export default api;