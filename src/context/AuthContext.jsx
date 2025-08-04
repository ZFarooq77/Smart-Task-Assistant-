// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";

const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Stores logged-in user object
  const [session, setSession] = useState(null); // Stores Supabase session (incl. JWT)
  const [loading, setLoading] = useState(true); // Loading state while checking auth

  // Run on app load
  useEffect(() => {
    // Get the current session from Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes (login, logout)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Context value to share
  const value = {
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
