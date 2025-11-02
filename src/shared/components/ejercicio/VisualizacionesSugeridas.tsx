import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* ---------------- Tipos ---------------- */
type Serie = {
  pesoKg: number | null;
  repeticiones: number | null;
};
type Sug = { cat: "Carga" | "Volumen" | "Técnica" | "Recuperación" | "Progresión"; text: string };
type Props = { detallesSeries: Serie[] };

/* ---------------- Badge por categoría ---------------- */
function CatBadge({ cat, isDark }: { cat: Sug["cat"]; isDark: boolean }) {
  const map: Record<Sug["cat"], [string, string]> = {
    Carga: ["#e2e8f0", "#cbd5e1"],        // slate-200->300
    Volumen: ["#bfdbfe", "#93c5fd"],      // blue-200->300
    Técnica: ["#a7f3d0", "#6ee7b7"],      // emerald-200->300
    Recuperación: ["#e9d5ff", "#d8b4fe"], // purple-200->300
    Progresión: ["#fde68a", "#fcd34d"],   // amber-200->300
  };
  const [c1, c2] = map[cat];
  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="self-start rounded-full px-2.5 py-1"
    >
      <Text className={isDark ? "text-neutral-900 text-xs font-semibold" : "text-slate-900 text-xs font-semibold"}>
        {cat}
      </Text>
    </LinearGradient>
  );
}

/* ---------------- Componente ---------------- */
export default function VisualizacionesSugeridas({ detallesSeries }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const sets = useMemo(() => (detallesSeries?.filter(Boolean) ?? []), [detallesSeries]);
  const n = sets.length;

  // Métricas base
  const repsArr = useMemo(() => sets.map((s) => Number(s.repeticiones ?? 0)), [sets]);
  const weightArr = useMemo(() => sets.map((s) => Number(s.pesoKg ?? 0)), [sets]);

  const totalReps = useMemo(() => repsArr.reduce((a, b) => a + b, 0), [repsArr]);
  const totalVol = useMemo(
    () => sets.reduce((sum, s) => sum + Number(s.pesoKg ?? 0) * Number(s.repeticiones ?? 0), 0),
    [sets]
  );
  const avgReps = n ? totalReps / n : 0;
  const avgWPerRep = totalReps ? totalVol / totalReps : 0;
  const maxW = Math.max(0, ...weightArr);
  const minW = Math.max(0, Math.min(...weightArr));
  const firstReps = repsArr[0] ?? 0;
  const lastReps = repsArr[n - 1] ?? 0;
  const fatigueDrop = firstReps ? 1 - lastReps / firstReps : 0; // 0–1

  // Variabilidad
  const std = (arr: number[]) => {
    const m = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length || 1);
    return Math.sqrt(v);
  };
  const repsStd = std(repsArr);
  const weightStd = std(weightArr);
  const cvReps = avgReps ? repsStd / avgReps : 0;
  const cvWeight = avgWPerRep ? weightStd / avgWPerRep : 0; // (se calcula aunque no se muestra directamente)

  // Tendencia de carga (regresión lineal simple)
  const slopeW = useMemo(() => {
    if (n < 2) return 0;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = weightArr;
    const xm = x.reduce((a, b) => a + b, 0) / n;
    const ym = y.reduce((a, b) => a + b, 0) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - xm) * (y[i] - ym);
      den += (x[i] - xm) ** 2;
    }
    return den ? num / den : 0;
  }, [n, weightArr]);

  // Zona de repeticiones
  const zone = avgReps < 6 ? "fuerza" : avgReps <= 12 ? "hipertrofia" : "resistencia";

  // --- Generador de sugerencias ---
  const sugs: Sug[] = [];

  // Volumen
  if (totalReps < 24) {
    sugs.push({
      cat: "Volumen",
      text: "Considera subir el volumen: añade 1 set o +2–3 repeticiones por set para un estímulo más consistente.",
    });
  } else {
    sugs.push({
      cat: "Volumen",
      text: "Buen volumen total. Mantén la densidad controlando descansos para preservar la calidad de repeticiones.",
    });
  }

  // Carga promedio por rep
  if (avgWPerRep < 50) {
    sugs.push({
      cat: "Carga",
      text: "Puedes desafiarte un poco más: prueba un incremento pequeño (≈ +2.5–5%) en la próxima sesión si la técnica se mantiene sólida.",
    });
  } else if (avgWPerRep > 80) {
    sugs.push({
      cat: "Carga",
      text: "Estás trabajando pesado. Cuida la técnica y considera micro-cargas (+1–2.5%) para progresar sin sobrecarga articular.",
    });
  }

  // Tendencia de carga
  if (slopeW > 0.5) {
    sugs.push({
      cat: "Progresión",
      text: "Tendencia ascendente de carga entre sets: excelente autoregulación. Mantén incrementos pequeños para sostener el progreso.",
    });
  } else if (slopeW < -0.5) {
    sugs.push({
      cat: "Progresión",
      text: "La carga cae entre sets. Evalúa alargar descansos (+30–60s) o empezar con una carga apenas más conservadora.",
    });
  } else {
    sugs.push({
      cat: "Progresión",
      text: "Carga estable. Prueba progresión lineal: +2.5% en el primer set y sostén repeticiones objetivo.",
    });
  }

  // Fatiga
  if (fatigueDrop > 0.35) {
    sugs.push({
      cat: "Recuperación",
      text: "Fatiga alta entre el primer y último set. Aumenta el descanso, usa series escalonadas o reduce un 2–5% la carga media.",
    });
  } else if (fatigueDrop < 0.15 && n >= 3) {
    sugs.push({
      cat: "Progresión",
      text: "Poca caída de repeticiones: margen para progresar. Añade 1–2 reps en el set final o sube levemente la carga.",
    });
  }

  // Variabilidad/consistencia
  if (cvReps > 0.25) {
    sugs.push({
      cat: "Técnica",
      text: "Variación grande en repeticiones. Estandariza tempo (ej. 2-0-2) y rango para mejorar consistencia y comparabilidad.",
    });
  } else {
    sugs.push({
      cat: "Técnica",
      text: "Buena consistencia en repeticiones. Mantén el mismo rango y tempo para medir el progreso con precisión.",
    });
  }

  // Zona de reps
  if (zone === "fuerza") {
    sugs.push({
      cat: "Progresión",
      text: "Zona de fuerza (<6 reps): prioriza descansos largos (2–3 min) y técnica perfecta; añade micro-cargas cuando consolides el rango.",
    });
  } else if (zone === "hipertrofia") {
    sugs.push({
      cat: "Progresión",
      text: "Zona de hipertrofia (6–12): excelente. Apunta a progresión doble (sube reps hasta tope y luego aumenta carga).",
    });
  } else {
    sugs.push({
      cat: "Progresión",
      text: "Zona de resistencia (>12): si buscas masa muscular, prueba bajar reps a 8–12 con una carga algo mayor.",
    });
  }

  // Volumen alto
  if (totalVol > 1000) {
    sugs.push({
      cat: "Recuperación",
      text: "Volumen elevado. Prioriza sueño, hidratación y 24–48h antes de volver a estimular el mismo grupo muscular.",
    });
  }

  // Máximos y sets
  if (maxW === minW && n >= 3) {
    sugs.push({
      cat: "Progresión",
      text: "Todos los sets al mismo peso. Prueba onda simple: Set1 pesado, Set2 −5%, Set3 −10% para calidad y exposición a carga.",
    });
  } else if (maxW - minW >= 10) {
    sugs.push({
      cat: "Técnica",
      text: "Gran diferencia de carga entre sets. Estabiliza 2–3 sesiones en un esquema cercano para afianzar técnica y adaptación.",
    });
  }

  // Sugerencias extra
  sugs.push(
    { cat: "Técnica", text: "Pista técnica: fija escápulas, controla el excéntrico y evita rebotes para proteger articulaciones." },
    { cat: "Recuperación", text: "Incluye 5–10 min de movilidad/activación previa y 5 min de descarga al final para acelerar recuperación." },
    { cat: "Progresión", text: "Plan rápido próxima sesión: +1–2 reps en el último set o +2.5% en el primero si finalizas con RIR≥2." }
  );

  // Sin datos suficientes
  if (!n || (!totalReps && !totalVol)) {
    return (
      <View className="w-full">
        <LinearGradient
          colors={isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"]}
          className="rounded-2xl p-[1px]"
        >
          <View
            className={
              "rounded-2xl px-5 py-6 shadow-md " +
              (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
            }
          >
            <Text className={isDark ? "text-[#94a3b8] text-sm text-center" : "text-neutral-600 text-sm text-center"}>
              Aún no hay suficientes datos para generar sugerencias. Registra al menos 1 sesión con peso y repeticiones.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Agrupar por categoría
  const byCat = sugs.reduce<Record<Sug["cat"], string[]>>((acc, s) => {
    (acc[s.cat] ||= []).push(s.text);
    return acc;
  }, {} as any);

  const marcoColors = isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"];

  return (
    <View accessibilityLabel="Sugerencias inteligentes" className="w-full">
      {/* Marco degradado */}
      <LinearGradient colors={marcoColors as any} className="rounded-2xl p-[2px]"
        style={{ borderRadius: 15, overflow: "hidden" }}
      >
        {/* Panel glass */}
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>
              Sugerencias personalizadas
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Sets: <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>{n}</Text> · Volumen:{" "}
              <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>
                {totalVol.toFixed(1)} kg
              </Text>
            </Text>
          </View>

          {/* Grupos por categoría */}
          <View className="px-5 pb-5">
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
                    <CatBadge cat={cat as Sug["cat"]} isDark={isDark} />
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
                  • Calentamiento: 2 sets de aproximación (40% y 60% de la carga objetivo).
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Sets de trabajo: 3–4 en rango {zone === "hipertrofia" ? "8–12" : zone === "fuerza" ? "3–6" : "12–15+"} reps.
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Progresión: si terminas con RIR ≥ 2, añade +1–2 reps o +2.5% carga al primer set.
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Descanso: {zone === "fuerza" ? "2–3 min" : zone === "hipertrofia" ? "90–120 s" : "60–90 s"} entre sets.
                </Text>
                <Text className={isDark ? "text-[#e5e7eb] text-sm" : "text-neutral-700 text-sm"}>
                  • Notas: registra tempo y rango para evaluar consistencia la próxima vez.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
