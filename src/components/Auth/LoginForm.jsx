import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
        className="bg-blue-500 text-white p-3 rounded w-full hover:bg-blue-600"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
