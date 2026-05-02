import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/produtos");
    } catch (err) {
      setError("Nao foi possivel entrar. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl card">
      <p className="pill">Acesso</p>
      <h2 className="section-title mt-4">Entrar na sua conta</h2>
      <p className="mt-3 text-espresso/70">Acesse sua area de compras, check-ins, pontos e cupons.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="button-primary w-full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
