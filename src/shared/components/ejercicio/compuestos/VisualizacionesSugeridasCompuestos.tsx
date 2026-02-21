import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type RegistroPlanoCompuesto = {
  serieNumero: number;
  ejercicioId: number;
  nombre: string;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
};

type Props = { registros: RegistroPlanoCompuesto[] };

type Metrics = {
  nSets: number;
  nEjercicios: number;
  totalReps: number;
  totalVol: number;
  volPorEjercicio: Array<{ ejercicioId: number; nombre: string; vol: number; reps: number }>;
  balanceIndice: number;
  pesoPromedioPorRep: number;
};

type SugCat = "Carga" | "Volumen" | "Técnica" | "Recuperación" | "Progresión";
type Sug = { cat: SugCat; text: string };

/* ================= METRICS (FIX) ================= */
function computeCompoundMetrics(regs: RegistroPlanoCompuesto[]): Metrics {
  // ✅ FILTRAR SOLO REGISTROS REALES
  const valid = regs.filter(
    (r) =>
      (typeof r.repeticiones === "number" && r.repeticiones > 0) ||
      (typeof r.duracionSegundos === "number" && r.duracionSegundos > 0)
  );

  const sets = new Set<number>();
  const volMap = new Map<number, { nombre: string; vol: number; reps: number }>();

  let totalReps = 0;
  let totalVol = 0;

  for (const r of valid) {
    sets.add(r.serieNumero);

    const reps =
      typeof r.repeticiones === "number"
        ? r.repeticiones
        : typeof r.duracionSegundos === "number"
          ? r.duracionSegundos
          : 0;

    const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
    const vol = peso * reps;

    totalReps += reps;
    totalVol += vol;

    const prev = volMap.get(r.ejercicioId);
    if (prev) {
      prev.vol += vol;
      prev.reps += reps;
    } else {
      volMap.set(r.ejercicioId, { nombre: r.nombre, vol, reps });
    }
  }

  const volPorEjercicio = Array.from(volMap, ([ejercicioId, v]) => ({
    ejercicioId,
    nombre: v.nombre,
    vol: v.vol,
    reps: v.reps,
  })).sort((a, b) => b.vol - a.vol);

  let balanceIndice = 1;
  if (volPorEjercicio.length > 1) {
    const vols = volPorEjercicio.map((v) => v.vol);
    const max = Math.max(...vols);
    const min = Math.min(...vols);
    balanceIndice = max === 0 ? 1 : 1 - (max - min) / max;
  }

  const pesoPromedioPorRep = totalReps ? totalVol / totalReps : 0;

  return {
    nSets: sets.size,
    nEjercicios: volMap.size,
    totalReps,
    totalVol,
    volPorEjercicio,
    balanceIndice,
    pesoPromedioPorRep,
  };
}

/* ================= SUGERENCIAS ================= */
function generateCompoundSuggestions(m: Metrics): Sug[] {
  if (m.totalReps === 0 && m.totalVol === 0) return []; // ✅ FIX CLAVE

  const out: Sug[] = [];

  if (m.totalVol < 300) {
    out.push({ cat: "Volumen", text: "Volumen bajo: añade 1 set o sube ligeramente la carga." });
  } else if (m.totalVol > 1500) {
    out.push({ cat: "Recuperación", text: "Volumen alto: vigila fatiga y añade descanso." });
  }

  if (m.balanceIndice < 0.6 && m.volPorEjercicio.length > 1) {
    const top = m.volPorEjercicio[0];
    const low = m.volPorEjercicio[m.volPorEjercicio.length - 1];
    out.push({
      cat: "Técnica",
      text: `Desbalance: ${top.nombre} tiene mucho más volumen que ${low.nombre}.`,
    });
  } else {
    out.push({
      cat: "Progresión",
      text: "Buen balance: usa progresión doble (reps → peso).",
    });
  }

  if (m.pesoPromedioPorRep < 15) {
    out.push({ cat: "Carga", text: "Carga ligera: puedes subir peso manteniendo técnica." });
  }

  return out;
}

function groupByCategory(sugs: Sug[]): Record<SugCat, string[]> {
  return sugs.reduce((acc, s) => {
    (acc[s.cat] ||= []).push(s.text);
    return acc;
  }, {} as Record<SugCat, string[]>);
}

/* ================= COMPONENT ================= */

export default function VisualizacionesSugeridasCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const metrics = useMemo(() => computeCompoundMetrics(registros), [registros]);
  const sugs = useMemo(() => generateCompoundSuggestions(metrics), [metrics]);
  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);

  const hasData = metrics.totalReps > 0 || metrics.totalVol > 0;

  const marcoColors = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"]
    : ["#39ff14", "#14ff80", "#22c55e"];

  if (!hasData) {
    return (
      <View className="w-full">
        <LinearGradient colors={marcoColors as any} className="rounded-2xl p-[1px]">
          <View className="rounded-2xl px-5 py-6">
            <Text className="text-sm text-center opacity-70">
              Aún no hay datos suficientes para generar sugerencias.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="w-full">
      <LinearGradient colors={marcoColors as any} className="rounded-2xl p-[2px]">
        <View className="rounded-2xl px-5 py-5">
          <Text className="font-semibold mb-3">
            Sugerencias (compuestos) · {Math.round(metrics.totalVol)} {unit}·reps
          </Text>

          {Object.entries(byCat).map(([cat, textos]) => (
            <View key={cat} className="mb-4">
              <Text className="font-semibold mb-1">{cat}</Text>
              {textos.map((t, i) => (
                <Text key={i} className="opacity-80 text-sm">
                  • {t}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}