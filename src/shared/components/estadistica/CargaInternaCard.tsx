// src/shared/components/estadistica/CargaInternaCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Activity } from "lucide-react-native";

type DetalleSemana = {
  semanaLabel?: string; // p.ej. "Semana 1", "Hace 2 semanas"
  cargaMedia?: number;  // 0–10
  sesiones?: number;
};

type Props = {
  semanas?: number;
  totalSesiones?: number;
  detalleSemanas?: DetalleSemana[];
};

const CargaInternaCard: React.FC<Props> = ({
  semanas,
  totalSesiones,
  detalleSemanas,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasData =
    !!detalleSemanas &&
    Array.isArray(detalleSemanas) &&
    detalleSemanas.length > 0;

  const safeSemanas = semanas ?? (hasData ? detalleSemanas!.length : 0);
  const safeTotalSesiones = totalSesiones ?? 0;

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
                detalleSemanas={detalleSemanas!}
                semanas={safeSemanas}
                totalSesiones={safeTotalSesiones}
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
                detalleSemanas={detalleSemanas!}
                semanas={safeSemanas}
                totalSesiones={safeTotalSesiones}
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

export default CargaInternaCard;

/* ---------- Subcomponentes ---------- */

function CardBody({
  isDark,
  detalleSemanas,
  semanas,
  totalSesiones,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  detalleSemanas: DetalleSemana[];
  semanas: number;
  totalSesiones: number;
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  const ultimaSemana = detalleSemanas[detalleSemanas.length - 1];
  const cargaUltima = ultimaSemana?.cargaMedia ?? null;
  const sesionesUltima = ultimaSemana?.sesiones ?? null;

  const getBarColor = (carga: number) => {
    if (carga <= 4) return isDark ? "#22c55e" : "#16a34a"; // verde
    if (carga <= 7) return "#f59e0b"; // ámbar
    return "#ef4444"; // rojo
  };

  return (
    <View className="rounded-2xl">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-5 pb-3">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: isDark
                ? "rgba(34,197,94,0.12)"
                : "rgba(22,163,74,0.06)",
            }}
          >
            <Activity
              size={18}
              color={isDark ? "#22c55e" : "#16a34a"}
            />
          </View>
          <View>
            <Text
              className="text-base font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              Carga interna semanal
            </Text>
            <Text
              className="text-xs"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              Esfuerzo percibido a lo largo de tus semanas
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className="text-[11px] uppercase tracking-wide"
            style={{
              color: isDark ? textSecondaryDark : "#6b7280",
            }}
          >
            Semanas
          </Text>
          <Text
            className="text-xl font-bold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            {semanas || "–"}
          </Text>
        </View>
      </View>

      {/* KPIs superiores */}
      <View className="flex-row justify-between px-4 pb-3 gap-3">
        <View className="flex-1">
          <Text
            className="text-[11px] uppercase tracking-wide"
            style={{
              color: isDark ? textSecondaryDark : "#6b7280",
            }}
          >
            Sesiones analizadas
          </Text>
          <Text
            className="text-lg font-semibold mt-1"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            {totalSesiones}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text
            className="text-[11px] uppercase tracking-wide"
            style={{
              color: isDark ? textSecondaryDark : "#6b7280",
            }}
          >
            Última semana
          </Text>
          <Text
            className="text-sm mt-1"
            style={{
              color: isDark ? textSecondaryDark : "#6b7280",
            }}
          >
            {ultimaSemana?.semanaLabel ?? "Más reciente"}
          </Text>
          <Text
            className="text-lg font-bold"
            style={{
              color: cargaUltima != null
                ? getBarColor(cargaUltima)
                : isDark
                ? textPrimaryDark
                : "#0f172a",
            }}
          >
            {cargaUltima != null ? `${cargaUltima.toFixed(1)}/10` : "–"}
          </Text>
        </View>
      </View>

      {/* Mini “barchart” por semana */}
      <View className="mt-1 px-4 pb-4 gap-2">
        {detalleSemanas.map((sem, idx) => {
          const carga = sem.cargaMedia ?? 0;
          const sesiones = sem.sesiones ?? 0;
          const pct = Math.max(6, Math.min(100, (carga / 10) * 100));
          const barColor = getBarColor(carga);

          return (
            <View
              key={idx}
              className="flex-row items-center justify-between"
            >
              {/* Label semana */}
              <View className="flex-[1.2]">
                <Text
                  className="text-xs"
                  numberOfLines={1}
                  style={{
                    color: isDark ? textPrimaryDark : "#334155",
                  }}
                >
                  {sem.semanaLabel || `Semana ${idx + 1}`}
                </Text>
                {sesiones > 0 && (
                  <Text
                    className="text-[10px]"
                    style={{
                      color: isDark ? textSecondaryDark : "#94a3b8",
                    }}
                  >
                    {sesiones} sesión{sesiones === 1 ? "" : "es"}
                  </Text>
                )}
              </View>

              {/* Barra */}
              <View className="flex-[2] mx-2">
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

              {/* Valor numérico */}
              <View className="flex-[0.6] items-end">
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isDark ? textPrimaryDark : "#0f172a",
                  }}
                >
                  {carga ? carga.toFixed(1) : "–"}
                </Text>
                <Text
                  className="text-[10px]"
                  style={{
                    color: isDark ? textSecondaryDark : "#9ca3af",
                  }}
                >
                  /10
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Nota inferior */}
      <View className="border-t mt-1 pt-3 px-4 pb-4 border-white/5 border-slate-100">
        <Text
          className="text-[11px]"
          style={{
            color: isDark ? textSecondaryDark : "#64748b",
          }}
        >
          La carga interna se calcula a partir del esfuerzo percibido de
          cada sesión. Picos muy altos seguidos pueden indicar riesgo de
          sobrecarga.
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
            ? "rgba(255,255,255,0.10)"
            : "#f1f5f9",
        }}
      >
        <Text style={{ color: isDark ? "#e5e7eb" : "#94a3b8" }}>🧠</Text>
      </View>
      <Text
        className="text-sm font-medium"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        Aún no hay carga interna
      </Text>
      <Text
        className="text-xs mt-1 text-center"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Cuando registres sesiones indicando tu nivel de esfuerzo, aquí
        verás cómo evoluciona tu carga semana a semana.
      </Text>
    </View>
  );
}
