"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSuperAdmin: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.email === "sanchalak@unwind.com";

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && currentUser.email === "sanchalak@unwind.com") {
          setUser(currentUser);
        } else {
          // Sign out any non-admin users
          await authService.signOut();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (user) => {
      if (user && user.email === "sanchalak@unwind.com") {
        setUser(user);
      } else {
        setUser(null);
        if (user) {
          // Sign out non-admin users immediately
          await authService.signOut();
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, error } = await authService.signIn(email, password);

      if (error) {
        return { success: false, error };
      }

      if (user && user.email === "sanchalak@unwind.com") {
        setUser(user);
        return { success: true };
      } else {
        await authService.signOut();
        return { success: false, error: "Access denied. Super admin only." };
      }
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSuperAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
