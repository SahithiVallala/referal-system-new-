import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Refresh token on page reload
  const refreshAccessToken = async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setUser(null);
      return null;
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      return data;
    } catch (error) {
      // Re-throw with better error message
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      throw { response: { data: { message } } };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setAccessToken("");
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login
    window.location.href = '/login';
  };

  // Fetch /me on load
  useEffect(() => {
    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        setLoading(false);
        // If no token and we're not on a public page, redirect to login
        const publicPaths = ['/login', '/register'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch {
        // If /me fails, redirect to login
        const publicPaths = ['/login', '/register'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      setLoading(false);
    })();
  }, []);

  // Add request interceptor to include token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(requestInterceptor);
  }, [accessToken]);

  // Add response interceptor to handle 401 errors
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 error and we have a token, try to refresh
        if (error.response?.status === 401 && accessToken && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = await refreshAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout and redirect
            setUser(null);
            setAccessToken("");
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // If still 401, logout and redirect
        if (error.response?.status === 401) {
          setUser(null);
          setAccessToken("");
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(responseInterceptor);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        accessToken, 
        login, 
        register, 
        logout, 
        refreshAccessToken,
        loading 
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};