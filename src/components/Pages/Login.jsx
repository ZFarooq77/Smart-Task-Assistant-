import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabaseClient";
import { FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";

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

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Passwords do not match");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setErrorMsg("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password
        });
        if (error) setErrorMsg(error.message);
        else {
          setSuccessMsg("Account created! Check your email to verify.");
          setTimeout(() => setIsSignup(false), 2000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password
        });
        if (error) setErrorMsg(error.message);
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-pink-500">
      {/* Centered White Card */}
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 flex flex-col justify-center items-center text-center">
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6">
          {isSignup ? "Sign Up" : "Login"}
        </h1>

        {/* Error / Success */}
        {errorMsg && (
          <div className="mb-4 p-3 w-full bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 w-full bg-green-100 border border-green-300 rounded-lg text-green-600 text-sm">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* Email */}
          <div className="text-left">
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Type your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="text-left">
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Type your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Confirm Password (Signup only) */}
          {isSignup && (
            <div className="text-left">
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-type your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
          )}

          {/* Forgot Password */}
          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-md"
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>


        {/* Toggle Sign In / Sign Up */}
        <div className="mt-6">
          <p className="text-gray-500 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setErrorMsg("");
                setSuccessMsg("");
                setFormData({ email: "", password: "", confirmPassword: "" });
              }}
              className="text-blue-500 hover:underline font-semibold"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
