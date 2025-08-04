import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert("Signup successful! You can now log in.");
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        className="border p-3 rounded w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-3 rounded w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white p-3 rounded w-full hover:bg-green-600"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
