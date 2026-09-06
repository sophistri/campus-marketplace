import axios from 'axios';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly refresh cookie
});

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

// endpoints that should NEVER trigger an automatic refresh-and-retry,
// otherwise a failed refresh/login attempt loops back into itself
const AUTH_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/signup'];

function isAuthEndpoint(url = '') {
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const alreadyRetried = originalRequest?._retry;
    const isAuthCall = isAuthEndpoint(originalRequest?.url);

    if (status === 401 && !alreadyRetried && !isAuthCall) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${import.meta.env.VITE_API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
            .then((res) => {
              setAccessToken(res.data.accessToken);
              return res.data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // no forced redirect here — let the calling code (AuthContext) decide
        // what to do with an expired session, instead of hard-reloading the page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;