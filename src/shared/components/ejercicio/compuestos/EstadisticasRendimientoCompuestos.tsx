import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

/**
 * EstadisticasRendimientoCompuestos
 * Calcula métricas de una sesión compuesta a partir de registros planos:
 *   - total de sets (series únicas)
 *   - total de repeticiones
 *   - volumen total (peso * reps)
 *   - peso promedio por rep
 *   - reps promedio por set
 *   - peso máximo y reps máximas
 *   - número de ejercicios en la sesión
 *
 * Espera la misma forma de datos que ya normalizaste en el panel:
 * [{ serieNumero, ejercicioId, nombre, pesoKg, repeticiones, duracionSegundos }]
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

type Props = {
  registros: RegistroPlanoCompuesto[];
};

export default function EstadisticasRendimientoCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const stats = useMemo(() => {
    const regs = registros ?? [];
    const setsUnicos = new Set<number>();
    const ejerciciosUnicos = new Set<number>();

    let totalReps = 0;
    let volumenTotal = 0; // peso * reps
    let maxPeso = 0;
    let maxReps = 0;

    for (const r of regs) {
      setsUnicos.add(r.serieNumero);
      ejerciciosUnicos.add(r.ejercicioId);

      const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
      const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;

      totalReps += reps;
      volumenTotal += peso * reps;

      if (peso > maxPeso) maxPeso = peso;
      if (reps > maxReps) maxReps = reps;
    }

    const totalSeries = setsUnicos.size;
    const pesoPromedioPorRep = totalReps ? volumenTotal / totalReps : 0;
    const repsPromedioPorSet = totalSeries ? totalReps / totalSeries : 0;
    const ejerciciosSesion = ejerciciosUnicos.size;

    return {
      totalSeries,
      totalReps,
      volumenTotal,
      pesoPromedioPorRep,
      repsPromedioPorSet,
      maxPeso,
      maxReps,
      ejerciciosSesion,
    };
  }, [registros]);

  const items = [
    { label: "Sets", value: stats.totalSeries, suffix: "" },
    { label: "Reps totales", value: stats.totalReps, suffix: "" },
    { label: "Volumen total", value: Math.round(stats.volumenTotal), suffix: ` ${unit}·reps` },
    { label: "Peso promedio / rep", value: stats.pesoPromedioPorRep.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps promedio / set", value: stats.repsPromedioPorSet.toFixed(1), suffix: "" },
    { label: "Peso máximo", value: stats.maxPeso.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps máximas", value: stats.maxReps, suffix: "" },
    { label: "Ejercicios en sesión", value: stats.ejerciciosSesion, suffix: "" },
  ];

  const hasData =
    stats.totalSeries > 0 && (stats.totalReps > 0 || stats.volumenTotal > 0);

  const marcoColors = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"]
    : ["#39ff14", "#14ff80", "#22c55e"];

  return (
    <View accessibilityLabel="Estadísticas de rendimiento (compuestos)" className="w-full">
      {/* Marco degradado */}
      <LinearGradient
        colors={marcoColors as any}
        className="rounded-2xl p-[2px]"
        style={{ borderRadius: 15, overflow: "hidden" }}
      >
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
              Resumen del rendimiento (compuestos)
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Unidad:{" "}
              <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>
                {unit}
              </Text>
            </Text>
          </View>

          {/* Contenido */}
          <View className="px-4 pb-5">
            {hasData ? (
              <View className="flex-row flex-wrap gap-3">
                {items.map((it) => (
                  <View
                    key={it.label}
                    className={
                      "rounded-xl px-4 py-3 " +
                      (isDark ? "bg-white/5 border border-white/10" : "bg-white/80 border border-white/60")
                    }
                    style={{ width: "48%" }} // 2 columnas responsivas
                    accessibilityLabel={`${it.label}: ${it.value}${it.suffix}`}
                  >
                    <Text
                      className={
                        isDark
                          ? "text-[#94a3b8] text-[11px] font-semibold"
                          : "text-neutral-500 text-[11px] font-semibold"
                      }
                    >
                      {it.label}
                    </Text>
                    <Text
                      className={
                        isDark
                          ? "text-white text-xl font-extrabold mt-1"
                          : "text-slate-900 text-xl font-extrabold mt-1"
                      }
                    >
                      {it.value}
                      <Text
                        className={
                          isDark
                            ? "text-[#94a3b8] text-xs font-semibold ml-1"
                            : "text-neutral-500 text-xs font-semibold ml-1"
                        }
                      >
                        {it.suffix}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="h-24 items-center justify-center">
                <Text className={isDark ? "text-[#94a3b8] text-sm" : "text-neutral-500 text-sm"}>
                  Aún no hay datos suficientes para calcular estadísticas.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
