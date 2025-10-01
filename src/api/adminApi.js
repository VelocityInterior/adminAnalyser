// src/api/adminApi.js
import axiosInstance from "./axios";

// Login super admin
export const loginSuperAdmin = async (email, password) => {
  try {
    const response = await axiosInstance.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Error logging in super admin:", error);
    throw error;
  }
};

// Create super admin (optional for registration form)
export const createSuperAdmin = async (data) => {
  try {
    const response = await axiosInstance.post("/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating super admin:", error);
    throw error;
  }
};

// Refresh access token manually (used inside axiosInstance)
export const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post("/refresh-token-superadmin");
    return response.data;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};

// Logout
export const logoutSuperAdmin = async () => {
  try {
    const response = await axiosInstance.post("/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out super admin:", error);
    throw error;
  }
};
