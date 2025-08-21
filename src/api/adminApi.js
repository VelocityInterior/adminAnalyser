// src/api/adminApi.js
import axiosInstance from "./axios";

// Login super admin
export const loginSuperAdmin = (email, password) => {
  return axiosInstance.post("/login", { email, password });
};

// Create super admin (optional for registration form)
export const createSuperAdmin = (data) => {
  return axiosInstance.post("/create", data);
};

// Refresh access token manually (used inside axiosInstance)
export const refreshAccessToken = () => {
  return axiosInstance.post("/refresh-token-superadmin");
};

// Logout
export const logoutSuperAdmin = () => {
  return axiosInstance.post("/logout");
};
