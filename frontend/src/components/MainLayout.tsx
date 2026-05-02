import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/produtos", label: "Produtos" },
  { to: "/check-in-fitness", label: "Check-in Fitness" },
  { to: "/meus-pontos", label: "Meus Pontos" },
  { to: "/meus-cupons", label: "Meus Cupons" },
  { to: "/admin", label: "Painel Admin" }
];

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-sand/90 backdrop-blur">
        <div className="page-shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="pill">Essence Fit</p>
            <h1 className="font-display text-3xl text-espresso">Sua Essencia em Movimento</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-espresso text-white" : "bg-white/70 text-espresso hover:bg-blush"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-espresso">
                  {user?.name}
                </span>
                <button className="button-secondary" onClick={logout} type="button">
                  Sair
                </button>
              </>
            ) : (
              <NavLink to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-espresso">
                Entrar
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
