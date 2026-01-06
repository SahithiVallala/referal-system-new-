// Re-export the authenticated API instance from api/axios
// This ensures all API calls use the same instance with proper authentication
import api from '../api/axios';

export default api;
