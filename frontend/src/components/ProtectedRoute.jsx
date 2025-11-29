import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, allowedRoles = [] }) {
  const { user } = useAuth();

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for specific role
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for multiple allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}