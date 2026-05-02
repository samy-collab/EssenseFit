import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { createCheckIn, fetchMyCheckIns } from "../services/checkinService";
import type { CheckIn } from "../types";

export function CheckInPage() {
  const { user, refreshProfile } = useAuth();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [activityType, setActivityType] = useState("corrida");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMyCheckIns().then(setCheckins).catch(() => setCheckins([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setError("");
      setSuccess("");
      await createCheckIn({
        activity_type: activityType,
        description,
        date,
        image
      });
      const refreshed = await fetchMyCheckIns();
      setCheckins(refreshed);
      await refreshProfile();
      setSuccess("Check-in registrado com sucesso.");
      setDescription("");
      setImage("");
    } catch {
      setError("Nao foi possivel registrar o check-in.");
    }
  }

  if (!user?.has_first_purchase) {
    return (
      <section className="card">
        <p className="pill">Check-in Fitness</p>
        <h2 className="section-title mt-4">Area liberada apos a primeira compra</h2>
        <p className="mt-3 text-espresso/70">
          Finalize sua primeira compra confirmada para desbloquear os check-ins e acumular pontos.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="card">
        <p className="pill">Check-in Fitness</p>
        <h2 className="section-title mt-4">Registre sua atividade do dia</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <select className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" value={activityType} onChange={(event) => setActivityType(event.target.value)}>
            <option value="corrida">corrida</option>
            <option value="academia">academia</option>
            <option value="pilates">pilates</option>
            <option value="dança">dança</option>
            <option value="caminhada">caminhada</option>
            <option value="ciclismo">ciclismo</option>
            <option value="funcional">funcional</option>
            <option value="outro">outro</option>
          </select>
          <textarea className="h-32 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="Descreva como foi seu treino" value={description} onChange={(event) => setDescription(event.target.value)} />
          <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="URL da imagem opcional" value={image} onChange={(event) => setImage(event.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
          <button className="button-primary w-full" type="submit">
            Enviar check-in
          </button>
        </form>
      </div>
      <div className="card">
        <h3 className="font-display text-3xl text-espresso">Historico recente</h3>
        <div className="mt-6 space-y-4">
          {checkins.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-espresso/10 bg-white/70 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold capitalize text-espresso">{item.activity_type}</span>
                <span className="pill">+{item.points_earned} pts</span>
              </div>
              <p className="mt-3 text-sm text-espresso/70">{new Date(item.date).toLocaleDateString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
