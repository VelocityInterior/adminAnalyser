// src/Components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  initializeAuth,
  setAuthFromStorage,
} from "../../store/slice/authSlice";

const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    // Add 30 second buffer to account for network delay
    return exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, status } = useSelector(
    (state) => state.auth
  );

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        // If we don't have auth state in Redux but have tokens in localStorage
        if (!isAuthenticated && !accessToken) {
          const storedToken = localStorage.getItem("SuperAdminToken");
          const storedUser = localStorage.getItem("SuperAdminUser");

          if (storedToken && storedUser && isTokenValid(storedToken)) {
            // Set auth from storage first (synchronous)
            dispatch(setAuthFromStorage());

            // Then verify with server (asynchronous)
            try {
              await dispatch(initializeAuth()).unwrap();
            } catch (error) {
              console.error("Auth initialization failed:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuthState();
  }, [dispatch, isAuthenticated, accessToken]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Check authentication
  const storedToken = localStorage.getItem("SuperAdminToken");
  const storedUser = localStorage.getItem("SuperAdminUser");

  const hasValidToken =
    (accessToken && isTokenValid(accessToken)) ||
    (storedToken && isTokenValid(storedToken));

  const hasUser = user || (storedUser && JSON.parse(storedUser));

  if (!hasValidToken || !hasUser) {
    // Clear any invalid tokens
    localStorage.removeItem("SuperAdminToken");
    localStorage.removeItem("SuperAdminUser");

    return (
      <Navigate to="/superadmin/login" state={{ from: location }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
