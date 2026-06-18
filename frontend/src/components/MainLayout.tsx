import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const mainNavItems = [
  { to: "/", label: "Home" },
  { to: "/produtos", label: "Produtos" },
  { to: "/carrinho", label: "Carrinho" }
];

const accountNavItems = [
  { to: "/meu-perfil", label: "Perfil" },
  { to: "/check-in-fitness", label: "Check-in" },
  { to: "/meus-pontos", label: "Pontos" },
  { to: "/meus-cupons", label: "Cupons" },
  { to: "/admin", label: "Admin" }
];

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="ml-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-theme-accent px-1.5 text-[0.68rem] font-black leading-none text-white">{count}</span>;
}

function HeaderLink({ to, label, itemCount, onClick, large = false }: { to: string; label: string; itemCount: number; onClick?: () => void; large?: boolean }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative inline-flex items-center gap-1 whitespace-nowrap font-bold transition ${large ? "py-3 text-2xl" : "py-2 text-sm"} ${
          isActive ? "text-theme-primary" : "text-theme-secondary hover:text-theme-primary"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>
          {to === "/carrinho" ? <CartBadge count={itemCount} /> : null}
          <span className={`absolute bottom-0 left-0 h-px bg-theme-accent transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
        </>
      )}
    </NavLink>
  );
}

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen text-theme-primary">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(8,10,9,0.82)] text-theme-primary shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,139,122,0.8),transparent)]" />
        <div className="mx-auto flex min-h-[84px] max-w-[1600px] items-center gap-5 px-4 sm:px-6 lg:px-8 2xl:px-12">
          <NavLink to="/" className="group flex min-w-0 items-center gap-3" onClick={closeMenu}>
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/8 shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition group-hover:scale-105">
              <img src="/brand/logos/LOGOESSENSEFIT.png" alt="Essence Fit" className="h-10 w-10 object-contain" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.66rem] font-black uppercase tracking-[0.22em] text-theme-accent">Essence Fit</span>
              <span className="block truncaté font-display text-xl leading-none text-theme-primary sm:text-2xl">Activewear Studio</span>
            </span>
          </NavLink>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex">
            {mainNavItems.map((item) => <HeaderLink key={item.to} {...item} itemCount={itemCount} />)}
            <span className="h-5 w-px bg-white/12" />
            {accountNavItems.map((item) => <HeaderLink key={item.to} {...item} itemCount={itemCount} />)}
          </nav>

          <div className="ml-auto hidden items-center gap-4 xl:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-[180px] truncaté text-sm font-bold text-theme-secondary">{user?.name}</span>
                <button className="text-sm font-black text-theme-secondary transition hover:text-theme-accent" onClick={logout} type="button">Sair</button>
              </>
            ) : (
              <NavLink to="/login" className="button-primary px-5 py-2.5">Entrar</NavLink>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3 xl:hidden">
            <NavLink to="/carrinho" className="relative inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 text-sm font-black text-theme-primary" onClick={closeMenu} aria-label="Abrir carrinho">
              Sacola <CartBadge count={itemCount} />
            </NavLink>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-4 text-sm font-black text-theme-primary transition hover:border-theme-accent hover:text-theme-accent"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label="Abrir menu"
            >
              {menuOpen ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-white/10 bg-[rgba(8,10,9,0.96)] px-4 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.36)] sm:px-6 xl:hidden">
            <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[1fr_0.7fr]">
              <div className="grid gap-1">
                {[...mainNavItems, ...accountNavItems].map((item) => (
                  <HeaderLink key={item.to} {...item} itemCount={itemCount} onClick={closeMenu} large />
                ))}
              </div>
              <div className="flex flex-col justify-between gap-5 border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-theme-accent">Conta</p>
                  {isAuthenticated ? (
                    <p className="mt-3 truncaté font-display text-3xl text-theme-primary">{user?.name}</p>
                  ) : (
                    <p className="mt-3 max-w-sm text-sm leading-6 text-theme-secondary">Entre para finalizar compras, acompanhar pedidos e manter sua sacola salva.</p>
                  )}
                </div>
                {isAuthenticated ? (
                  <button className="button-secondary w-fit px-5 py-2" onClick={() => { logout(); closeMenu(); }} type="button">Sair</button>
                ) : (
                  <NavLink to="/login" className="button-primary w-fit px-5 py-2.5" onClick={closeMenu}>Entrar</NavLink>
                )}
              </div>
            </div>
          </nav>
        ) : null}
      </header>
      <main className="page-shell py-8">
        <Outlet />
      </main>
    </div>
  );
}
