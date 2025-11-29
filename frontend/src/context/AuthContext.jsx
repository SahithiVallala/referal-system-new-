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
    await api.post("/auth/logout");
    setUser(null);
    setAccessToken("");
  };

  // Fetch /me on load
  useEffect(() => {
    (async () => {
      const token = await refreshAccessToken();
      if (!token) return setLoading(false);

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Add request interceptor to include token
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(interceptor);
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