import React, { useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Props = {
  series: {
    serieNumero: number;
    pesoKg: number | null;
  }[];
};

export default function GraficoPesoPorSerie({ series }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();
  const screenWidth = Dimensions.get("window").width - 32; // padding lateral

  const data = useMemo(() => {
    const puntos = (series ?? []).map((s) => Number(s.pesoKg ?? 0));
    const labels = (series ?? []).map((s) => `Set ${s.serieNumero}`);
    return { labels, datasets: [{ data: puntos }] };
  }, [series]);

  const hasValues = data.datasets[0].data.some((v) => v > 0);

  const marcoLight = ["#39ff14", "#14ff80", "#22c55e"];
  const marcoDark = ["#111a2b", "#0b1220", "#111a2b"];

  return (
    <View className="w-full mt-10">
      <LinearGradient colors={isDark ? marcoDark : marcoLight as any} className="rounded-2xl p-[2px]"
              style={{ borderRadius: 15, overflow: "hidden" }}
            >
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>
              Evolución de peso por serie
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Unidad: <Text className={isDark ? "text-white font-medium" : "text-slate-700 font-medium"}>{unit}</Text>
            </Text>
          </View>

          {/* Chart */}
          <View className="px-3 pb-4">
            {hasValues ? (
              <LineChart
                data={data}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: isDark ? "#0b1220" : "#ffffff",
                  backgroundGradientTo: isDark ? "#0b1220" : "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`),
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: isDark ? "#0b1220" : "#ffffff",
                  },
                }}
                bezier
                style={{
                  borderRadius: 16,
                }}
                fromZero
              />
            ) : (
              <View className="h-56 items-center justify-center">
                <Text className={isDark ? "text-[#94a3b8] text-sm" : "text-neutral-500 text-sm"}>
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
                      (isDark ? "border border-white/10 bg-white/5" : "border border-white/60 bg-white/80")
                    }
                  >
                    <Text className={isDark ? "text-white text-[12px] font-medium" : "text-slate-700 text-[12px] font-medium"}>
                      {label}:
                    </Text>
                    <View className={isDark ? "bg-white px-2 py-0.5 rounded-md" : "bg-neutral-900 px-2 py-0.5 rounded-md"}>
                      <Text className={isDark ? "text-neutral-900 text-[12px]" : "text-white text-[12px]"}>
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
