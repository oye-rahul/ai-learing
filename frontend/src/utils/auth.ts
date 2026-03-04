// Authentication utility functions for persistent login

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';
export const AUTH_REMEMBER_KEY = 'rememberMe';

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (token: string, user: any, rememberMe: boolean = true) => {
  if (rememberMe) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
  } else {
    // Use sessionStorage for temporary login
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get authentication token from storage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get user data from storage
 */
export const getAuthUser = (): any | null => {
  const userStr = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if user wants to be remembered
 */
export const isRememberMe = (): boolean => {
  return localStorage.getItem(AUTH_REMEMBER_KEY) === 'true';
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_REMEMBER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
