import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({
  requireAdmin = false
}: {
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
