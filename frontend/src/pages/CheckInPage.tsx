import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { createCheckIn, fetchMyCheckIns, uploadCheckInImage } from "../services/checkinService";
import type { CheckIn } from "../types";

export function CheckInPage() {
  const { user, refreshProfile } = useAuth();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [activityType, setActivityType] = useState("corrida");
  const [durationMin, setDurationMin] = useState("30");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => todayInputValue());
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCheckIns().then(setCheckins).catch(() => setCheckins([]));
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const streak = useMemo(() => calculateStreak(checkins), [checkins]);
  const weeklyRemaining = Math.max(7 - Math.min(streak, 7), 0);
  const monthlyRemaining = Math.max(30 - Math.min(streak, 30), 0);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");

    if (file && !file.type.startsWith("image/")) {
      setImageFile(null);
      setError("Selecione um arquivo de imagem.");
      return;
    }

    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const uploadedImage = imageFile ? await uploadCheckInImage(imageFile) : image;
      await createCheckIn({
        activity_type: activityType,
        duration_min: Number(durationMin),
        calories_burned: Number(caloriesBurned) || 0,
        description,
        date,
        image: uploadedImage
      });
      const refreshed = await fetchMyCheckIns();
      setCheckins(refreshed);
      await refreshProfile();
      setSuccess("Check-in registrado com sucesso.");
      setDescription("");
      setDurationMin("30");
      setCaloriesBurned("");
      setImage("");
      setImageFile(null);
      setDate(todayInputValue());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!user?.check_in_unlocked) {
    return (
      <section className="card">
        <p className="pill">Check-in Fitness</p>
        <h2 className="section-title mt-4">Área liberada após a primeira compra</h2>
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
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-theme bg-theme-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">Sequência</p>
            <p className="mt-2 font-display text-3xl text-theme-primary">{streak} dias</p>
          </div>
          <div className="rounded-lg border border-theme bg-theme-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">Cupom 5%</p>
            <p className="mt-2 text-sm font-bold text-theme-primary">{weeklyRemaining === 0 ? "Conquistado" : `${weeklyRemaining} dias restantes`}</p>
          </div>
          <div className="rounded-lg border border-theme bg-theme-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">Cupom 15%</p>
            <p className="mt-2 text-sm font-bold text-theme-primary">{monthlyRemaining === 0 ? "Conquistado" : `${monthlyRemaining} dias restantes`}</p>
          </div>
        </div>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" inputMode="numeric" placeholder="Duração em minutos" value={durationMin} onChange={(event) => setDurationMin(event.target.value.replace(/\D/g, ""))} required />
            <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" inputMode="numeric" placeholder="Calorias opcionais" value={caloriesBurned} onChange={(event) => setCaloriesBurned(event.target.value.replace(/\D/g, ""))} />
          </div>
          <textarea className="h-32 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="Descreva como foi seu treino" value={description} onChange={(event) => setDescription(event.target.value)} />
          <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <div className="rounded-2xl border border-espresso/15 bg-white p-4">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="checkin-image">Foto do treino</label>
            <input id="checkin-image" className="mt-3 w-full text-sm text-theme-secondary file:mr-4 file:rounded-md file:border-0 file:bg-theme-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
            {imagePreview ? <img src={imagePreview} alt="Prévia do check-in" className="mt-4 h-40 w-full rounded-lg object-cover" /> : null}
            <input className="mt-4 w-full rounded-md border border-theme bg-theme-muted px-4 py-3" placeholder="Ou cole uma URL de imagem opcional" value={image} onChange={(event) => setImage(event.target.value)} disabled={Boolean(imageFile)} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
          <button className="button-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Enviando check-in..." : "Enviar check-in"}
          </button>
        </form>
      </div>
      <div className="card">
        <h3 className="font-display text-3xl text-espresso">Histórico recente</h3>
        <div className="mt-6 space-y-4">
          {checkins.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-espresso/10 bg-white/70 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold capitalize text-espresso">{item.activity_type}</span>
                <span className="pill">+{item.points_earned} pts</span>
              </div>
              <p className="mt-3 text-sm text-espresso/70">{new Date(item.date).toLocaleDateString("pt-BR")} · {item.duration_min} min{item.calories_burned ? ` · ${item.calories_burned} kcal` : ""}</p>
              {item.image ? <img src={item.image} alt={`Check-in de ${item.activity_type}`} className="mt-4 h-36 w-full rounded-lg object-cover" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function calculateStreak(checkins: CheckIn[]) {
  const days = Array.from(new Set(checkins.map((item) => item.date.slice(0, 10)))).sort().reverse();
  if (days.length === 0) return 0;

  let streak = 0;
  let expected = parseLocalDate(days[0]);

  for (const day of days) {
    const current = parseLocalDate(day);
    if (current.getTime() === expected.getTime()) {
      streak += 1;
      expected.setDate(expected.getDate() - 1);
      continue;
    }
    if (current < expected) break;
  }

  return streak;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }

  return "Não foi possível registrar o check-in.";
}
