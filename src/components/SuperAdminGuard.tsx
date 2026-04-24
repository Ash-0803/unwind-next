"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminLogin from "./SuperAdminLogin";

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <SuperAdminLogin onLogin={() => {}} />;
  }

  return <>{children}</>;
};

export default SuperAdminGuard;
