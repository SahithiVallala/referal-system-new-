/**
 * Microsoft Entra ID (Azure AD) Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Azure Portal (https://portal.azure.com)
 * 2. Navigate to Microsoft Entra ID > App registrations
 * 3. Click "New registration"
 * 4. Set the redirect URI to: http://localhost:3000 (for development)
 * 5. After registration, copy the Application (client) ID and Directory (tenant) ID
 * 6. Replace the placeholder values below with your actual IDs
 *
 * For production, update the redirectUri to your production URL.
 */

// Azure AD Configuration - Replace with your actual values
const AZURE_AD_CONFIG = {
  // Your Azure AD Tenant ID (Directory ID)
  // Found in: Azure Portal > Microsoft Entra ID > Overview > Tenant ID
  TENANT_ID: process.env.REACT_APP_AZURE_TENANT_ID || 'YOUR_TENANT_ID_HERE',

  // Your Application (Client) ID
  // Found in: Azure Portal > App registrations > Your App > Application (client) ID
  CLIENT_ID: process.env.REACT_APP_AZURE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
};

/**
 * MSAL Configuration
 * https://github.com/AzureAD/microsoft-authentication-library-for-js
 */
export const msalConfig = {
  auth: {
    clientId: AZURE_AD_CONFIG.CLIENT_ID,
    // Use the specific tenant endpoint for single-tenant apps (company accounts only)
    authority: `https://login.microsoftonline.com/${AZURE_AD_CONFIG.TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin + '/login',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    // Use sessionStorage for better security (cleared when browser tab closes)
    cacheLocation: 'sessionStorage',
    // Set to true to store auth state in cookies for SSO across tabs
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: process.env.NODE_ENV === 'development' ? 3 : 0, // 3 = Info, 0 = Error only
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 0: console.error(message); break;
          case 1: console.warn(message); break;
          case 2: console.info(message); break;
          case 3: console.debug(message); break;
          default: break;
        }
      },
    },
  },
};

/**
 * Scopes for the Microsoft Graph API
 * Add additional scopes as needed for your application
 */
export const loginRequest = {
  scopes: [
    'openid',      // Required for authentication
    'profile',     // Access to user profile (name, etc.)
    'email',       // Access to user email
    'User.Read',   // Read user's basic profile from Microsoft Graph
  ],
};

/**
 * API scopes for backend authentication
 * If your backend validates Azure AD tokens, add your API scope here
 */
export const apiRequest = {
  scopes: [
    // Add your backend API scope if needed
    // Example: 'api://YOUR_CLIENT_ID/access_as_user'
  ],
};

/**
 * Microsoft Graph API endpoints
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphPhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
};

export default msalConfig;
