import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Props = {
  detallesSeries: {
    pesoKg: number | null;
    repeticiones: number | null;
  }[];
};

export default function EstadisticasRendimiento({ detallesSeries }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();

  const {
    totalSeries,
    totalReps,
    totalPeso,
    pesoPromedio,
    repsPromedio,
    maxPeso,
    maxReps,
  } = useMemo(() => {
    const sets = detallesSeries ?? [];
    const totalSeries = sets.length;

    let totalReps = 0;
    let totalPeso = 0;
    let maxPeso = 0;
    let maxReps = 0;

    for (const s of sets) {
      const reps = Number(s.repeticiones ?? 0);
      const peso = Number(s.pesoKg ?? 0);
      totalReps += reps;
      totalPeso += peso * reps;
      if (peso > maxPeso) maxPeso = peso;
      if (reps > maxReps) maxReps = reps;
    }

    const pesoPromedio = totalReps ? totalPeso / totalReps : 0;
    const repsPromedio = totalSeries ? totalReps / totalSeries : 0;

    return { totalSeries, totalReps, totalPeso, pesoPromedio, repsPromedio, maxPeso, maxReps };
  }, [detallesSeries]);

  const items = [
    { label: "Sets", value: totalSeries, suffix: "" },
    { label: "Reps totales", value: totalReps, suffix: "" },
    { label: "Volumen total", value: totalPeso.toFixed(1), suffix: ` ${unit}` },
    { label: "Peso promedio / rep", value: pesoPromedio.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps promedio / set", value: repsPromedio.toFixed(1), suffix: "" },
    { label: "Peso máximo", value: maxPeso.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps máximas", value: maxReps, suffix: "" },
  ];

  const hasData = totalSeries > 0 && (totalReps > 0 || totalPeso > 0);

  const marcoColors = isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"];

  return (
    <View accessibilityLabel="Estadísticas de rendimiento" className="w-full">
      {/* Marco degradado elegante */}
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
              Resumen del rendimiento
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Unidad: <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>{unit}</Text>
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
                    <Text className={isDark ? "text-[#94a3b8] text-[11px] font-semibold" : "text-neutral-500 text-[11px] font-semibold"}>
                      {it.label}
                    </Text>
                    <Text
                      className={isDark ? "text-white text-xl font-extrabold mt-1" : "text-slate-900 text-xl font-extrabold mt-1"}
                    >
                      {it.value}
                      <Text className={isDark ? "text-[#94a3b8] text-xs font-semibold ml-1" : "text-neutral-500 text-xs font-semibold ml-1"}>
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
