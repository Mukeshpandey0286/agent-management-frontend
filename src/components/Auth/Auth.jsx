import React, { useState } from "react";
import { Users, Mail, Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { FadeIn } from "../common/Animations";
import { apiCall } from "../../utils/api";

const Auth = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
    setError("");
    setSuccessMessage("");
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const validateForm = () => {
    if (isSignUp && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignUp ? "/auth/create-admin" : "/auth/login";
      const payload = { email: formData.email, password: formData.password };

      console.log("Making API call to:", endpoint);
      console.log("Payload:", payload);

      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("API Response:", response);

      if (isSignUp) {
        // Handle signup success
        if (response.success) {
          setSuccessMessage(
            "Admin account created successfully! Please sign in."
          );
          setIsSignUp(false);
          resetForm();
        }
      } else {
        // Handle login success
        if (response.success && response.data) {
          console.log("Login successful, storing data...");

          // Store token and user data
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          console.log("Calling onLogin with user data:", response.data.user);

          // Call onLogin to update parent component
          onLogin(response.data.user);
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <FadeIn delay={200}>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Create Admin Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-300">
              {isSignUp
                ? "Create your admin account"
                : "Sign in to your admin account"}
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-200 text-sm">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={
                    isSignUp ? "Create a password" : "Enter your password"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : isSignUp ? (
                "Create Admin Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span className="text-purple-400 hover:text-purple-300 font-semibold">
                    Sign In
                  </span>
                </>
              ) : (
                <>
                  Need to create admin account?{" "}
                  <span className="text-purple-400 hover:text-purple-300 font-semibold">
                    Create Admin
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Demo Credentials - Only show for Sign In */}
          {!isSignUp && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-gray-300 text-xs mb-2">Demo Credentials:</p>
              <p className="text-white text-sm">Email: admin@example.com</p>
              <p className="text-white text-sm">Password: admin@12</p>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
};

export default Auth;
