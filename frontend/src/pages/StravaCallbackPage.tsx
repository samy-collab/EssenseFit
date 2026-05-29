import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function StravaCallbackPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const callbackParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = callbackParams.get("token");
    const errorCode = callbackParams.get("error");

    if (errorCode || !token) {
      setError("Nao foi possivel entrar com Strava. Tente novamente.");
      return;
    }

    loginWithToken(token)
      .then(() => navigate("/produtos", { replace: true }))
      .catch(() => setError("Nao foi possivel validar sua sessao Strava."));
  }, [loginWithToken, navigate]);

  return (
    <section className="mx-auto max-w-xl card text-center">
      <p className="pill">Strava</p>
      <h2 className="section-title mt-4">Conectando sua conta</h2>
      <p className="mt-3 text-espresso/70">{error || "Estamos finalizando seu acesso."}</p>
    </section>
  );
}
