import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle as SvgCircle,
  Filter,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Text as SvgText,
} from "react-native-svg";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

type Props = {
  planificadas: number;
  completadas: number;
  adherencia: number; // 0–100
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
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

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

  const handleGoPremium = () => {
     navigation.navigate("Perfil", {
  screen: "PremiumPayment",
}); 
  };

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
            {locked ? (
              <LockedBody isDark={true} onPress={handleGoPremium} />
            ) : (
              <CardBody
                isDark
                kpis={kpis}
                adhe={adhe}
                cons={cons}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
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
          >
            {locked ? (
              <LockedBody isDark={false} onPress={handleGoPremium} />
            ) : (
              <CardBody
                isDark={false}
                kpis={kpis}
                adhe={adhe}
                cons={cons}
                textPrimaryDark={textPrimaryDark}
                textSecondaryDark={textSecondaryDark}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ----------------- Cuerpo reusable (desbloqueado) ----------------- */
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
  return (
    <View className="relative rounded-2xl">
      {/* Header */}
      <View className="p-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            Progreso general
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? textSecondaryDark : "#64748b" }}
          >
            Resumen de adherencia y consistencia
          </Text>
        </View>
        <View className="hidden sm:flex flex-row items-center gap-2">
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: isDark ? "#22c55e" : "#10b981",
            }}
          />
          <Text
            className="text-xs"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}
          >
            Actualizado
          </Text>
        </View>
      </View>

      {/* KPIs */}
      <View className="px-5 pb-2 grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <Metric
            key={k.label}
            label={k.label}
            value={k.value}
            accent={k.accent}
            isDark={isDark}
          />
        ))}
      </View>

      {/* Gauges */}
      <View className="px-5 pb-6">
        <View className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Gauge
            label="Adherencia"
            value={adhe}
            gradientId="gauge-grad-green"
            from={isDark ? "rgb(102,255,102)" : "rgb(34,197,94)"}
            to={isDark ? "rgb(0,255,64)" : "rgb(16,185,129)"}
            isDark={isDark}
          />
          <Gauge
            label="Consistencia"
            value={cons}
            gradientId="gauge-grad-purple"
            from={isDark ? "rgb(216,0,255)" : "rgb(168,85,247)"}
            to={isDark ? "rgb(155,0,255)" : "rgb(147,51,234)"}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
}

/* ----------------- Cuerpo bloqueado (no Premium) ----------------- */
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
            Progreso general Premium
          </Text>
          <Text
            className={
              (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
              " text-[12px] mt-1"
            }
          >
            Hazte Premium para ver tu adherencia y consistencia en detalle y
            asegurarte de que mantienes el ritmo de tus rutinas.
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
        ? "text-emerald-400"
        : "text-emerald-600"
      : isDark
      ? "text-purple-400"
      : "text-purple-600";

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
        className={`mt-1 text-3xl font-extrabold leading-tight ${colorNum}`}
      >
        {value}
      </Text>
    </View>
  );
}

function Gauge({
  label,
  value, // 0–100
  gradientId,
  from,
  to,
  isDark,
}: {
  label: string;
  value: number;
  gradientId: string;
  from: string;
  to: string;
  isDark: boolean;
}) {
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - value / 100);

  const track = isDark ? "rgba(148,163,184,0.20)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  return (
    <View
      className="rounded-xl px-4 py-4 border"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.7)",
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0",
        overflow: "hidden", // recorta el glow
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-sm font-medium"
          style={{ color: isDark ? "#e5e7eb" : "#334155" }}
        >
          {label}
        </Text>
        <Text
          className="text-sm font-semibold"
          style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
          accessibilityLabel={`${label} ${value}%`}
        >
          {value}%
        </Text>
      </View>

      <View className="items-center justify-center">
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          accessibilityRole="image"
          accessible
          aria-label={`${label}: ${value}%`}
        >
          <Defs>
            <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={from} />
              <Stop offset="100%" stopColor={to} />
            </SvgLinearGradient>

            {/* Glow suave */}
            <Filter
              id="gauge-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <FeGaussianBlur stdDeviation="2.2" result="b" />
              <FeMerge>
                <FeMergeNode in="b" />
                <FeMergeNode in="SourceGraphic" />
              </FeMerge>
            </Filter>
          </Defs>

          {/* Pista */}
          <SvgCircle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={track}
            strokeWidth={stroke}
          />

          {/* Progreso */}
          <SvgCircle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#gauge-glow)"
          />

          {/* Valor en el centro */}
          <SvgText
            x="50%"
            y="50%"
            fill={textPrimary}
            fontSize="22"
            fontWeight="800"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {value}%
          </SvgText>
          <SvgText
            x="50%"
            y="64%"
            fill={textSecondary}
            fontSize="12"
            fontWeight="500"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        </Svg>
      </View>

      {/* Indicador textual */}
      <View className="mt-2 items-center">
        <Text
          className="text-xs"
          style={{ color: isDark ? "#94a3b8" : "#64748b" }}
        >
          {value >= 90
            ? "Excelente"
            : value >= 70
            ? "Muy bien"
            : value >= 50
            ? "En progreso"
            : "Por mejorar"}
        </Text>
      </View>
    </View>
  );
}
