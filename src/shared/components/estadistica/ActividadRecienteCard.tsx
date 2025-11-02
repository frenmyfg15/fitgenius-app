import React, { useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

// ------------------ Tipos ------------------
type SesionDia = {
  fecha: string;
  sesiones: number;
};

type Props = {
  diasActivos?: number;
  totalSesiones?: number;
  detallePorDia?: SesionDia[];
};

export default function ActividadRecienteCard({
  diasActivos = 0,
  totalSesiones = 0,
  detallePorDia = [],
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // 🟣 Paleta y glass para dark (inspirado en IMCVisual)
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"]; // borde vibrante
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  // Medición del ancho real del contenedor
  const [cardWidth, setCardWidth] = useState(0);
  // Ancho del chart = ancho contenedor - padding horizontal del wrapper (px-3 = 12*2)
  const chartWidth = Math.max(0, cardWidth - 24);

  // Normalizar últimos 7 días
  const normalized = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of detallePorDia ?? []) {
      const k = new Date(d.fecha).toISOString().slice(0, 10);
      map.set(k, (d.sesiones ?? 0) + (map.get(k) ?? 0));
    }
    const days: { nombreDia: string; sesiones: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - i);
      const iso = dt.toISOString().slice(0, 10);
      const nombre = dt
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(/\.$/, "");
      days.push({
        nombreDia: nombre.charAt(0).toUpperCase() + nombre.slice(1),
        sesiones: map.get(iso) ?? 0,
      });
    }
    return days;
  }, [detallePorDia]);

  const labels = useMemo(
    () => normalized.map((d) => d.nombreDia.substring(0, 3)),
    [normalized]
  );
  const values = useMemo(() => normalized.map((d) => d.sesiones || 0), [normalized]);

  const noData = values.every((v) => v === 0);

  if (noData) {
    return (
      <View
        className={`w-full max-w-[520px]`}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        {/* Marco degradado distinto para dark / light */}
        <LinearGradient
          colors={(marcoGradient as any)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
        >
          {/* Fondo degradado en dark (glassy); en light, blanco */}
          {isDark ? (
            <LinearGradient
              colors={["rgba(20,28,44,0.85)", "rgba(9,14,24,0.9)", "rgba(20,28,44,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: cardBorderDark,
                overflow: "hidden",
              }}
            >
              <EmptyState isDark />
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
              <EmptyState isDark={false} />
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }

  // Config del chart
  const chartConfig = {
    backgroundColor: isDark ? "#0b1220" : "#ffffff",
    backgroundGradientFrom: isDark ? "#111a2b" : "#ffffff",
    backgroundGradientTo: isDark ? "#0b1220" : "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark ? `rgba(34,197,94,${opacity})` : `rgba(22,163,74,${opacity})`,
    labelColor: (opacity = 1) =>
      isDark ? `rgba(148,163,184,${opacity})` : `rgba(100,116,139,${opacity})`,
    propsForDots: { r: "4" },
    propsForBackgroundLines: {
      stroke: isDark ? "#1f2937" : "#e5e7eb",
      strokeDasharray: "",
    },
    fillShadowGradient: isDark ? "#22c55e" : "#16a34a",
    fillShadowGradientOpacity: isDark ? 0.25 : 0.15,
  } as const;

  return (
    <View
      className="w-full max-w-[520px]"
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      {/* Marco degradado */}
      <LinearGradient
        colors={(marcoGradient as any)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
      >
        {/* Fondo degradado (dark) / blanco (light) */}
        {isDark ? (
          <LinearGradient
            colors={["rgba(20,28,44,0.85)", "rgba(9,14,24,0.9)", "rgba(20,28,44,0.85)"]}
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
              labels={labels}
              values={values}
              chartWidth={chartWidth}
              diasActivos={diasActivos}
              totalSesiones={totalSesiones}
              chartConfig={chartConfig}
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
              labels={labels}
              values={values}
              chartWidth={chartWidth}
              diasActivos={diasActivos}
              totalSesiones={totalSesiones}
              chartConfig={chartConfig}
              textPrimaryDark={textPrimaryDark}
              textSecondaryDark={textSecondaryDark}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ---------- Cuerpo de la card (reutilizable para dark/light) ---------- */
function CardBody({
  isDark,
  labels,
  values,
  chartWidth,
  diasActivos,
  totalSesiones,
  chartConfig,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  labels: string[];
  values: number[];
  chartWidth: number;
  diasActivos: number;
  totalSesiones: number;
  chartConfig: any;
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  return (
    <View className={`rounded-2xl ${isDark ? "" : ""}`}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-5 pb-3">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            Actividad reciente
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? textSecondaryDark : "#64748b" }}
          >
            Últimos 7 días
          </Text>
        </View>

        <View className="flex-row gap-6">
          <KpiMini label="Días activos" value={diasActivos} />
          <KpiMini label="Total sesiones" value={totalSesiones} />
        </View>
      </View>

      {/* Gráfico */}
      <View className="px-3 pb-6">
        <LineChart
          data={{
            labels,
            datasets: [{ data: values, strokeWidth: 3 }],
          }}
          width={chartWidth}
          height={220}
          yAxisInterval={1}
          fromZero
          withInnerLines
          withOuterLines={false}
          withShadow
          withDots
          bezier
          chartConfig={chartConfig}
          formatYLabel={() => ""} // ocultar Y
          segments={4}
        />
      </View>

      {/* Footer compacto */}
      <View className="flex-row justify-between px-5 pb-4">
        <Kpi label="Días activos" value={diasActivos} />
        <Kpi label="Total sesiones" value={totalSesiones} />
      </View>
    </View>
  );
}

/* ---------- Subcomponentes ---------- */
function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View
      className={`rounded-2xl items-center justify-center p-8`}
      style={{
        backgroundColor: isDark ? "transparent" : "rgba(255,255,255,0.9)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 0, // ya hay borde en el wrapper
      }}
    >
      <View
        className="h-14 w-14 rounded-2xl mb-4 items-center justify-center"
        style={{ backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#f1f5f9" }}
      >
        <Text style={{ color: isDark ? "#e5e7eb" : "#94a3b8" }}>📊</Text>
      </View>
      <Text
        className="text-sm font-medium"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        Faltan datos
      </Text>
      <Text className="text-xs mt-1" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
        Cuando registres sesiones, verás tu progreso aquí.
      </Text>
    </View>
  );
}

function KpiMini({ label, value }: { label: string; value: number }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View className="items-end">
      <Text
        className="text-[11px] uppercase tracking-wide"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {label}
      </Text>
      <Text
        className="text-xl font-bold"
        style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
      >
        {value}
      </Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      className="rounded-xl px-3 py-2 border"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",
      }}
    >
      <Text
        className="text-[11px] uppercase tracking-wide text-center"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {label}
      </Text>
      <Text
        className="text-lg font-semibold text-center"
        style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
      >
        {value}
      </Text>
    </View>
  );
}
