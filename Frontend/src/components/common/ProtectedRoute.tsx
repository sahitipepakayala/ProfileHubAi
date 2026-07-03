import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "company" | "candidate";
}

// Equivalent to the RequireRole guard currently defined inline in App.tsx.
// Not currently used — App.tsx has its own working copy — but available if
// you want a single shared version instead of the inline one.
export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === "company" ? "/company" : "/candidate"} replace />;
  }

  return <>{children}</>;
}