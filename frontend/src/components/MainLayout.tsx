import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/produtos", label: "Produtos" },
  { to: "/meu-perfil", label: "Perfil" },
  { to: "/check-in-fitness", label: "Check-in" },
  { to: "/meus-pontos", label: "Pontos" },
  { to: "/meus-cupons", label: "Cupons" },
  { to: "/admin", label: "Admin" }
];

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen text-theme-primary">
      <header className="sticky top-0 z-20 border-b border-theme bg-theme-shell backdrop-blur-xl">
        <div className="page-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <NavLink to="/" className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-theme-card shadow-[0_10px_30px_var(--shadow-soft)]">
              <img
                src="/brand/logos/LOGOESSENSEFIT.png"
                alt="Essence Fit"
                className="h-12 w-12 object-contain"
              />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-accent">Essence Fit</p>
              <h1 className="font-display text-2xl leading-none text-theme-primary">Movimento com presenca</h1>
            </div>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-bold transition ${
                    isActive ? "bg-theme-primary text-theme-inverse" : "text-theme-secondary hover:bg-theme-card hover:text-theme-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className="rounded-md border border-theme bg-theme-card px-3 py-2 text-sm font-bold text-theme-primary transition hover:border-theme-accent hover:text-theme-accent"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {theme === "dark" ? "Claro" : "Escuro"}
            </button>
            {isAuthenticated ? (
              <>
                <span className="max-w-[170px] truncate rounded-md border border-theme bg-theme-card px-3 py-2 text-sm font-bold text-theme-secondary">
                  {user?.name}
                </span>
                <button className="button-secondary px-4 py-2" onClick={logout} type="button">
                  Sair
                </button>
              </>
            ) : (
              <NavLink to="/login" className="button-primary px-4 py-2">
                Entrar
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="page-shell py-8">
        <Outlet />
      </main>
    </div>
  );
}
