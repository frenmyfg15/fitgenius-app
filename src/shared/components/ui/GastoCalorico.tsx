// src/features/fit/components/GastoCalorico.tsx
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

const FACTORES: Record<string, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  "muy activo": 1.725,
};

const R = 64; // radio del anillo
const C = 2 * Math.PI * R;

type GastoCaloricoProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  edad?: number | string | null;
  sexo?: string | null;
  actividadInicial?: string | null; // ahora puede venir como SEDENTARIO, LIGERAMENTE_ACTIVO...
};

// 🔁 Helper para mapear el valor crudo a key + label legible
function mapActividad(actividadInicial?: string | null):
  | { key: keyof typeof FACTORES; label: string }
  | null {
  if (!actividadInicial) return null;

  const rawTrim = actividadInicial.trim();
  const upper = rawTrim.toUpperCase();

  // Nuevos enums
  switch (upper) {
    case "SEDENTARIO":
      return { key: "sedentario", label: "Sedentario" };
    case "LIGERAMENTE_ACTIVO":
      return { key: "ligero", label: "Ligeramente activo" };
    case "MODERADAMENTE_ACTIVO":
      return { key: "moderado", label: "Moderadamente activo" };
    case "MUY_ACTIVO":
      return { key: "muy activo", label: "Muy activo" };
  }

  // Soporte para valores antiguos tipo "sedentario", "ligero", "muy activo"...
  const lower = rawTrim.toLowerCase() as keyof typeof FACTORES;
  if (FACTORES[lower] != null) {
    const label = lower
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { key: lower, label };
  }

  return null;
}

export default function GastoCalorico({
  peso,
  altura,
  edad,
  sexo,
  actividadInicial,
}: GastoCaloricoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const actividad = useMemo(
    () => mapActividad(actividadInicial),
    [actividadInicial]
  );

  // 🎛️ Paleta glass en dark
  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBgDark = "rgba(20, 28, 44, 0.6)"; // un poco más claro que #0b1220
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const chipBgDark = "rgba(148,163,184,0.16)";
  const chipRingDark = "rgba(255,255,255,0.06)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  // TMB Mifflin–St Jeor (asume métricas)
  const tmb = useMemo(() => {
    if (!peso || !altura || !edad || !sexo) return null;
    const base =
      10 * Number(peso) + 6.25 * Number(altura) - 5 * Number(edad);
    return Math.round(
      sexo?.toLowerCase() === "masculino" ? base + 5 : base - 161
    );
  }, [peso, altura, edad, sexo]);

  const factor = useMemo(
    () => (actividad ? FACTORES[actividad.key] ?? 1.2 : null),
    [actividad]
  );

  const gasto = useMemo(() => {
    if (!tmb || !factor) return null;
    return Math.round(tmb * factor);
  }, [tmb, factor]);

  // Escala del anillo (cap suave para la UI, no para el cálculo)
  const maxRef = 4200;
  const pct = gasto ? Math.min(gasto / maxRef, 1) : 0;
  const dash = C * (1 - pct);

  // --------- Sin datos suficientes ----------
  if (!tmb || !actividad || !factor) {
    return (
      <View className="w-full max-w-[520px]">
        <LinearGradient
          colors={marcoGradient as any}
          className="rounded-2xl p-[1px]"
          style={{ borderRadius: 15, overflow: "hidden" }}
        >
          <View
            style={{
              borderRadius: 16,
              backgroundColor: isDark ? cardBgDark : "#ffffff",
              borderWidth: 1,
              borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
              padding: 20,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? textPrimaryDark : "#0f172a",
                }}
              >
                Gasto calórico diario
              </Text>
              <View
                style={{
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: isDark ? chipBgDark : "#f5f5f5",
                  borderWidth: 1,
                  borderColor: isDark ? chipRingDark : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: isDark ? textSecondaryDark : "#334155",
                  }}
                >
                  Datos insuficientes
                </Text>
              </View>
            </View>

            <Text
              style={{
                marginTop: 12,
                fontSize: 13,
                color: isDark ? textSecondaryDark : "#475569",
              }}
            >
              Completa tu{" "}
              <Text
                style={{
                  fontWeight: "700",
                  color: isDark ? textPrimaryDark : "#0f172a",
                }}
              >
                peso, altura, edad, sexo y nivel de actividad
              </Text>{" "}
              para estimar tu gasto calórico diario.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado coherente */}
      <LinearGradient
        colors={marcoGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1 }}
      >
        <View
          style={{
            borderRadius: 16,
            backgroundColor: isDark ? cardBgDark : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between gap-3">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
            >
              Gasto calórico diario
            </Text>

            {/* Chip solo lectura con la actividad actual */}
            <View
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? chipRingDark : "#e5e7eb",
                backgroundColor: isDark
                  ? "rgba(20,28,44,0.55)"
                  : "#f5f5f5",
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? textSecondaryDark : "#334155",
                }}
              >
                Actividad:{" "}
                <Text
                  style={{
                    fontWeight: "600",
                    color: isDark ? textPrimaryDark : "#0f172a",
                  }}
                >
                  {actividad.label}
                </Text>
              </Text>
            </View>
          </View>

          {/* Métricas rápidas */}
          <View className="mt-3 grid grid-cols-2 gap-3">
            <Metric
              label="Tasa basal (TMB)"
              value={`${tmb} kcal`}
              isDark={isDark}
            />
            <Metric
              label="Factor actividad"
              value={`× ${stripTrailingZeros(factor!)}`}
              isDark={isDark}
            />
          </View>

          {/* Anillo + texto */}
          <View className="mt-4 flex-row items-center gap-6">
            <View className="relative w-40 h-40">
              <Svg
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
                accessibilityLabel="Progreso de gasto calórico"
                role="img"
              >
                {/* Base */}
                <Circle
                  cx="90"
                  cy="90"
                  r={R}
                  stroke={isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb"}
                  strokeWidth={12}
                  fill="transparent"
                />
                {/* Degradado ring */}
                <Defs>
                  <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="rgb(0,255,64)" />
                    <Stop offset="50%" stopColor="rgb(94,230,157)" />
                    <Stop offset="100%" stopColor="rgb(178,0,255)" />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx="90"
                  cy="90"
                  r={R}
                  stroke="url(#ringGrad)"
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                />
              </Svg>

              {/* Centro del anillo */}
              <View className="absolute inset-0 items-center justify-center">
                <View className="items-center">
                  <Text
                    style={{
                      fontSize: 11,
                      color: isDark ? textSecondaryDark : "#64748b",
                      lineHeight: 12,
                    }}
                  >
                    Estimado
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: isDark ? textPrimaryDark : "#0f172a",
                      lineHeight: 26,
                    }}
                  >
                    {gasto}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: isDark ? textSecondaryDark : "#64748b",
                      marginTop: -2,
                    }}
                  >
                    kcal / día
                  </Text>
                </View>
              </View>
            </View>

            {/* Leyenda / estado */}
            <View className="flex-1 min-w-0">
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? textSecondaryDark : "#475569",
                }}
              >
                Energía total que tu cuerpo{" "}
                <Text
                  style={{
                    fontWeight: "700",
                    color: isDark ? textPrimaryDark : "#0f172a",
                  }}
                >
                  gasta a diario
                </Text>{" "}
                según tu nivel actual de actividad.
              </Text>

              {/* Chips de referencia */}
              <View className="mt-3 flex-row flex-wrap gap-2">
                {[
                  { label: "Ligero", val: 2200 },
                  { label: "Promedio", val: 2600 },
                  { label: "Alto", val: 3000 },
                ].map((r) => (
                  <View
                    key={r.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: isDark ? chipBgDark : "#f5f5f5",
                      borderWidth: 1,
                      borderColor: isDark ? chipRingDark : "#e5e7eb",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: isDark ? textSecondaryDark : "#334155",
                      }}
                    >
                      {r.label}: {r.val} kcal
                    </Text>
                  </View>
                ))}
              </View>

              {/* Barra lineal con degradado */}
              <View
                className="mt-3 h-2.5 w-full rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDark
                    ? "rgba(148,163,184,0.18)"
                    : "#e5e7eb",
                  borderWidth: 1,
                  borderColor: isDark ? chipRingDark : "#e5e7eb",
                }}
              >
                <LinearGradient
                  colors={["#8bff62", "#39ff14", "#a855f7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${pct * 100}%`, height: "100%" }}
                />
              </View>
            </View>
          </View>

          {/* Nota */}
          <Text
            style={{
              marginTop: 16,
              fontSize: 11,
              color: isDark ? textSecondaryDark : "#6b7280",
            }}
          >
            Basado en la fórmula de Mifflin–St Jeor. Este valor es una
            estimación y puede variar según múltiples factores.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- utils ---------- */
function stripTrailingZeros(n: number) {
  return Number.isInteger(n)
    ? n.toString()
    : n.toFixed(3).replace(/\.?0+$/, "");
}

/* ---------- subcomponentes ---------- */
function Metric({
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
