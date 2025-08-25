import axios from "axios";
import store from "../store/store";
import { refreshToken, resetAuthState } from "../store/slice/authSlice";

// ✅ Create instance with base config
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ your backend base URL
  withCredentials: true, // ✅ send cookies (for refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      store.getState().auth.accessToken ||
      localStorage.getItem("SuperAdminToken");

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptors for auto token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  console.log("Processing queued requests:", failedQueue.length);
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/refresh-token-superadmin")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await store.dispatch(refreshToken()).unwrap();
        const token = response.accessToken;

        // Update the default headers and original request
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        originalRequest.headers["Authorization"] = `Bearer ${token}`;

        // Process queued requests with new token
        processQueue(null, token);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        processQueue(refreshError, null);
        store.dispatch(resetAuthState());

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/superadmin/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
