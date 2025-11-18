// src/features/fit/components/IMCVisual.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* Rango visual del IMC */
const MIN_IMC = 15;
const MAX_IMC = 35;

/* Puntos clave de la OMS */
const CUTS = [18.5, 25, 30] as const;

/* Colores del track (segmentos) */
const COLORS = {
  azulClaro: "#60A5FA", // bajo peso
  verde: "#22C55E",     // normal
  amarillo: "#F59E0B",  // sobrepeso
  rojo: "#EF4444",      // obesidad
  trackBg: "#E5E7EB",
} as const;

type IMCVisualProps = {
  peso?: number | string | null;
  altura?: number | string | null; // en cm
};

export default function IMCVisual({ peso, altura }: IMCVisualProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const imcRaw = useMemo(() => {
    if (!peso || !altura) return null;
    const kg = Number(peso);
    const m = Number(altura) / 100;
    if (!Number.isFinite(kg) || !Number.isFinite(m) || m <= 0) return null;
    return kg / (m * m);
  }, [peso, altura]);

  const imc = useMemo(() => (imcRaw != null ? Number(imcRaw.toFixed(1)) : null), [imcRaw]);

  const getCategoria = (val: number) => {
    if (val < CUTS[0]) return { categoria: "Bajo peso", color: COLORS.azulClaro };
    if (val < CUTS[1]) return { categoria: "Peso normal", color: COLORS.verde };
    if (val < CUTS[2]) return { categoria: "Sobrepeso", color: COLORS.amarillo };
    return { categoria: "Obesidad", color: COLORS.rojo };
  };

  // Ancho del track con onLayout
  const [trackW, setTrackW] = useState<number>(280);
  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - trackW) > 0.5) setTrackW(w);
  }, [trackW]);

  // Posición del indicador en px
  const posPx = useMemo(() => {
    if (imc == null) return 0;
    const ratio = (imc - MIN_IMC) / (MAX_IMC - MIN_IMC);
    return Math.max(0, Math.min(ratio * trackW, trackW));
  }, [imc, trackW]);

  if (imc == null) {
    return <Text className="text-sm text-neutral-500">No hay datos suficientes para calcular el IMC.</Text>;
  }

  const { categoria, color } = getCategoria(imc);

  // Segmentos: [MIN, 18.5], [18.5, 25], [25, 30], [30, MAX]
  const seg = [MIN_IMC, CUTS[0], CUTS[1], CUTS[2], MAX_IMC];
  const spanTotal = MAX_IMC - MIN_IMC;
  const spans = [
    seg[1] - seg[0],
    seg[2] - seg[1],
    seg[3] - seg[2],
    seg[4] - seg[3],
  ].map((v) => Math.max(0, v));

  const widthsPct = spans.map((s) => (s / spanTotal) * 100);

  // 🎛️ Paleta glass en dark (un poco más claro que #0b1220)
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"]

  const cardBgDark = "rgba(20, 28, 44, 0.6)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const trackBgDark = "rgba(148,163,184,0.18)"; // base translúcida
  const trackRingDark = "rgba(255,255,255,0.10)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado: vibrante en light, discreto en dark */}
      <LinearGradient colors={marcoGradient as any} className="rounded-2xl p-[1px]"
                style={{ borderRadius: 15, overflow: "hidden" }}
              >
        {/* Card */}
        <View
          className="rounded-2xl shadow p-5"
          style={{
            backgroundColor: isDark ? cardBgDark : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
            borderRadius: 16,
          }}
        >
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between gap-3">
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              IMC actual
            </Text>
            <View
              className="px-2 py-1 rounded-md"
              style={{
                backgroundColor: isDark ? "rgba(148,163,184,0.16)" : "#f5f5f5",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
              >
                {categoria}
              </Text>
            </View>
          </View>

          {/* Barra + marker */}
          <View className="relative">
            {/* Indicador (burbuja + triangulito) */}
            <View
              className="absolute -top-7"
              style={{ left: 0, transform: [{ translateX: posPx }] }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <View className="items-center">
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: color,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                  }}
                >
                  <Text className="text-white text-xs font-bold">{imc}</Text>
                </View>
                <View
                  className="mt-[2px] h-2 w-2"
                  style={{ backgroundColor: color, transform: [{ rotate: "45deg" }], marginBottom: -3 }}
                />
              </View>
            </View>

            {/* Track */}
            <View
              onLayout={onTrackLayout}
              className="h-3 w-full rounded-full overflow-hidden"
              style={{
                backgroundColor: isDark ? trackBgDark : COLORS.trackBg,
                borderWidth: 1,
                borderColor: isDark ? trackRingDark : "#e5e7eb",
              }}
              accessibilityRole="progressbar"
              accessibilityLabel="Barra de IMC"
              accessibilityValue={{ min: MIN_IMC, max: MAX_IMC, now: imc }}
            >
              {/* 4 segmentos coloreados proporcionalmente */}
              <View className="flex-row h-full w-full">
                <View style={{ width: `${widthsPct[0]}%`, backgroundColor: COLORS.azulClaro }} />
                <View style={{ width: `${widthsPct[1]}%`, backgroundColor: COLORS.verde }} />
                <View style={{ width: `${widthsPct[2]}%`, backgroundColor: COLORS.amarillo }} />
                <View style={{ width: `${widthsPct[3]}%`, backgroundColor: COLORS.rojo }} />
              </View>

              {/* Línea vertical del IMC encima del track */}
              <View
                className="absolute top-0 bottom-0 w-[2px]"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)",
                  left: trackW ? `${(posPx / trackW) * 100}%` : "0%",
                }}
              />
            </View>

            {/* Ticks de referencia (18.5, 25, 30) */}
            <View className="relative mt-2 h-3">
              {CUTS.map((c, i) => {
                const x = ((c - MIN_IMC) / (MAX_IMC - MIN_IMC)) * 100;
                return (
                  <View
                    key={i}
                    className="absolute top-0 h-3 w-[1px]"
                    style={{
                      backgroundColor: isDark ? "rgba(148,163,184,0.5)" : "#d1d5db",
                      left: `${x}%`,
                      transform: [{ translateX: -0.5 }],
                    }}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                );
              })}
            </View>
          </View>

          {/* Leyenda inferior */}
          <View className="mt-3 flex-row justify-between">
            {["Bajo", "Normal", "Sobrepeso", "Obesidad"].map((t, i) => (
              <Text
                key={i}
                className="text-[11px]"
                style={{ color: isDark ? textSecondaryDark : "#52525b", textAlign: i === 0 ? "left" : i === 3 ? "right" : "center" as any }}
              >
                {t}
              </Text>
            ))}
          </View>

          {/* Texto auxiliar */}
          <Text
            className="mt-3 text-[12px]"
            style={{ color: isDark ? textSecondaryDark : "#374151" }}
          >
            Resultado IMC:{" "}
            <Text style={{ color: isDark ? textPrimaryDark : "#0f172a", fontWeight: "800" }}>{imc}</Text>{" "}
            → categoría <Text style={{ color, fontWeight: "700" }}>{categoria}</Text>.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
