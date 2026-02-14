// src/features/fit/components/PesoIdeal.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/** Geometría del anillo */
const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type UnidadPeso = "KG" | "LB";
type UnidadAltura = "CM" | "FT";

type PesoIdealProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  medidaPeso?: UnidadPeso;
  medidaAltura?: UnidadAltura;
  soloGrafica?: boolean;
};

const KG_TO_LB = 2.2046226218;
const LB_TO_KG = 1 / KG_TO_LB;

export default function PesoIdeal({
  peso,
  altura,
  medidaPeso = "KG",
  medidaAltura = "CM",
  soloGrafica = false,
}: PesoIdealProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // 🎨 Paleta visual
  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "#fff";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";
  const fineStroke = isDark ? "#000000" : "#111827";
  const fineOpacity = isDark ? 0.25 : 0.15;

  const pesoNumOriginal = Number(peso ?? 0);
  const alturaNumOriginal = Number(altura ?? 0);

  // 🔁 Normalizamos a kg para el cálculo del IMC
  const pesoKg =
    medidaPeso === "LB" ? pesoNumOriginal * LB_TO_KG : pesoNumOriginal;

  // 🔁 Normalizamos altura SIEMPRE a metros de forma robusta
  const alturaM =
    alturaNumOriginal <= 0
      ? 0
      : medidaAltura === "CM"
      ? alturaNumOriginal / 100 // cm → m
      : // "FT"
        alturaNumOriginal <= 10
        ? alturaNumOriginal * 0.3048 // pies → m (ej: 5.8 ft)
        : alturaNumOriginal / 100; // valor grande: probablemente ya está en cm

  if (pesoKg <= 0 || alturaM <= 0) return null;

  // Rango ideal por IMC (18.5 - 24.9), siempre en kg
  const minIdealKg = 18.5 * alturaM * alturaM;
  const maxIdealKg = 24.9 * alturaM * alturaM;

  // Escala visual (en kg)
  const rangeMinKg = Math.max(0, minIdealKg * 0.85);
  const rangeMaxKg = maxIdealKg * 1.15;
  const rangeSpanKg = Math.max(1, rangeMaxKg - rangeMinKg);

  // Estado
  const { estado, isGradient } = useMemo(() => {
    if (pesoKg < minIdealKg) return { estado: "por debajo", isGradient: false };
    if (pesoKg > maxIdealKg) return { estado: "por encima", isGradient: false };
    return { estado: "en rango ideal", isGradient: true };
  }, [pesoKg, minIdealKg, maxIdealKg]);

  // Porcentajes (en kg, el gráfico no depende de la unidad visual)
  const pStart = Math.max(
    0,
    Math.min(1, (minIdealKg - rangeMinKg) / rangeSpanKg)
  );
  const pEnd = Math.max(
    0,
    Math.min(1, (maxIdealKg - rangeMinKg) / rangeSpanKg)
  );
  const pCurr = Math.max(
    0,
    Math.min(1, (pesoKg - rangeMinKg) / rangeSpanKg)
  );

  // Trazos
  const arcLen = C * (pEnd - pStart);
  const arcOffset = C * (1 - pEnd);

  // Marcador
  const angleDeg = pCurr * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;

  // 🔁 Valores mostrados en la UI según la unidad elegida
  const unidadPesoLabel = medidaPeso === "LB" ? "lb" : "kg";

  const pesoDisplay = pesoNumOriginal; // mostramos lo que el usuario entiende (kg o lb)
  const minIdealDisplay =
    medidaPeso === "LB" ? minIdealKg * KG_TO_LB : minIdealKg;
  const maxIdealDisplay =
    medidaPeso === "LB" ? maxIdealKg * KG_TO_LB : maxIdealKg;

  return (
    <View className="w-full max-w-[520px]">
      <LinearGradient
        colors={marcoGradient as any}
        className="rounded-2xl p-[1px]"
        style={{ borderRadius: 15, overflow: "hidden" }}
      >
        <View
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: cardBg,
            borderWidth: 0,
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: textPrimary,
              }}
            >
              Peso ideal
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isDark
                  ? "rgba(148,163,184,0.16)"
                  : "#f5f5f5",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: isGradient ? textPrimary : textSecondary,
                }}
              >
                {estado}
              </Text>
            </View>
          </View>

          {!soloGrafica && (
            <>
              {/* Métricas */}
              <View className="mt-3 grid grid-cols-3 gap-3">
                <Chip
                  label="Peso"
                  value={`${round1(pesoDisplay)} ${unidadPesoLabel}`}
                  isDark={isDark}
                />
                <Chip
                  label="Ideal min"
                  value={`${round1(minIdealDisplay)} ${unidadPesoLabel}`}
                  isDark={isDark}
                />
                <Chip
                  label="Ideal max"
                  value={`${round1(maxIdealDisplay)} ${unidadPesoLabel}`}
                  isDark={isDark}
                />
              </View>
            </>
          )}

          {/* Anillo */}
          <View className="mt-5 items-center justify-center">
            <View className="relative w-44 h-44">
              <Svg
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
              >
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={ringBase}
                  strokeWidth={12}
                  fill="transparent"
                />
                <Defs>
                  <SvgLinearGradient
                    id="neonLogoGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <Stop offset="0%" stopColor="rgb(0,255,64)" />
                    <Stop offset="50%" stopColor="rgb(94,230,157)" />
                    <Stop offset="100%" stopColor="rgb(178,0,255)" />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke="url(#neonLogoGradient)"
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={`${arcLen} ${C}`}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                />
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={fineStroke}
                  strokeOpacity={fineOpacity}
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray={`${2} ${C}`}
                />
                {/* Marcador */}
                <Circle
                  cx={CX + (R + 6) * Math.cos(angleRad)}
                  cy={CY + (R + 6) * Math.sin(angleRad)}
                  r={5.5}
                  fill="#ffffff"
                  stroke={isDark ? "rgba(0,0,0,0.35)" : "#111827"}
                  strokeWidth={1}
                />
              </Svg>

              {/* Centro */}
              <View className="absolute inset-0 items-center justify-center">
                <Text style={{ fontSize: 11, color: textSecondary }}>
                  Rango ideal
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: textPrimary,
                  }}
                >
                  {round1(minIdealDisplay)}–{round1(maxIdealDisplay)}{" "}
                  {unidadPesoLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Nota */}
          <Text
            style={{
              marginTop: 16,
              fontSize: 12,
              color: textSecondary,
            }}
          >
            Basado en IMC saludable (18.5–24.9) para tu altura. Úsalo como
            referencia general, no como diagnóstico.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Chip ---------- */
function Chip({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
        backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: isDark ? "#94a3b8" : "#6b7280",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontSize: 14,
          fontWeight: "700",
          color: isDark ? "#e5e7eb" : "#0f172a",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ---------- Util ---------- */
function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}
