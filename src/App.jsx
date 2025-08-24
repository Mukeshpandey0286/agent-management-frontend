import React, { useState, useEffect } from "react";
import Auth from "./components/Auth/Auth";
import Dashboard from "./components/Dashboard/Dashboard";
import { apiCall } from "./utils/api";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log("=== APP INITIALIZATION ===");
      console.log("Token exists:", !!token);
      console.log("User data exists:", !!userData);

      if (token && userData) {
        try {
          console.log("Attempting to parse stored user data...");
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user data:", parsedUser);

          // Always verify token with backend to check if user still exists
          console.log("Verifying token and user existence with backend...");
          const response = await apiCall("/auth/verify-token", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Token verification response:", response);

          if (
            response &&
            response.success &&
            response.data &&
            response.data.user
          ) {
            // Token is valid and user exists in database
            console.log(
              "Token verified successfully, user exists:",
              response.data.user
            );
            setUser(response.data.user);
            setAuthError(null);
          } else {
            // Token is invalid or user doesn't exist
            console.log(
              "Token verification failed or user not found:",
              response
            );
            handleAuthFailure("Invalid session or user not found");
          }
        } catch (error) {
          console.log("Token verification error:", error);

          // Handle different types of errors
          if (error.status === 401) {
            handleAuthFailure("Session expired. Please login again.");
          } else if (error.status === 404) {
            handleAuthFailure("User not found. Please contact administrator.");
          } else if (error.status === 403) {
            handleAuthFailure("Access denied. Please login again.");
          } else {
            handleAuthFailure("Authentication failed. Please login again.");
          }
        }
      } else {
        console.log("No stored authentication data found");
        setAuthError(null);
      }

      console.log("=== APP INITIALIZATION COMPLETE ===");
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Helper function to handle authentication failures
  const handleAuthFailure = (errorMessage) => {
    console.log("=== AUTHENTICATION FAILURE ===");
    console.log("Error:", errorMessage);

    setUser(null);
    setAuthError(errorMessage);

    // Clear invalid data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    console.log("Cleared invalid authentication data");
  };

  // Monitor user state changes
  useEffect(() => {
    console.log("=== USER STATE CHANGED ===");
    console.log("New user state:", user);
    console.log("Auth error:", authError);
    console.log("Should show dashboard:", !!user);
  }, [user, authError]);

  const handleLogin = (userData) => {
    console.log("=== HANDLE LOGIN CALLED ===");
    console.log("Received user data:", userData);

    if (userData) {
      setUser(userData);
      setAuthError(null); // Clear any previous auth errors
      console.log("User state updated successfully");
    } else {
      console.log("ERROR: No user data provided to handleLogin");
      setAuthError("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    console.log("=== LOGOUT INITIATED ===");

    try {
      // Call logout endpoint with current token
      const token = localStorage.getItem("token");
      await apiCall("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      console.log("Logout API call successful");
    } catch (error) {
      console.log("Logout API call failed:", error);
      // Continue with logout even if API call fails
    }

    // Always clear state and storage
    console.log("Clearing user state and localStorage");
    setUser(null);
    setAuthError(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("Logout complete");
  };

  // Handle session expiration or user deletion during app usage
  const handleSessionExpired = (
    errorMessage = "Session expired. Please login again."
  ) => {
    console.log("=== SESSION EXPIRED ===");
    console.log("Reason:", errorMessage);

    setUser(null);
    setAuthError(errorMessage);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Debug render
  console.log("=== RENDER ===");
  console.log("Loading:", loading);
  console.log("User:", user);
  console.log("Auth Error:", authError);
  console.log(
    "Will render:",
    loading ? "Loading Screen" : user ? "Dashboard" : "Auth"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Verifying authentication...</p>
          <p className="text-white/70 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <Auth
          onLogin={handleLogin}
          authError={authError}
          onClearError={() => setAuthError(null)}
        />
      ) : (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onSessionExpired={handleSessionExpired}
        />
      )}
    </div>
  );
};

export default App;
