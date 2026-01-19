# Microsoft Entra ID (Azure AD) Authentication Setup Guide

This guide explains how to configure Microsoft Entra ID (formerly Azure AD) authentication for the Referral System application.

## Prerequisites

- Azure subscription with Microsoft Entra ID (Azure AD) access
- Admin access to your Azure AD tenant (or permissions to register applications)

## Step 1: Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** > **App registrations**
3. Click **New registration**
4. Fill in the registration form:
   - **Name**: `Referral System` (or your preferred name)
   - **Supported account types**: Select one of:
     - `Accounts in this organizational directory only` (Single tenant - recommended for company apps)
     - `Accounts in any organizational directory` (Multi-tenant)
   - **Redirect URI**:
     - Platform: `Single-page application (SPA)`
     - URL: `http://localhost:3000` (for development)
5. Click **Register**

## Step 2: Note Your Configuration Values

After registration, you'll see the **Overview** page. Note these values:

- **Application (client) ID**: Copy this value
- **Directory (tenant) ID**: Copy this value

## Step 3: Configure API Permissions (Optional)

If you need to access Microsoft Graph API for user profile data:

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. Click **Grant admin consent** (if you have admin permissions)

## Step 4: Configure the Frontend

### Option A: Using Environment Variables (Recommended)

1. Create a `.env` file in the `frontend` folder:

```env
REACT_APP_AZURE_TENANT_ID=your-tenant-id-here
REACT_APP_AZURE_CLIENT_ID=your-client-id-here
```

2. Replace the placeholder values with your actual Tenant ID and Client ID

### Option B: Direct Configuration

Edit `frontend/src/config/msalConfig.js`:

```javascript
const AZURE_AD_CONFIG = {
  TENANT_ID: 'your-tenant-id-here',
  CLIENT_ID: 'your-client-id-here',
};
```

## Step 5: Configure the Backend

1. Create or update the `.env` file in the `backend` folder:

```env
# Existing configuration
PORT=5001
JWT_ACCESS_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development

# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
```

## Step 6: Add Production Redirect URI

When deploying to production:

1. Go back to Azure Portal > App registrations > Your App
2. Go to **Authentication**
3. Under **Single-page application**, add your production URL:
   - Example: `https://your-domain.com`

## Testing the Integration

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend application:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000`
4. Click **Sign in with Microsoft**
5. Sign in with your company Microsoft account
6. You should be redirected to the dashboard after successful login

## Features Implemented

### Login/Logout
- Microsoft Sign-In button on the login page
- Popup-based authentication (with redirect fallback)
- Automatic session management

### User Identity Display
- User profile icon in the dashboard header (top-right)
- Shows user initials from Microsoft account name
- Dropdown menu displaying:
  - User name
  - User email
  - Job title (if available from Microsoft Graph)
  - Sign out button

### Route Protection
- All dashboard routes are protected
- Unauthenticated users are redirected to login page
- Session persists across browser refreshes (within the browser session)

### Token Management
- Access tokens are acquired silently when possible
- Automatic token refresh
- Secure token storage using sessionStorage

## Troubleshooting

### "AADSTS50011: The redirect URI is not valid"
- Ensure the redirect URI in Azure Portal matches exactly: `http://localhost:3000`
- For production, add the production URL to Azure Portal

### "AADSTS700016: Application not found"
- Verify the Client ID is correct
- Ensure the application is registered in the correct tenant

### "AADSTS65001: User needs to consent"
- The user needs to consent to the required permissions
- Or an admin needs to grant admin consent in Azure Portal

### Token validation fails on backend
- Ensure `AZURE_TENANT_ID` is set correctly in backend `.env`
- For multi-tenant apps, you may need to use `common` as the tenant ID

## Security Notes

- Access tokens are stored in sessionStorage (cleared when browser closes)
- Refresh tokens are managed by MSAL in sessionStorage
- The backend validates tokens using Azure AD's public keys (JWKS)
- No sensitive credentials are stored on the client side

## Additional Resources

- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure AD Token Validation](https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens)
