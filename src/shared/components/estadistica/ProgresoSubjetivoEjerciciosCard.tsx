// src/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";

type EjercicioSubjetivo = {
  nombre?: string;
  sesiones?: number;
  estresMedio?: number; // 1–10
  tendencia?: "sube" | "baja" | "estable";
};

type Props = {
  diasAnalizados?: number;
  ejercicios?: EjercicioSubjetivo[];
};

const ProgresoSubjetivoEjerciciosCard: React.FC<Props> = ({
  diasAnalizados,
  ejercicios,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasData =
    !!ejercicios && Array.isArray(ejercicios) && ejercicios.length > 0;

  const topEjercicios = hasData ? ejercicios!.slice(0, 5) : [];

  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  return (
    <View className="w-full max-w-[520px]">
      <LinearGradient
        colors={marcoGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
      >
        {isDark ? (
          <LinearGradient
            colors={[
              "rgba(20,28,44,0.85)",
              "rgba(9,14,24,0.9)",
              "rgba(20,28,44,0.85)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: cardBorderDark,
              overflow: "hidden",
            }}
          >
            {hasData ? (
              <CardBody
                isDark
                diasAnalizados={diasAnalizados}
                ejercicios={topEjercicios}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
              />
            ) : (
              <EmptyState isDark />
            )}
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
            {hasData ? (
              <CardBody
                isDark={false}
                diasAnalizados={diasAnalizados}
                ejercicios={topEjercicios}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
              />
            ) : (
              <EmptyState isDark={false} />
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default ProgresoSubjetivoEjerciciosCard;

/* ---------- Subcomponentes ---------- */

function CardBody({
  isDark,
  diasAnalizados,
  ejercicios,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  diasAnalizados?: number;
  ejercicios: EjercicioSubjetivo[];
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  const tendenciaText = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return "Se siente más exigente";
    if (t === "baja") return "Se siente más llevadero";
    return "Sensación estable";
  };

  const tendenciaColor = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return isDark ? "#fb7185" : "#b91c1c"; // rojo
    if (t === "baja") return isDark ? "#4ade80" : "#15803d"; // verde
    return isDark ? textSecondaryDark : "#6b7280"; // neutro
  };

  const tendenciaBadgeBg = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube")
      return isDark ? "rgba(248,113,113,0.14)" : "rgba(254,202,202,0.7)";
    if (t === "baja")
      return isDark ? "rgba(74,222,128,0.12)" : "rgba(187,247,208,0.7)";
    return isDark ? "rgba(148,163,184,0.14)" : "rgba(226,232,240,0.7)";
  };

  const tendenciaBadgeBorder = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube")
      return isDark ? "rgba(248,113,113,0.35)" : "rgba(248,113,113,0.8)";
    if (t === "baja")
      return isDark ? "rgba(74,222,128,0.35)" : "rgba(34,197,94,0.8)";
    return isDark ? "rgba(148,163,184,0.4)" : "rgba(148,163,184,0.6)";
  };

  const getBarColor = (carga: number) => {
    if (carga <= 4) return "#38bdf8"; // azul claro
    if (carga <= 7) return "#0ea5e9"; // azul medio
    return "#0369a1"; // azul oscuro
  };

  return (
    <View className="rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: isDark
                ? "rgba(56,189,248,0.12)"
                : "rgba(59,130,246,0.08)",
            }}
          >
            <TrendingUp
              size={18}
              color={isDark ? "#38bdf8" : "#0284c7"}
            />
          </View>
          <View>
            <Text
              className="text-base font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              Progreso subjetivo por ejercicio
            </Text>
            <Text
              className="text-xs"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              Qué ejercicios notas más duros o más llevaderos
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className="text-[11px] uppercase tracking-wide"
            style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
          >
            Días analizados
          </Text>
          <Text
            className="text-xl font-bold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            {diasAnalizados ?? "–"}
          </Text>
        </View>
      </View>

      {/* Lista de ejercicios */}
      <View className="px-4 pb-4 mt-1">
        {ejercicios.map((ej, idx) => {
          const carga = ej.estresMedio ?? 0;
          const pct = Math.max(6, Math.min(100, (carga / 10) * 100));
          const barColor = getBarColor(carga);
          const trendColor = tendenciaColor(ej.tendencia);

          return (
            <View
              key={`${ej.nombre ?? idx}`}
              className="mb-3 last:mb-0"
            >
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-1 pr-2">
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: isDark ? textPrimaryDark : "#0f172a",
                    }}
                    numberOfLines={1}
                  >
                    {ej.nombre ?? "Ejercicio"}
                  </Text>
                  <Text
                    className="text-[11px] mt-[1px]"
                    style={{
                      color: isDark ? textSecondaryDark : "#6b7280",
                    }}
                  >
                    {ej.sesiones ?? 0} sesión
                    {ej.sesiones === 1 ? "" : "es"}
                  </Text>
                </View>

                {/* Badge de tendencia */}
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: tendenciaBadgeBg(ej.tendencia),
                    borderWidth: 1,
                    borderColor: tendenciaBadgeBorder(ej.tendencia),
                  }}
                >
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: trendColor }}
                  >
                    {tendenciaText(ej.tendencia)}
                  </Text>
                </View>
              </View>

              {/* Barra de carga subjetiva */}
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <View
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(15,23,42,0.9)"
                        : "#e5e7eb",
                    }}
                  >
                    <View
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                      className="h-2.5"
                    />
                  </View>
                </View>
                <View style={{ width: 44, alignItems: "flex-end" }}>
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: isDark ? textPrimaryDark : "#0f172a",
                    }}
                  >
                    {carga ? carga.toFixed(1) : "–"}
                    <Text
                      className="text-[10px]"
                      style={{
                        color: isDark ? textSecondaryDark : "#6b7280",
                      }}
                    >
                      /10
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Nota inferior */}
      <View className="border-t border-white/5 border-slate-100 px-4 pt-3 pb-4">
        <Text
          className="text-[11px]"
          style={{
            color: isDark ? textSecondaryDark : "#64748b",
          }}
        >
          Usa estas sensaciones para ajustar técnica, descansos y peso:
          si un ejercicio se vuelve cada vez más llevadero, es buena
          señal de progreso.
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View
      className="rounded-2xl items-center justify-center p-8"
      style={{
        backgroundColor: isDark ? "transparent" : "rgba(255,255,255,0.9)",
        borderRadius: 16,
      }}
    >
      <View
        className="h-14 w-14 rounded-2xl mb-4 items-center justify-center"
        style={{
          backgroundColor: isDark
            ? "rgba(56,189,248,0.12)"
            : "#e0f2fe",
        }}
      >
        <Text style={{ color: isDark ? "#e5e7eb" : "#0ea5e9" }}>📈</Text>
      </View>
      <Text
        className="text-sm font-medium text-center"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        Aún no hay progreso subjetivo
      </Text>
      <Text
        className="text-xs mt-1 text-center"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Cuando registres varias sesiones marcando el nivel de esfuerzo,
        te mostraremos qué ejercicios se sienten más duros o más
        ligeros con el tiempo.
      </Text>
    </View>
  );
}
