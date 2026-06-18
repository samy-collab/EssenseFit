import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStravaLoginUrl } from "../services/authService";

export function LoginPage() {
  const { isAuthenticated, login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const isStravaUser = isAuthenticated && Boolean(user?.strava_athlete_id);

  function handleStravaLogin() {
    window.location.href = getStravaLoginUrl();
  }

  function handleStravaLogout() {
    logout();
    setError("");
    setNotice("Conta Strava desconectada deste dispositivo.");
  }

  function handleSwitchStravaAccount() {
    logout();
    window.location.href = getStravaLoginUrl({ forceApproval: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      setNotice("");
      await login(email.trim(), password);
      navigate("/produtos");
    } catch (err) {
      setError("Não foi possível entrar. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl card">
      <p className="pill">Acesso</p>
      <h2 className="section-title mt-4">Entrar na sua conta</h2>
      <p className="mt-3 text-espresso/70">Acesse sua área de compras, check-ins, pontos e cupons.</p>
      <div className="mt-8 space-y-3">
        <button className="w-full rounded-2xl bg-[#fc4c02] px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(252,76,2,0.28)] transition hover:bg-[#d84302]" type="button" onClick={handleStravaLogin}>
          Entrar com Strava
        </button>
        <button
          className="w-full rounded-2xl border-2 border-[#fc4c02] bg-white px-5 py-4 text-center font-bold text-[#fc4c02] shadow-[0_10px_24px_rgba(252,76,2,0.14)] transition hover:bg-[#fc4c02] hover:text-white"
          type="button"
          onClick={handleSwitchStravaAccount}
        >
          Entrar com outra conta Strava
        </button>
      </div>
      {isStravaUser ? (
        <div className="mt-4 rounded-2xl border border-espresso/10 bg-white/70 p-4">
          <p className="text-sm text-espresso/70">Conta Strava conectada como <strong>{user?.name}</strong>.</p>
          <button className="button-secondary mt-3 w-full px-4 py-2" type="button" onClick={handleStravaLogout}>
            Sair do Strava
          </button>
        </div>
      ) : null}
      {notice ? <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-espresso/70">{notice}</p> : null}
      <div className="my-6 flex items-center gap-3 text-sm text-espresso/50">
        <span className="h-px flex-1 bg-espresso/10" />
        <span>ou administrador</span>
        <span className="h-px flex-1 bg-espresso/10" />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="relative">
          <input
            className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 pr-24"
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="absolute inset-y-1 right-1 rounded-2xl px-4 text-sm font-semibold text-clay transition hover:bg-sand"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="button-primary w-full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
