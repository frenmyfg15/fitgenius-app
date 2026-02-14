// src/shared/components/estadistica/AdherenciaConsistenciaCard.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  planificadas: number;
  completadas: number;
  adherencia: number;   // 0–100
  consistencia: number; // 0–100
};

export default function AdherenciaConsistenciaCard({
  planificadas,
  completadas,
  adherencia,
  consistencia,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // 🎨 Paleta & glass consistente
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDarkA = "rgba(20,28,44,0.85)";
  const cardBgDarkB = "rgba(9,14,24,0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const clamp = (v: number) =>
    Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const adhe = clamp(adherencia);
  const cons = clamp(consistencia);

  const kpis = useMemo(
    () => [
      {
        label: "Sesiones planificadas",
        value: planificadas,
        accent: "green" as const,
      },
      {
        label: "Sesiones completadas",
        value: completadas,
        accent: "purple" as const,
      },
    ],
    [planificadas, completadas]
  );

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado (borde) */}
      <LinearGradient
        colors={
          isDark
            ? (marcoGradient as any)
            : (["#39ff14", "#14ff80", "#22c55e"] as any)
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
      >
        {/* Fondo glassy en dark / blanco en light */}
        {isDark ? (
          <LinearGradient
            colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: cardBorderDark,
              overflow: "hidden",
            }}
          >
            <CardBody
              isDark
              kpis={kpis}
              adhe={adhe}
              cons={cons}
              textPrimaryDark={textPrimaryDark}
              textSecondaryDark={textSecondaryDark}
            />
          </LinearGradient>
        ) : (
          <View
            className="rounded-2xl"
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardBody
              isDark={false}
              kpis={kpis}
              adhe={adhe}
              cons={cons}
              textPrimaryDark={textPrimaryDark}
              textSecondaryDark={textSecondaryDark}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ----------------- Cuerpo ----------------- */

function CardBody({
  isDark,
  kpis,
  adhe,
  cons,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  kpis: { label: string; value: number; accent: "green" | "purple" }[];
  adhe: number;
  cons: number;
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  const textPrimary = isDark ? textPrimaryDark : "#0f172a";
  const textSecondary = isDark ? textSecondaryDark : "#64748b";

  const getLabel = (value: number) => {
    if (value >= 90) return "Excelente";
    if (value >= 75) return "Muy bien";
    if (value >= 50) return "En progreso";
    return "Por mejorar";
  };

  return (
    <View className="rounded-2xl">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: textPrimary }}
          >
            Progreso general
          </Text>
          <Text
            className="text-xs"
            style={{ color: textSecondary }}
          >
            Resumen de adherencia y consistencia
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-1.5">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: isDark ? "#22c55e" : "#16a34a",
              }}
            />
            <Text
              className="text-[11px]"
              style={{ color: textSecondary }}
            >
              Últimos días
            </Text>
          </View>
        </View>
      </View>

      {/* KPIs planificadas / completadas */}
      <View className="px-5 pb-3 flex-row gap-3">
        {kpis.map((k) => (
          <View key={k.label} className="flex-1">
            <Metric
              label={k.label}
              value={k.value}
              accent={k.accent}
              isDark={isDark}
            />
          </View>
        ))}
      </View>

      {/* Barras de adherencia y consistencia */}
      <View className="px-5 pb-4 gap-3">
        <ProgressRow
          isDark={isDark}
          label="Adherencia"
          value={adhe}
          description="Porcentaje de sesiones completadas sobre las planificadas."
          fromColor={isDark ? "#22c55e" : "#16a34a"}
          toColor={isDark ? "#a3e635" : "#4ade80"}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          labelRight={getLabel(adhe)}
        />

        <ProgressRow
          isDark={isDark}
          label="Consistencia"
          value={cons}
          description="Qué tan estable ha sido tu rutina semana a semana."
          fromColor={isDark ? "#a855f7" : "#8b5cf6"}
          toColor={isDark ? "#ec4899" : "#f97316"}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          labelRight={getLabel(cons)}
        />
      </View>

      {/* Nota inferior */}
      <View className="border-t px-5 pt-3 pb-4 border-white/5 border-slate-100">
        <Text
          className="text-[11px]"
          style={{ color: textSecondary }}
        >
          Intenta mantener una adherencia alta con una consistencia
          estable: es la combinación ideal para progresar y evitar
          altibajos extremos.
        </Text>
      </View>
    </View>
  );
}

/* ----------------- Subcomponentes ----------------- */

function Metric({
  label,
  value,
  accent,
  isDark,
}: {
  label: string;
  value: number;
  accent: "green" | "purple";
  isDark: boolean;
}) {
  const colorNum =
    accent === "green"
      ? isDark
        ? "#4ade80"
        : "#16a34a"
      : isDark
      ? "#a855f7"
      : "#7c3aed";

  return (
    <View
      className="rounded-xl px-4 py-3 border"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.7)",
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",
      }}
    >
      <Text
        className="text-xs"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {label}
      </Text>
      <Text
        className="mt-1 text-3xl font-extrabold leading-tight"
        style={{ color: colorNum }}
      >
        {value}
      </Text>
    </View>
  );
}

function ProgressRow({
  isDark,
  label,
  value,
  description,
  fromColor,
  toColor,
  textPrimary,
  textSecondary,
  labelRight,
}: {
  isDark: boolean;
  label: string;
  value: number;
  description: string;
  fromColor: string;
  toColor: string;
  textPrimary: string;
  textSecondary: string;
  labelRight: string;
}) {
  const pct = Math.max(4, Math.min(100, value));

  return (
    <View
      className="rounded-xl px-4 py-3 border"
      style={{
        backgroundColor: isDark
          ? "rgba(15,23,42,0.85)"
          : "rgba(248,250,252,0.9)",
        borderColor: isDark ? "rgba(148,163,184,0.25)" : "#e2e8f0",
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-sm font-medium"
          style={{ color: textPrimary }}
        >
          {label}
        </Text>
        <View className="items-end">
          <Text
            className="text-sm font-semibold"
            style={{ color: textPrimary }}
          >
            {value.toFixed(0)}%
          </Text>
          <Text
            className="text-[11px]"
            style={{ color: textSecondary }}
          >
            {labelRight}
          </Text>
        </View>
      </View>

      {/* Barra de progreso con gradiente */}
      <View className="mt-1 mb-2">
        <View
          className="h-2.5 rounded-full overflow-hidden"
          style={{
            backgroundColor: isDark
              ? "rgba(15,23,42,0.9)"
              : "#e5e7eb",
          }}
        >
          <LinearGradient
            colors={[fromColor, toColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 999,
            }}
          />
        </View>

        {/* Marcadores 0 / 50 / 100 */}
        <View className="flex-row justify-between mt-1">
          <Text
            className="text-[10px]"
            style={{ color: textSecondary }}
          >
            0%
          </Text>
          <Text
            className="text-[10px]"
            style={{ color: textSecondary }}
          >
            50%
          </Text>
          <Text
            className="text-[10px]"
            style={{ color: textSecondary }}
          >
            100%
          </Text>
        </View>
      </View>

      <Text
        className="text-[11px]"
        style={{ color: textSecondary }}
      >
        {description}
      </Text>
    </View>
  );
}
