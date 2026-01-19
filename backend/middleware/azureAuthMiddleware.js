/**
 * Azure AD Token Validation Middleware
 *
 * This middleware validates JWT tokens issued by Microsoft Entra ID (Azure AD).
 * It uses the JWKS (JSON Web Key Set) endpoint to verify token signatures.
 *
 * SETUP:
 * 1. Set AZURE_TENANT_ID in your .env file
 * 2. Set AZURE_CLIENT_ID in your .env file (optional, for audience validation)
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Azure AD Configuration
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || 'common';
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || '';

// JWKS client to fetch public keys from Azure AD
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

/**
 * Get the signing key from Azure AD's JWKS endpoint
 */
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error fetching signing key:', err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Validate Azure AD token and extract user information
 */
const validateAzureToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization header format' });
  }

  const token = parts[1];

  // Decode token without verification to check issuer
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  // Check if this is an Azure AD token (has expected claims)
  const payload = decoded.payload;
  const isAzureToken = payload.iss && (
    payload.iss.includes('login.microsoftonline.com') ||
    payload.iss.includes('sts.windows.net')
  );

  if (!isAzureToken) {
    return res.status(401).json({ message: 'Token is not from Azure AD' });
  }

  // Define verification options
  const verifyOptions = {
    algorithms: ['RS256'],
    // Azure AD v2.0 endpoint issuer format
    issuer: [
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`,
      `https://sts.windows.net/${AZURE_TENANT_ID}/`,
    ],
  };

  // Add audience validation if client ID is configured
  if (AZURE_CLIENT_ID) {
    verifyOptions.audience = AZURE_CLIENT_ID;
  }

  // Verify the token
  jwt.verify(token, getKey, verifyOptions, (err, decodedToken) => {
    if (err) {
      console.error('Token verification error:', err.message);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      return res.status(401).json({ message: 'Token verification failed' });
    }

    // Extract user information from the token
    req.user = {
      id: decodedToken.oid || decodedToken.sub, // Object ID or Subject
      name: decodedToken.name || 'Unknown',
      email: decodedToken.preferred_username || decodedToken.email || decodedToken.upn,
      tenantId: decodedToken.tid,
      // Map Azure AD roles/groups to application roles if needed
      role: 'user', // Default role, can be enhanced with Azure AD groups
      // Additional claims
      givenName: decodedToken.given_name,
      familyName: decodedToken.family_name,
    };

    next();
  });
};

/**
 * Optional middleware that allows requests without authentication
 * but attaches user info if a valid token is present
 */
const optionalAzureAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  validateAzureToken(req, res, (err) => {
    // If validation fails, continue without user info
    if (err) {
      return next();
    }
    next();
  });
};

/**
 * Combined middleware that validates both Azure AD tokens and local JWT tokens
 * This allows backward compatibility during migration
 */
const hybridAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Decode token to check its type
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const payload = decoded.payload;

  // Check if it's an Azure AD token
  const isAzureToken = payload.iss && (
    payload.iss.includes('login.microsoftonline.com') ||
    payload.iss.includes('sts.windows.net')
  );

  if (isAzureToken) {
    // Validate Azure AD token
    return validateAzureToken(req, res, next);
  } else {
    // Fall back to local JWT validation
    try {
      const localPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = localPayload; // contains id and role
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
};

module.exports = {
  validateAzureToken,
  optionalAzureAuth,
  hybridAuth,
};
