import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

import {
  computeMetrics,
  generateSuggestions,
  groupByCategory,
  buildNextSessionPlan,
  type Sug,
  type Serie,
} from "@/shared/lib/sugerencias";

/* ---------------- Props ---------------- */
type Props = { detallesSeries: Serie[] };

/* ---------------- Badge por categoría (UI) ---------------- */
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

/* ---------------- Componente (UI) ---------------- */
export default function VisualizacionesSugeridas({ detallesSeries }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ---- LÓGICA (viene toda del lib) ----
  const metrics = useMemo(() => computeMetrics(detallesSeries), [detallesSeries]);
  const sugs = useMemo(() => generateSuggestions(metrics), [metrics]);
  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);
  const plan = useMemo(() => buildNextSessionPlan(metrics.zone), [metrics.zone]);

  // Sin datos suficientes
  if (!metrics.n || (!metrics.totalReps && !metrics.totalVol)) {
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

  // Colores del marco (UI)
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
              Sets: <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>{metrics.n}</Text> · Volumen:{" "}
              <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>
                {metrics.totalVol.toFixed(1)} kg
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
