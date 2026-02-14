// src/shared/components/ejercicio/GraficoPesoPorSerie.tsx
import React, { useMemo, useState } from "react";
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
  // 👇 NUEVO
  esCardio?: boolean;
};

export default function GraficoPesoPorSerie({ series, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const weightUnit =
    (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();

  const isCardio = Boolean(esCardio);
  const unit = isCardio ? "seg" : weightUnit;

  // Ancho del gráfico: medido en runtime para que no se salga del card
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && Math.abs(width - chartWidth) > 1) {
      setChartWidth(width);
    }
  };

  const data = useMemo(() => {
    const puntos = (series ?? []).map((s) =>
      Number(
        isCardio
          ? s.repeticiones ?? 0 // 👈 cardio: usamos "reps" como segundos
          : s.pesoKg ?? 0
      )
    );
    const labels = (series ?? []).map((s) => `Set ${s.serieNumero}`);
    return { labels, datasets: [{ data: puntos }] };
  }, [series, isCardio]);

  const hasValues = data.datasets[0].data.some((v) => v > 0);

  // Borde degradado consistente con el resto de la app
  const marcoBorder = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];

  const titulo = isCardio
    ? "Evolución de tiempo por serie"
    : "Evolución de peso por serie";

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
              <View
                onLayout={handleLayout}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {chartWidth > 0 && (
                  <LineChart
                    data={data}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: isDark ? "#020617" : "#ffffff",
                      backgroundGradientTo: isDark ? "#020617" : "#ffffff",
                      decimalPlaces: 0,
                      color: (opacity = 1) =>
                        `rgba(34, 197, 94, ${opacity})`,
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
                    bezier
                    style={{
                      borderRadius: 16,
                      marginLeft: 0,
                      marginRight: 0,
                    }}
                    fromZero
                  />
                )}
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

          {/* Chips */}
          {data.labels.length > 0 && (
            <View className="px-4 pb-5">
              <View className="flex-row flex-wrap justify-center gap-2">
                {data.labels.map((label, i) => (
                  <View
                    key={label}
                    className={
                      "flex-row items-center gap-2 rounded-full px-3 py-1 " +
                      (isDark
                        ? "border border-white/10 bg-white/5"
                        : "border border-slate-200 bg-slate-50")
                    }
                  >
                    <Text
                      className={
                        (isDark ? "text-slate-50" : "text-slate-700") +
                        " text-[12px] font-medium"
                      }
                    >
                      {label}:
                    </Text>
                    <View
                      className={
                        (isDark ? "bg-slate-50" : "bg-slate-900") +
                        " px-2 py-0.5 rounded-md"
                      }
                    >
                      <Text
                        className={
                          (isDark ? "text-slate-900" : "text-slate-50") +
                          " text-[12px]"
                        }
                      >
                        {data.datasets[0].data[i]} {unit}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}
