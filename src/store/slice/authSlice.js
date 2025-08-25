// src/store/slice/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("SuperAdminUser")) || null,
  accessToken: localStorage.getItem("SuperAdminToken") || null,
  status: "idle",
  error: null,
  isAuthenticated: !!localStorage.getItem("SuperAdminToken"),
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/superadmin/login", {
        email,
        password,
      });

      // Store in localStorage for persistence
      localStorage.setItem("SuperAdminToken", res.data.accessToken);
      localStorage.setItem("SuperAdminUser", JSON.stringify(res.data.user));

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh-token-superadmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/superadmin/refresh-token-superadmin"
      );

      // Update localStorage with new token
      localStorage.setItem("SuperAdminToken", res.data.accessToken);

      return res.data;
    } catch (err) {
      // Clear localStorage on refresh token failure
      localStorage.removeItem("SuperAdminToken");
      localStorage.removeItem("SuperAdminUser");
      return rejectWithValue(
        err.response?.data || { message: "Token refresh failed" }
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Make backend call but don't wait for it to complete
    const backendLogoutPromise = axiosInstance.post("/superadmin/logout")
      .catch(err => {
        console.warn("Backend logout failed:", err.message);
      });
    
    // Immediately clear frontend state
    localStorage.removeItem("SuperAdminToken");
    localStorage.removeItem("SuperAdminUser");
    dispatch(resetAuthState());
    
    // Wait for backend call to complete (but don't care about result)
    await backendLogoutPromise;
    
    // No explicit return needed
  }
);

// Action to initialize auth state from localStorage
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("SuperAdminToken");
    const user = localStorage.getItem("SuperAdminUser");

    if (!token || !user) {
      return rejectWithValue({ message: "No stored credentials" });
    }

    try {
      // Verify token is still valid by attempting refresh
      const res = await dispatch(refreshToken()).unwrap();
      return {
        user: JSON.parse(user),
        accessToken: res.accessToken,
      };
    } catch (err) {
      // If refresh fails, clear storage
      localStorage.removeItem("SuperAdminToken");
      localStorage.removeItem("SuperAdminUser");
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      // Clear localStorage (redundant but safe)
      localStorage.removeItem("SuperAdminToken");
      localStorage.removeItem("SuperAdminUser");
      
      // Return a new state object instead of mutating
      return {
        ...initialState,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        status: "idle",
      };
    },
    setAuthFromStorage: (state) => {
      const token = localStorage.getItem("SuperAdminToken");
      const user = localStorage.getItem("SuperAdminUser");

      if (token && user) {
        state.accessToken = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Login failed";
        state.isAuthenticated = false;
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Token refresh failed";
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        // State is already reset by resetAuthState, just ensure consistency
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if rejected, ensure state is cleared
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })

      // Initialize auth cases
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export const { resetAuthState, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;