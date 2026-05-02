import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await register(name, email, password);
      navigate("/produtos");
    } catch {
      setError("Nao foi possivel concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl card">
      <p className="pill">Cadastro</p>
      <h2 className="section-title mt-4">Crie sua conta Essence Fit</h2>
      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="Nome completo" value={name} onChange={(event) => setName(event.target.value)} />
          <input className="rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="rounded-2xl border border-espresso/15 bg-white px-4 py-3 md:col-span-2" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button className="button-primary mt-6" type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Finalizar cadastro"}
        </button>
      </form>
    </section>
  );
}
