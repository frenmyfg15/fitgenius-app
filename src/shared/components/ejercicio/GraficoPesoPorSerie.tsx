// src/shared/components/ejercicio/GraficoPesoPorSerie.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type SerieStats = {
  serieNumero: number;
  pesoKg: number | null;
  repeticiones?: number | null;
};

type Props = {
  series: SerieStats[];
  esCardio?: boolean;
};

export default function GraficoPesoPorSerie({ series, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const weightUnit =
    (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();

  const isCardioMode = Boolean(esCardio);
  const unit = isCardioMode ? "seg" : weightUnit;

  const [chartWidth, setChartWidth] = useState<number | null>(null);

  /** ✅ layout estable (evita spam reanimated) */
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (!w) return;
    setChartWidth((prev) => (prev === w ? prev : w));
  }, []);

  const data = useMemo(() => {
    const puntos = (series ?? []).map((s) =>
      Number(isCardioMode ? s.repeticiones ?? 0 : s.pesoKg ?? 0)
    );

    const labels = (series ?? []).map((s) => `Set ${s.serieNumero}`);

    return {
      labels,
      datasets: [{ data: puntos }],
    };
  }, [series, isCardioMode]);

  const hasValues = useMemo(
    () => data.datasets[0].data.some((v) => v > 0),
    [data]
  );

  const marcoBorder = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];

  const titulo = isCardioMode
    ? "Evolución de tiempo por serie"
    : "Evolución de peso por serie";

  /** ✅ Chart memoizado → reduce renders que disparan warning */
  const chart = useMemo(() => {
    if (!chartWidth || chartWidth < 40) return null;

    return (
      <LineChart
        key={chartWidth} // ⭐ hack importante chart-kit + reanimated
        data={data}
        width={chartWidth}
        height={220}
        fromZero
        bezier
        chartConfig={{
          backgroundGradientFrom: isDark ? "#020617" : "#ffffff",
          backgroundGradientTo: isDark ? "#020617" : "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
          labelColor: (opacity = 1) =>
            isDark
              ? `rgba(226,232,240,${opacity})`
              : `rgba(15,23,42,${opacity})`,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: isDark ? "#020617" : "#ffffff",
          },
        }}
        style={{ borderRadius: 16 }}
      />
    );
  }, [chartWidth, data, isDark]);

  return (
    <View className="w-full mt-6">
      <LinearGradient
        colors={marcoBorder as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[2px]"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark
              ? "bg-[#020617] border border-white/10"
              : "bg-white border border-slate-100")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text
              className={
                (isDark ? "text-slate-50" : "text-slate-900") +
                " font-semibold"
              }
            >
              {titulo}
            </Text>
            <Text
              className={
                (isDark ? "text-slate-400" : "text-neutral-500") +
                " text-[11px]"
              }
            >
              Unidad:{" "}
              <Text
                className={
                  (isDark ? "text-slate-50" : "text-slate-800") +
                  " font-medium"
                }
              >
                {unit}
              </Text>
            </Text>
          </View>

          {/* Chart */}
          <View className="px-4 pb-4">
            {hasValues ? (
              <View onLayout={handleLayout} style={{ borderRadius: 16 }}>
                {chart}
              </View>
            ) : (
              <View className="h-56 items-center justify-center">
                <Text
                  className={
                    (isDark ? "text-slate-400" : "text-neutral-500") +
                    " text-sm"
                  }
                >
                  Sin datos suficientes para el gráfico.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}