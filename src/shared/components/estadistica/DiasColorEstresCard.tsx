// src/shared/components/estadistica/DiasColorEstresCard.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { ThermometerSun } from "lucide-react-native";

type ResumenEstres = {
  verde?: number;
  ambar?: number;
  rojo?: number;
};

type DetalleDia = {
  fecha?: string;       // "2025-01-01"
  nivelEstres?: number; // 1–10
  color?: "verde" | "ambar" | "rojo";
};

type Props = {
  diasActivos?: number;
  resumen?: ResumenEstres;
  detalles?: DetalleDia[];
};

const DiasColorEstresCard: React.FC<Props> = ({
  diasActivos,
  resumen,
  detalles,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const totalVerde = resumen?.verde ?? 0;
  const totalAmbar = resumen?.ambar ?? 0;
  const totalRojo = resumen?.rojo ?? 0;

  const total = totalVerde + totalAmbar + totalRojo;
  const safeDiasActivos = diasActivos ?? total;

  const pct = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const hasData = total > 0;

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
                diasActivos={safeDiasActivos}
                totalVerde={totalVerde}
                totalAmbar={totalAmbar}
                totalRojo={totalRojo}
                total={total}
                pct={pct}
                detalles={detalles}
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
                diasActivos={safeDiasActivos}
                totalVerde={totalVerde}
                totalAmbar={totalAmbar}
                totalRojo={totalRojo}
                total={total}
                pct={pct}
                detalles={detalles}
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

export default DiasColorEstresCard;

/* ---------- Subcomponentes ---------- */

function CardBody({
  isDark,
  diasActivos,
  totalVerde,
  totalAmbar,
  totalRojo,
  total,
  pct,
  detalles,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  diasActivos: number;
  totalVerde: number;
  totalAmbar: number;
  totalRojo: number;
  total: number;
  pct: (count: number) => number;
  detalles?: DetalleDia[];
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  const verdePct = total > 0 ? (totalVerde / total) * 100 : 0;
  const ambarPct = total > 0 ? (totalAmbar / total) * 100 : 0;
  const rojoPct = total > 0 ? (totalRojo / total) * 100 : 0;

  return (
    <View className="rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: isDark
                ? "rgba(251,191,36,0.10)"
                : "rgba(252,211,77,0.25)",
            }}
          >
            <ThermometerSun
              size={18}
              color={isDark ? "#fbbf24" : "#d97706"}
            />
          </View>
          <View>
            <Text
              className="text-base font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              Días por nivel de estrés
            </Text>
            <Text
              className="text-xs"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              Mapa de cómo se han sentido tus entrenos
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className="text-[11px] uppercase tracking-wide"
            style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
          >
            Días activos
          </Text>
          <Text
            className="text-xl font-bold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            {diasActivos || "–"}
          </Text>
        </View>
      </View>

      {/* Barra apilada resumen (verde/ámbar/rojo) */}
      <View className="px-4 mt-1 mb-3">
        <View
          className="h-3 rounded-full overflow-hidden flex-row"
          style={{
            backgroundColor: isDark
              ? "rgba(15,23,42,0.9)"
              : "#e5e7eb",
          }}
        >
          <View
            style={{
              width: `${verdePct}%`,
              backgroundColor: "#22c55e",
            }}
          />
          <View
            style={{
              width: `${ambarPct}%`,
              backgroundColor: "#f59e0b",
            }}
          />
          <View
            style={{
              width: `${rojoPct}%`,
              backgroundColor: "#ef4444",
            }}
          />
        </View>

        {/* Leyenda compacta */}
        <View className="flex-row justify-between mt-2">
          <LegendItem
            isDark={isDark}
            color="#22c55e"
            label="Días suaves"
            value={totalVerde}
            pct={pct(totalVerde)}
          />
          <LegendItem
            isDark={isDark}
            color="#f59e0b"
            label="Días moderados"
            value={totalAmbar}
            pct={pct(totalAmbar)}
          />
          <LegendItem
            isDark={isDark}
            color="#ef4444"
            label="Días muy duros"
            value={totalRojo}
            pct={pct(totalRojo)}
          />
        </View>
      </View>

      {/* Calendario minimalista */}
      {detalles && detalles.length > 0 && (
        <View className="px-4 pb-4">
          <CalendarHeatmap
            isDark={isDark}
            detalles={detalles}
            textSecondaryDark={textSecondaryDark}
          />
        </View>
      )}

      {/* Nota inferior */}
      <View className="border-t border-white/5 border-slate-100 px-4 pt-3 pb-4">
        <Text
          className="text-[11px]"
          style={{
            color: isDark ? textSecondaryDark : "#64748b",
          }}
        >
          Busca muchos días en verde, algunos ámbar y pocos rojos: así
          construyes progreso sin pasarte de carga.
        </Text>
      </View>
    </View>
  );
}

function LegendItem({
  isDark,
  color,
  label,
  value,
  pct,
}: {
  isDark: boolean;
  color: string;
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <View className="flex-1 mr-2 last:mr-0">
      <View className="flex-row items-center gap-1.5">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
        <Text
          className="text-[11px]"
          style={{
            color: isDark ? "#e5e7eb" : "#4b5563",
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-sm font-semibold mt-0.5"
        style={{
          color: isDark ? "#e5e7eb" : "#0f172a",
        }}
      >
        {value} ({pct}%)
      </Text>
    </View>
  );
}

/* ---------- Calendario minimalista ---------- */

function CalendarHeatmap({
  isDark,
  detalles,
  textSecondaryDark,
}: {
  isDark: boolean;
  detalles: DetalleDia[];
  textSecondaryDark: string;
}) {
  // Map de fecha ISO -> color
  const dayMap = useMemo(() => {
    const map = new Map<string, "verde" | "ambar" | "rojo">();
    for (const d of detalles) {
      if (!d.fecha) continue;
      let c: "verde" | "ambar" | "rojo";
      if (d.color) {
        c = d.color;
      } else if (typeof d.nivelEstres === "number") {
        c =
          d.nivelEstres <= 4
            ? "verde"
            : d.nivelEstres <= 7
            ? "ambar"
            : "rojo";
      } else {
        c = "verde";
      }
      // normalizar fecha
      const key = new Date(d.fecha).toISOString().slice(0, 10);
      map.set(key, c);
    }
    return map;
  }, [detalles]);

  // Tomamos como referencia el último día registrado o hoy
  const refDate = useMemo(() => {
    if (!detalles.length) return new Date();
    const validDates = detalles
      .map((d) => (d.fecha ? new Date(d.fecha) : null))
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
    if (!validDates.length) return new Date();
    return validDates.reduce((a, b) => (b > a ? b : a));
  }, [detalles]);

  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-11
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstOfMonth.getDay(); // 0-domingo
  const daysInMonth = lastOfMonth.getDate();

  // Normalizar para que la semana empiece en lunes
  const startOffset = (firstWeekday - 1 + 7) % 7; // 0 = lunes

  const cells: {
    key: string;
    dayNumber: number | null;
    color: "verde" | "ambar" | "rojo" | null;
  }[] = [];

  // Celdas vacías antes del día 1
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `empty-${i}`, dayNumber: null, color: null });
  }

  // Celdas del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = d.toISOString().slice(0, 10);
    const c = dayMap.get(key) ?? null;
    cells.push({
      key,
      dayNumber: day,
      color: c,
    });
  }

  const bgNeutral = isDark ? "rgba(15,23,42,0.9)" : "#f4f4f5";

  const getBgFromColor = (
    c: "verde" | "ambar" | "rojo" | null
  ): string => {
    if (c === "verde") return "#22c55e";
    if (c === "ambar") return "#f59e0b";
    if (c === "rojo") return "#ef4444";
    return bgNeutral;
  };

  const getTextColorForCell = (
    c: "verde" | "ambar" | "rojo" | null
  ): string => {
    if (!c) return isDark ? "#cbd5f5" : "#4b5563";
    return "#f9fafb";
  };

  const monthName = refDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-xs font-medium"
          style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
        >
          Calendario de estrés
        </Text>
        <Text
          className="text-[11px]"
          style={{
            color: isDark ? textSecondaryDark : "#6b7280",
          }}
        >
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
      </View>

      {/* Cabecera días de la semana */}
      <View className="flex-row mb-1">
        {weekdayLabels.map((d) => (
          <View
            key={d}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 2,
            }}
          >
            <Text
              className="text-[11px]"
              style={{
                color: isDark ? textSecondaryDark : "#9ca3af",
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      <View className="flex-row flex-wrap">
        {cells.map((cell, idx) => {
          const size = 32;
          if (cell.dayNumber == null) {
            return (
              <View
                key={cell.key}
                style={{
                  width: `${100 / 7}%`,
                  alignItems: "center",
                  marginBottom: 4,
                  height: size,
                }}
              />
            );
          }

          const bg = getBgFromColor(cell.color);
          const textColor = getTextColorForCell(cell.color);

          return (
            <View
              key={cell.key}
              style={{
                width: `${100 / 7}%`,
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: 10,
                  backgroundColor: bg,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: cell.color ? 0 : 1,
                  borderColor: isDark
                    ? "rgba(148,163,184,0.35)"
                    : "#e4e4e7",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: textColor,
                  }}
                >
                  {cell.dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
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
        <Text style={{ color: isDark ? "#e5e7eb" : "#94a3b8" }}>🌡️</Text>
      </View>
      <Text
        className="text-sm font-medium"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        Aún no hay días con nivel de estrés
      </Text>
      <Text
        className="text-xs mt-1 text-center"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Marca cómo te sientes al guardar tus sesiones y aquí verás el
        patrón de días suaves, moderados y muy duros.
      </Text>
    </View>
  );
}
