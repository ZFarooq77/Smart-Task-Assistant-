import React from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-danger btn-sm flex items-center space-x-2"
      title="Sign out"
    >
      <span className="text-sm">→</span>
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
