// src/features/premium/CaloriasQuemadasCard.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

// -------------------------------- Types --------------------------------
type Props = {
  total: number;
  promedio: number; // se mantiene para el header/KPIs, pero NO se dibuja como media en la línea
  detalle: { fecha: string; calorias: number }[];
};

export default function CaloriasQuemadasCard({
  total,
  promedio,
  detalle,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

  // 🎨 Paleta y glass como ActividadRecienteCard
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDarkA = "rgba(20,28,44,0.85)";
  const cardBgDarkB = "rgba(9,14,24,0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  // Mantener el chart dentro del contenedor
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setInnerWidth(e.nativeEvent.layout.width);
  }, []);

  const hasData = Array.isArray(detalle) && detalle.length > 0 && total > 0;

  // Normalizar labels y valores
  const { labels, values } = useMemo(() => {
    const L: string[] = [];
    const V: number[] = [];
    for (const d of detalle ?? []) {
      const dt = new Date(d.fecha);
      const nombre = dt
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(/\.$/, "");
      L.push(
        (nombre.charAt(0).toUpperCase() + nombre.slice(1)).substring(0, 3)
      );
      V.push(Math.max(0, d.calorias ?? 0));
    }
    return { labels: L, values: V };
  }, [detalle]);

  // ⚙️ Config del chart EXACTAMENTE como ActividadRecienteCard
  const chartConfig = {
    backgroundColor: isDark ? "#0b1220" : "#ffffff",
    backgroundGradientFrom: isDark ? "#111a2b" : "#ffffff",
    backgroundGradientTo: isDark ? "#0b1220" : "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark ? `rgba(34,197,94,${opacity})` : `rgba(22,163,74,${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(148,163,184,${opacity})`
        : `rgba(100,116,139,${opacity})`,
    propsForDots: { r: "4" },
    propsForBackgroundLines: {
      stroke: isDark ? "#1f2937" : "#e5e7eb",
      strokeDasharray: "",
    },
    fillShadowGradient: isDark ? "#22c55e" : "#16a34a",
    fillShadowGradientOpacity: isDark ? 0.25 : 0.15,
  } as const;

  const handleGoPremium = () => {
     navigation.navigate("Perfil", {
  screen: "PremiumPayment",
}); 
  };

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado (borde) */}
      <LinearGradient
        colors={marcoGradient as any}
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
            onLayout={onLayout}
          >
            {locked ? (
              <LockedBody isDark={true} onPress={handleGoPremium} />
            ) : (
              <CardContents
                isDark
                labels={labels}
                values={values}
                total={total}
                promedio={promedio}
                chartConfig={chartConfig}
                innerWidth={innerWidth}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
                hasData={hasData}
              />
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
            onLayout={onLayout}
          >
            {locked ? (
              <LockedBody isDark={false} onPress={handleGoPremium} />
            ) : (
              <CardContents
                isDark={false}
                labels={labels}
                values={values}
                total={total}
                promedio={promedio}
                chartConfig={chartConfig}
                innerWidth={innerWidth}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
                hasData={hasData}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ------------------------------ Cuerpo desbloqueado ------------------------------ */
function CardContents({
  isDark,
  labels,
  values,
  total,
  promedio,
  chartConfig,
  innerWidth,
  textPrimaryDark,
  textSecondaryDark,
  hasData,
}: {
  isDark: boolean;
  labels: string[];
  values: number[];
  total: number;
  promedio: number;
  chartConfig: any;
  innerWidth: number;
  textPrimaryDark: string;
  textSecondaryDark: string;
  hasData: boolean;
}) {
  return (
    <View className="relative rounded-2xl">
      {/* Header */}
      <View className="p-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            Calorías quemadas
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? textSecondaryDark : "#64748b" }}
          >
            Resumen reciente
          </Text>
        </View>

        {/* KPIs (desktop/tablet) */}
        <View className="hidden sm:flex flex-row items-center gap-4">
          <KpiMini title="Total" value={total} suffix="kcal" isDark={isDark} />
          <KpiMini
            title="Promedio"
            value={promedio}
            suffix="kcal"
            isDark={isDark}
          />
        </View>
      </View>

      {/* KPIs (mobile) */}
      <View className="px-5 pb-3 grid grid-cols-2 gap-3 sm:hidden">
        <Kpi title="Total" value={total} suffix="kcal" isDark={isDark} />
        <Kpi
          title="Promedio"
          value={promedio}
          suffix="kcal"
          isDark={isDark}
        />
      </View>

      {/* Chart (igual al de ActividadRecienteCard) */}
      <View className="px-3 pb-6">
        {hasData ? (
          <View style={{ height: 240 }}>
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                    strokeWidth: 3,
                  },
                ],
              }}
              width={Math.max(0, innerWidth - 24)} // px-3 => 12*2
              height={220}
              bezier
              withShadow
              withDots
              fromZero
              withInnerLines
              withOuterLines={false}
              yAxisInterval={1}
              chartConfig={chartConfig}
              style={{ alignSelf: "flex-start" }} // la card ya recorta
              formatYLabel={() => ""} // ocultar eje Y
              segments={4}
            />
          </View>
        ) : (
          <EmptyState isDark={isDark} />
        )}
      </View>
    </View>
  );
}

/* ------------------------------ Cuerpo bloqueado (no Premium) ------------------------------ */
function LockedBody({
  isDark,
  onPress,
}: {
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="rounded-2xl"
    >
      <View className="p-5 flex-row items-center gap-4">
        <View
          className={
            "h-12 w-12 rounded-2xl items-center justify-center " +
            (isDark ? "bg-white/5" : "bg-neutral-50")
          }
        >
          <Lock
            size={26}
            color={isDark ? "#e5e7eb" : "#0f172a"}
            strokeWidth={2}
          />
        </View>

        <View className="flex-1">
          <Text
            className={
              (isDark ? "text-white" : "text-slate-900") +
              " text-[15px] font-semibold"
            }
          >
            Calorías quemadas Premium
          </Text>
          <Text
            className={
              (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
              " text-[12px] mt-1"
            }
          >
            Hazte Premium para ver tu histórico de calorías quemadas y cómo
            evoluciona tu gasto energético.
          </Text>
          <Text
            className={
              "mt-2 text-[12px] font-semibold " +
              (isDark ? "text-emerald-300" : "text-emerald-600")
            }
          >
            Toca para activar fitgenius Premium →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------ Subcomponentes ------------------------------ */
function KpiMini({
  title,
  value,
  suffix,
  isDark,
}: {
  title: string;
  value: number;
  suffix?: string;
  isDark: boolean;
}) {
  return (
    <View className="items-end">
      <Text
        className="text-[11px] uppercase tracking-wide"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {title}
      </Text>
      <Text
        className="text-lg font-bold"
        style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
      >
        {value}{" "}
        {suffix ? (
          <Text style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            {suffix}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

function Kpi({
  title,
  value,
  suffix,
  isDark,
}: {
  title: string;
  value: number;
  suffix?: string;
  isDark: boolean;
}) {
  return (
    <View
      className="rounded-xl border px-4 py-3 text-center"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.7)",
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",
      }}
    >
      <Text
        className="text-[11px] uppercase tracking-wide"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {title}
      </Text>
      <Text
        className="mt-1 text-xl font-bold"
        style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
      >
        {value}{" "}
        {suffix ? (
          <Text style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            {suffix}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View
      className="items-center justify-center py-12 border-t"
      style={{
        borderColor: isDark
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.60)",
      }}
    >
      <View
        className="h-12 w-12 rounded-xl mb-3 items-center justify-center"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.10)"
            : "#e2e8f0",
        }}
      >
        <Text style={{ color: isDark ? "#e5e7eb" : "#94a3b8" }}>📊</Text>
      </View>
      <Text
        className="text-sm"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        No hay datos de calorías para mostrar.
      </Text>
      <Text
        className="text-xs mt-1"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Registra tus sesiones para ver tu progreso aquí.
      </Text>
    </View>
  );
}
