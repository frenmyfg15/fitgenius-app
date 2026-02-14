import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import {
  computeMetrics,
  generateSuggestions,
  groupByCategory,
  buildNextSessionPlan,
  type Sug,
  type Serie,
} from "@/shared/lib/sugerencias";

/* ---------------- Props ---------------- */
type Props = {
  detallesSeries: Serie[];
  // indica si el ejercicio es CARDIO
  esCardio?: boolean;
};

/* ---------------- Badge por categoría (UI) ---------------- */
function CatBadge({ cat, isDark }: { cat: Sug["cat"]; isDark: boolean }) {
  const map: Record<Sug["cat"], [string, string]> = {
    Carga: ["#e2e8f0", "#cbd5e1"], // slate-200->300
    Volumen: ["#bfdbfe", "#93c5fd"], // blue-200->300
    Técnica: ["#a7f3d0", "#6ee7b7"], // emerald-200->300
    Recuperación: ["#e9d5ff", "#d8b4fe"], // purple-200->300
    Progresión: ["#fde68a", "#fcd34d"], // amber-200->300
  };
  const [c1, c2] = map[cat];
  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="self-start rounded-full px-2.5 py-1"
    >
      <Text className={(isDark ? "text-neutral-900" : "text-slate-900") + " text-xs font-semibold"}>
        {cat}
      </Text>
    </LinearGradient>
  );
}

/* ---------------- Componente (UI) ---------------- */
export default function VisualizacionesSugeridas({ detallesSeries, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isCardio = Boolean(esCardio);

  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toLowerCase(); // "kg" | "lb"

  // ---- LÓGICA (viene toda del lib) ----
  const metrics = useMemo(() => computeMetrics(detallesSeries), [detallesSeries]);

  // 👇 aquí activamos las sugerencias específicas para cardio
  const sugs = useMemo(() => generateSuggestions(metrics, { esCardio }), [metrics, esCardio]);

  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);
  const plan = useMemo(() => buildNextSessionPlan(metrics.zone), [metrics.zone]);

  // Colors del borde degradado (igual que en el resto de componentes)
  const marcoBorder = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  const hasData = metrics.n && (metrics.totalReps || metrics.totalVol);

  // Sin datos suficientes
  if (!hasData) {
    return (
      <View className="w-full">
        <LinearGradient
          colors={marcoBorder as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-[2px]"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View
            className={
              "rounded-2xl px-5 py-6 shadow-md " +
              (isDark ? "bg-[#020617] border border-white/10" : "bg-white border border-slate-100")
            }
          >
            <Text className={(isDark ? "text-slate-400" : "text-neutral-600") + " text-sm text-center"}>
              {isCardio
                ? "Aún no hay suficientes datos para generar sugerencias. Registra al menos 1 sesión con tiempo en segundos."
                : "Aún no hay suficientes datos para generar sugerencias. Registra al menos 1 sesión con peso y repeticiones."}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const headerSubtitle = isCardio ? (
    <>
      Sets:{" "}
      <Text className={(isDark ? "text-slate-50" : "text-slate-700") + " font-medium"}>{metrics.n}</Text>{" "}
      · Tiempo total:{" "}
      <Text className={(isDark ? "text-slate-50" : "text-slate-700") + " font-medium"}>
        {metrics.totalReps.toFixed(0)} s
      </Text>
      {/* Si hay volumen (cardio con carga), lo mostramos extra */}
      {metrics.totalVol > 0 && (
        <>
          {" "}
          · Volumen:{" "}
          <Text className={(isDark ? "text-slate-50" : "text-slate-700") + " font-medium"}>
            {metrics.totalVol.toFixed(1)} {weightUnit}
          </Text>
        </>
      )}
    </>
  ) : (
    <>
      Sets:{" "}
      <Text className={(isDark ? "text-slate-50" : "text-slate-700") + " font-medium"}>{metrics.n}</Text>{" "}
      · Volumen:{" "}
      <Text className={(isDark ? "text-slate-50" : "text-slate-700") + " font-medium"}>
        {metrics.totalVol.toFixed(1)} {weightUnit}
      </Text>
    </>
  );

  return (
    <View accessibilityLabel="Sugerencias inteligentes" className="w-full mt-6">
      {/* Marco degradado */}
      <LinearGradient
        colors={marcoBorder as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[2px]"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        {/* Panel */}
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark ? "bg-[#020617] border border-white/10" : "bg-white border border-slate-100")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className={(isDark ? "text-slate-50" : "text-slate-900") + " font-semibold"}>
              Sugerencias personalizadas
            </Text>
            <Text className={(isDark ? "text-slate-400" : "text-neutral-500") + " text-[11px]"}>
              {headerSubtitle}
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
                    (isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200")
                  }
                >
                  <View className="mb-2">
                    <CatBadge cat={cat as Sug["cat"]} isDark={isDark} />
                  </View>
                  <View className="gap-2">
                    {(textos as string[]).map((t, i) => (
                      <View key={`${cat}-${i}`} className="flex-row items-start gap-2">
                        <View className="mt-[5px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
                          {t}
                        </Text>
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
                (isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200")
              }
            >
              <Text className={(isDark ? "text-slate-400" : "text-neutral-500") + " text-[11px] font-semibold"}>
                PLAN SUGERIDO (PRÓXIMA SESIÓN)
              </Text>
              <View className="mt-2 gap-1.5">
                <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
                  • Calentamiento: {plan.warmup}
                </Text>
                <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
                  • Sets de trabajo: {plan.workRange}
                </Text>
                <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
                  • Progresión: {plan.progression}
                </Text>
                <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
                  • Descanso: {plan.rest} entre sets.
                </Text>
                <Text className={(isDark ? "text-slate-100" : "text-neutral-700") + " text-sm"}>
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
