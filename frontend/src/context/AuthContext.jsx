import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest, graphConfig } from "../config/msalConfig";
import api from "../api/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Get the active account
  const activeAccount = accounts[0] || null;

  /**
   * Fetch user profile from Microsoft Graph API
   */
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  /**
   * Acquire access token silently
   */
  const acquireToken = useCallback(async () => {
    if (!activeAccount) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      // If silent acquisition fails, try interactive
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        return null;
      }
    }
  }, [instance, activeAccount]);

  /**
   * Initialize user session after authentication
   */
  const initializeUserSession = useCallback(async () => {
    if (!isAuthenticated || !activeAccount) {
      setUser(null);
      setAccessToken("");
      setLoading(false);
      return;
    }

    try {
      // Acquire access token
      const token = await acquireToken();
      if (!token) {
        throw new Error('Failed to acquire token');
      }
      setAccessToken(token);

      // Fetch user profile from Microsoft Graph
      const profile = await fetchUserProfile(token);

      // Build user object with Azure AD info
      const userInfo = {
        id: activeAccount.localAccountId,
        name: profile?.displayName || activeAccount.name || 'User',
        email: profile?.mail || profile?.userPrincipalName || activeAccount.username,
        tenantId: activeAccount.tenantId,
        // Default role - can be enhanced with Azure AD groups/roles
        role: 'user',
        // Additional profile info from Microsoft Graph
        jobTitle: profile?.jobTitle || null,
        department: profile?.department || null,
        officeLocation: profile?.officeLocation || null,
      };

      setUser(userInfo);

      // Store minimal session info in sessionStorage for quick access
      sessionStorage.setItem('msalUser', JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        tenantId: userInfo.tenantId,
      }));

    } catch (error) {
      console.error('Error initializing user session:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeAccount, acquireToken, fetchUserProfile]);

  /**
   * Login with Microsoft
   */
  const login = async () => {
    setAuthError(null);
    try {
      // Use redirect for better UX on mobile, popup for desktop
      await instance.loginPopup(loginRequest);
      // User session will be initialized by the useEffect
    } catch (error) {
      console.error('Login error:', error);
      // User cancelled the login or error occurred
      if (error.errorCode !== 'user_cancelled') {
        setAuthError(error.message || 'Login failed. Please try again.');
      }
      throw error;
    }
  };

  /**
   * Login with redirect (alternative method)
   */
  const loginWithRedirect = async () => {
    setAuthError(null);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login redirect error:', error);
      setAuthError(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  /**
   * Logout from Microsoft
   */
  const logout = async () => {
    try {
      // Clear local state
      setUser(null);
      setAccessToken("");
      sessionStorage.removeItem('msalUser');
      localStorage.clear();

      // Logout from Microsoft
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin + '/login',
        mainWindowRedirectUri: window.location.origin + '/login',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      window.location.href = '/login';
    }
  };

  /**
   * Logout with redirect (alternative method)
   */
  const logoutWithRedirect = async () => {
    try {
      setUser(null);
      setAccessToken("");
      sessionStorage.removeItem('msalUser');
      localStorage.clear();

      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + '/login',
      });
    } catch (error) {
      console.error('Logout redirect error:', error);
      window.location.href = '/login';
    }
  };

  /**
   * Refresh access token
   */
  const refreshAccessToken = async () => {
    const token = await acquireToken();
    if (token) {
      setAccessToken(token);
    }
    return token;
  };

  // Initialize session when authentication state changes
  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      initializeUserSession();
    }
  }, [inProgress, isAuthenticated, initializeUserSession]);

  // Add request interceptor to include token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        // Get fresh token for each request
        let token = accessToken;
        if (isAuthenticated && activeAccount) {
          try {
            const response = await instance.acquireTokenSilent({
              ...loginRequest,
              account: activeAccount,
            });
            token = response.accessToken;
          } catch (error) {
            // Use existing token if silent acquisition fails
            console.warn('Token refresh failed, using existing token');
          }
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(requestInterceptor);
  }, [accessToken, isAuthenticated, activeAccount, instance]);

  // Add response interceptor to handle 401 errors
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 error and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = await refreshAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }

          // Redirect to login if token refresh fails
          await logout();
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(responseInterceptor);
  }, []);

  // Show loading spinner while checking auth status
  const isLoading = loading || inProgress !== InteractionStatus.None;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        loginWithRedirect,
        logout,
        logoutWithRedirect,
        refreshAccessToken,
        loading: isLoading,
        isAuthenticated,
        authError,
        // Expose MSAL instance for advanced use cases
        msalInstance: instance,
        accounts,
      }}
    >
      {isLoading ? (
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
