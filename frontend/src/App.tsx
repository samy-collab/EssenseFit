import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminPage } from "./pages/AdminPage";
import { CartPage } from "./pages/CartPage";
import { CheckInPage } from "./pages/CheckInPage";
import { CouponsPage } from "./pages/CouponsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PointsPage } from "./pages/PointsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProductsPage } from "./pages/ProductsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SeasonProductsPage } from "./pages/SeasonProductsPage";
import { StravaCallbackPage } from "./pages/StravaCallbackPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/strava/callback" element={<StravaCallbackPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/produtos/estacao/:season" element={<SeasonProductsPage />} />
        <Route path="/produtos/:id" element={<ProductDetailPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/meu-perfil" element={<ProfilePage />} />
          <Route path="/meus-pedidos" element={<OrdersPage />} />
          <Route path="/check-in-fitness" element={<CheckInPage />} />
          <Route path="/meus-pontos" element={<PointsPage />} />
          <Route path="/meus-cupons" element={<CouponsPage />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
