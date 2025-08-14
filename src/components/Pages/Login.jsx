
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabaseClient";
import GradientLogo from "../UI/GradientLogo";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignup) {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Passwords do not match");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setErrorMsg("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg("Account created successfully! Please check your email to verify your account.");
          setTimeout(() => {
            setIsSignup(false);
            setFormData({ email: formData.email, password: "", confirmPassword: "" });
          }, 2000);
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          setErrorMsg(error.message);
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <GradientLogo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-white/70 text-sm">
              {isSignup ? "Join us and start managing your tasks" : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl text-sm animate-fadeIn backdrop-blur-sm">
              <div className="flex items-center">
                {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-100 px-4 py-3 rounded-xl text-sm animate-fadeIn backdrop-blur-sm">
              <div className="flex items-center">
                {successMsg}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-base"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

              </div>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isSignup ? "Create a password" : "Enter your password"}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-base pr-12"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                </button>
              </div>
              {isSignup && <p className="mt-1 text-xs text-white/60">Must be at least 6 characters</p>}
            </div>

            {isSignup && (
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-base"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <span className="animate-pulse mr-2">●</span>
                  {isSignup ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-white/70 text-sm">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrorMsg("");
                  setSuccessMsg("");
                  setFormData({ email: "", password: "", confirmPassword: "" });
                }}
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
