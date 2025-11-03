import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

/**
 * VisualizacionesSugeridasCompuestos
 * Sugerencias inteligentes para sesiones COMPUESTAS (supersets/dropsets/circuitos).
 * Recibe una lista PLANA de registros (serieNumero + cada ejercicio del compuesto).
 *
 * Ejemplo de `registros`:
 * [{ serieNumero: 1, ejercicioId: 58, nombre: 'Búlgara', pesoKg: 20, repeticiones: 8, duracionSegundos: null }, ...]
 */

type RegistroPlanoCompuesto = {
  serieNumero: number;
  ejercicioId: number;
  nombre: string;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
  idGif?: string;
  grupoMuscular?: string;
  musculoPrincipal?: string;
};

type Props = { registros: RegistroPlanoCompuesto[] };

/* ===================== Helpers de lógica ===================== */

type Metrics = {
  nSets: number;                      // sets únicos
  nEjercicios: number;                // ejercicios distintos
  totalReps: number;
  totalVol: number;                   // sum(peso*reps)
  volPorEjercicio: Array<{ ejercicioId: number; nombre: string; vol: number; reps: number }>;
  balanceIndice: number;              // 0..1 qué tan balanceado está el volumen entre ejercicios
  repsPromedioPorSet: number;
  pesoPromedioPorRep: number;         // totalVol / totalReps
  maxPeso: number;
  maxReps: number;
};

type SugCat = "Carga" | "Volumen" | "Técnica" | "Recuperación" | "Progresión";

type Sug = { cat: SugCat; text: string };

// Calcula métricas clave para compuestos
function computeCompoundMetrics(regs: RegistroPlanoCompuesto[]): Metrics {
  const sets = new Set<number>();
  const volMap = new Map<number, { nombre: string; vol: number; reps: number }>();

  let totalReps = 0;
  let totalVol = 0;
  let maxPeso = 0;
  let maxReps = 0;

  for (const r of regs) {
    sets.add(r.serieNumero);
    const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
    const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;

    // volumen por registro
    const vol = peso * reps;
    totalReps += reps;
    totalVol += vol;
    if (peso > maxPeso) maxPeso = peso;
    if (reps > maxReps) maxReps = reps;

    // volumen por ejercicio
    const prev = volMap.get(r.ejercicioId);
    if (prev) {
      prev.vol += vol;
      prev.reps += reps;
    } else {
      volMap.set(r.ejercicioId, { nombre: r.nombre, vol, reps });
    }
  }

  const nSets = sets.size;
  const nEjercicios = volMap.size;
  const volPorEjercicio = Array.from(volMap, ([ejercicioId, v]) => ({
    ejercicioId,
    nombre: v.nombre,
    vol: v.vol,
    reps: v.reps,
  })).sort((a, b) => b.vol - a.vol);

  // índice de equilibrio simple (1 = volumen iguales, 0 = muy desbalanceado)
  let balanceIndice = 1;
  if (volPorEjercicio.length > 1) {
    const vols = volPorEjercicio.map((v) => v.vol);
    const max = Math.max(...vols);
    const min = Math.min(...vols);
    balanceIndice = max === 0 ? 1 : 1 - (max - min) / max; // 1 si min≈max, 0 si min=0 y max>0
  }

  const repsPromedioPorSet = nSets ? totalReps / nSets : 0;
  const pesoPromedioPorRep = totalReps ? totalVol / totalReps : 0;

  return {
    nSets,
    nEjercicios,
    totalReps,
    totalVol,
    volPorEjercicio,
    balanceIndice,
    repsPromedioPorSet,
    pesoPromedioPorRep,
    maxPeso,
    maxReps,
  };
}

function generateCompoundSuggestions(m: Metrics): Sug[] {
  const out: Sug[] = [];

  // Volumen total y densidad del set
  if (m.totalVol < 300) {
    out.push({ cat: "Volumen", text: "Volumen bajo para un compuesto: añade 1–2 sets o eleva 2.5–5% la carga." });
  } else if (m.totalVol > 1500) {
    out.push({ cat: "Recuperación", text: "Volumen alto: vigila la fatiga. Considera reducir 1 set o añadir descanso." });
  }

  // Balance entre ejercicios del compuesto
  if (m.balanceIndice < 0.6 && m.volPorEjercicio.length > 1) {
    const top = m.volPorEjercicio[0];
    const low = m.volPorEjercicio[m.volPorEjercicio.length - 1];
    out.push({
      cat: "Técnica",
      text: `Desbalance: ${top.nombre} acumula mucho más volumen que ${low.nombre}. Igualar estímulo ayudará al progreso.`,
    });
  } else {
    out.push({
      cat: "Progresión",
      text: "Buen balance entre ejercicios: prueba progresión doble (reps objetivo primero, luego +2.5% peso).",
    });
  }

  // Carga y repeticiones
  if (m.pesoPromedioPorRep < 15 && m.maxReps >= 10) {
    out.push({
      cat: "Carga",
      text: "Reps altas y carga ligera: sube ligeramente el peso manteniendo técnica, apunta a RIR 1–2.",
    });
  } else if (m.pesoPromedioPorRep >= 25 && m.maxReps <= 6) {
    out.push({
      cat: "Recuperación",
      text: "Cargas altas y pocas reps: alarga descansos entre sets (90–120s) para sostener el rendimiento.",
    });
  }

  // Recomendación de tempo/técnica general
  out.push({
    cat: "Técnica",
    text: "Controla el tempo (2–0–2) y preserva rango completo. En compuestos, la calidad por ejercicio es clave.",
  });

  return out;
}

function groupByCategory(sugs: Sug[]): Record<SugCat, string[]> {
  return sugs.reduce((acc, s) => {
    (acc[s.cat] ||= []).push(s.text);
    return acc;
  }, {} as Record<SugCat, string[]>);
}

function buildNextCompoundPlan(m: Metrics) {
  // reglas sencillas basadas en métricas
  const moreSets = m.totalVol < 600 ? "+1 set" : "mismo nº sets";
  const progression =
    m.balanceIndice < 0.6
      ? "equilibra volumen entre ejercicios antes de subir carga"
      : "progresión doble: primero alcanzar reps objetivo, luego +2.5% peso";
  const rest =
    m.pesoPromedioPorRep >= 25 ? "90–120s" : "60–75s";

  return {
    warmup: "2–3 sets de aproximación, 40–60% carga de trabajo",
    workRange: `${m.nSets ? m.nSets : 3} sets (${moreSets})`,
    progression,
    rest,
    notes: "Mantén RIR 1–2; si la técnica decae, pausa la progresión.",
  };
}

/* ===================== UI helpers ===================== */

function CatBadgeCompuestos({ cat, isDark }: { cat: SugCat; isDark: boolean }) {
  const map: Record<SugCat, [string, string]> = {
    Carga: ["#e2e8f0", "#cbd5e1"],        // slate-200->300
    Volumen: ["#bfdbfe", "#93c5fd"],      // blue-200->300
    Técnica: ["#a7f3d0", "#6ee7b7"],      // emerald-200->300
    Recuperación: ["#e9d5ff", "#d8b4fe"], // purple-200->300
    Progresión: ["#fde68a", "#fcd34d"],   // amber-200->300
  };
  const [c1, c2] = map[cat];
  return (
    <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="self-start rounded-full px-2.5 py-1">
      <Text className={isDark ? "text-neutral-900 text-xs font-semibold" : "text-slate-900 text-xs font-semibold"}>
        {cat}
      </Text>
    </LinearGradient>
  );
}

/* ===================== Componente principal ===================== */

export default function VisualizacionesSugeridasCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const metrics = useMemo(() => computeCompoundMetrics(registros), [registros]);
  const sugs = useMemo(() => generateCompoundSuggestions(metrics), [metrics]);
  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);
  const plan = useMemo(() => buildNextCompoundPlan(metrics), [metrics]);

  const hasData = metrics.nSets > 0 && (metrics.totalReps > 0 || metrics.totalVol > 0);

  const marcoColors = isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"];

  if (!hasData) {
    return (
      <View className="w-full">
        <LinearGradient colors={marcoColors as any} className="rounded-2xl p-[1px]">
          <View
            className={
              "rounded-2xl px-5 py-6 shadow-md " +
              (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
            }
          >
            <Text className={isDark ? "text-[#94a3b8] text-sm text-center" : "text-neutral-600 text-sm text-center"}>
              Registra al menos 1 sesión compuesta con peso y repeticiones para ver sugerencias.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View accessibilityLabel="Sugerencias inteligentes (compuestos)" className="w-full">
      {/* Marco degradado */}
      <LinearGradient colors={marcoColors as any} className="rounded-2xl p-[2px]" style={{ borderRadius: 15, overflow: "hidden" }}>
        {/* Panel */}
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>
              Sugerencias personalizadas (compuestos)
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Sets: <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>{metrics.nSets}</Text> · Volumen:{" "}
              <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>
                {Math.round(metrics.totalVol)} {unit}·reps
              </Text>
            </Text>
          </View>

          {/* Cuerpo */}
          <View className="px-5 pb-5">
            {/* Grupos por categoría */}
            <View className="gap-5">
              {Object.entries(byCat).map(([cat, textos]) => (
                <View
                  key={cat}
                  className={
                    "rounded-xl px-4 py-3 " +
                    (isDark ? "bg-white/5 border border-white/10" : "bg-white/80 border border-white/60")
                  }
                >
                  <View className="mb-2">
                    <CatBadgeCompuestos cat={cat as SugCat} isDark={isDark} />
                  </View>
                  <View className="gap-2">
                    {(textos as string[]).map((t, i) => (
                      <View key={`${cat}-${i}`} className="flex-row items-start gap-2">
                        <View className="mt-[3px] h-2 w-2 rounded-full bg-slate-400" />
                        <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Plan próximo entrenamiento */}
            <View
              className={
                "mt-5 rounded-xl px-4 py-4 " +
                (isDark ? "bg-white/5 border border-white/10" : "bg-white/80 border border-white/60")
              }
            >
              <Text className={isDark ? "text-[#94a3b8] text-[11px] font-semibold" : "text-neutral-500 text-[11px] font-semibold"}>
                PLAN SUGERIDO (PRÓXIMA SESIÓN)
              </Text>
              <View className="mt-2 gap-1.5">
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Calentamiento: {plan.warmup}
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Sets de trabajo: {plan.workRange}
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Progresión: {plan.progression}
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Descanso: {plan.rest} entre sets.
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Notas: {plan.notes}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
