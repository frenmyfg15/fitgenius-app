// src/features/premium/DistribucionMuscularCard.tsx
import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  G,
  Line,
  Circle as SvgCircle,
  Polygon,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

type DistribucionItem = {
  grupoMuscular: string;
  porcentaje: number;
};

type Props = {
  distribucion: DistribucionItem[];
};

/* ---------- Utilidades de normalización ---------- */
function normalizeDistribucion(src: DistribucionItem[]) {
  const clean = (src ?? [])
    .filter((d) => d && typeof d.grupoMuscular === "string")
    .map((d) => ({
      grupoMuscular: d.grupoMuscular,
      porcentaje: Math.max(0, Math.min(100, Number(d.porcentaje) || 0)),
    }))
    .filter((d) => d.porcentaje > 0);

  const map = new Map<string, number>();
  for (const d of clean)
    map.set(d.grupoMuscular, (map.get(d.grupoMuscular) ?? 0) + d.porcentaje);

  const arr = Array.from(map, ([grupoMuscular, p]) => ({
    grupoMuscular,
    porcentaje: Math.min(100, p),
  }));

  // Limita a las 10 más altas
  return arr.sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 10);
}

/* ---------- Componente principal ---------- */
export default function DistribucionMuscularCard({ distribucion }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

  // 🎨 Paleta & glass (consistente con otras cards)
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDarkA = "rgba(20,28,44,0.85)";
  const cardBgDarkB = "rgba(9,14,24,0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const data = useMemo(() => normalizeDistribucion(distribucion), [distribucion]);
  const hasData = data.length > 0;
  const top = hasData ? data[0] : null;

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
          >
            {locked ? (
              <LockedBody isDark={true} onPress={handleGoPremium} />
            ) : (
              <CardBody
                isDark
                data={data}
                top={top}
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
                data={data}
                top={top}
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

/* ---------- Cuerpo cuando está desbloqueado (Premium) ---------- */
function CardBody({
  isDark,
  data,
  top,
  textPrimaryDark,
  textSecondaryDark,
}: {
  isDark: boolean;
  data: { grupoMuscular: string; porcentaje: number }[];
  top: { grupoMuscular: string; porcentaje: number } | null;
  textPrimaryDark: string;
  textSecondaryDark: string;
}) {
  const hasData = data.length > 0;

  return (
    <View className="relative rounded-2xl">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
          >
            Distribución muscular
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? textSecondaryDark : "#64748b" }}
          >
            Reparto porcentual por grupo
          </Text>
        </View>
        {top ? (
          <Text
            className="text-xs"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}
            numberOfLines={1}
          >
            Principal:{" "}
            <Text
              style={{
                color: isDark ? textPrimaryDark : "#0f172a",
                fontWeight: "600",
              }}
            >
              {top.grupoMuscular}
            </Text>
          </Text>
        ) : null}
      </View>

      {/* Contenido principal */}
      <View className="px-4 pb-5">
        {hasData ? (
          <>
            <RadarChart data={data} isDark={isDark} />
            <Legend data={data} isDark={isDark} />
          </>
        ) : (
          <EmptyState isDark={isDark} />
        )}
      </View>
    </View>
  );
}

/* ---------- Cuerpo cuando está bloqueado (no Premium) ---------- */
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
      <View className="px-5 py-5 flex-row items-center gap-4">
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
            Distribución muscular Premium
          </Text>
          <Text
            className={
              (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
              " text-[12px] mt-1"
            }
          >
            Hazte Premium para ver qué grupos musculares estás trabajando más y
            equilibrar tus entrenamientos.
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

/* ---------- RadarChart (SVG puro) ---------- */
function RadarChart({
  data,
  isDark,
}: {
  data: { grupoMuscular: string; porcentaje: number }[];
  isDark: boolean;
}) {
  // Geometría
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const padding = 20;
  const R = (size - padding * 2) / 2;

  const n = Math.max(3, data.length);
  const rings = 5;

  // Colores
  const gridStroke = isDark
    ? "rgba(148,163,184,0.15)"
    : "rgba(15,23,42,0.08)";
  const axisStroke = isDark
    ? "rgba(148,163,184,0.25)"
    : "rgba(15,23,42,0.12)";

  // Puntos
  const angleAt = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;
  const point = (rNorm: number, i: number) => {
    const a = angleAt(i);
    const r = rNorm * R;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Anillos
  const ringPolygons: string[] = [];
  for (let k = 1; k <= rings; k++) {
    const norm = k / rings;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const p = point(norm, i);
      pts.push(`${p.x},${p.y}`);
    }
    ringPolygons.push(pts.join(" "));
  }

  // Ejes
  const axes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = point(1, i);
    axes.push({ x1: cx, y1: cy, x2: p.x, y2: p.y });
  }

  // Polígono de datos
  const dataPoints = data.map((d, i) =>
    point(Math.max(0, Math.min(1, d.porcentaje / 100)), i)
  );
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View className="items-center">
      <Svg
        width={size}
        height={size}
        accessibilityRole="image"
        accessible
        accessibilityLabel="Distribución muscular"
      >
        <Defs>
          <SvgLinearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <Stop
              offset="0%"
              stopColor={
                isDark ? "rgba(34,197,94,0.32)" : "rgba(34,197,94,0.22)"
              }
            />
            <Stop
              offset="100%"
              stopColor={
                isDark ? "rgba(168,85,247,0.28)" : "rgba(168,85,247,0.20)"
              }
            />
          </SvgLinearGradient>
          <SvgLinearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#00ff40" />
            <Stop offset="100%" stopColor="#b200ff" />
          </SvgLinearGradient>
        </Defs>

        <G>
          {/* Anillos */}
          {ringPolygons.map((pts, idx) => (
            <Polygon
              key={`ring-${idx}`}
              points={pts}
              fill="none"
              stroke={gridStroke}
              strokeWidth={1}
            />
          ))}

          {/* Ejes */}
          {axes.map((a, idx) => (
            <Line
              key={`axis-${idx}`}
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              stroke={axisStroke}
              strokeWidth={1}
            />
          ))}

          {/* Polígono de datos */}
          <Polygon
            points={dataPolygon}
            fill="url(#radarFill)"
            stroke="url(#radarStroke)"
            strokeWidth={2.5}
          />

          {/* Puntos */}
          {dataPoints.map((p, idx) => (
            <SvgCircle
              key={`dp-${idx}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={isDark ? "#fff" : "#0f172a"}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

/* ---------- Leyenda inferior ---------- */
function Legend({
  data,
  isDark,
}: {
  data: { grupoMuscular: string; porcentaje: number }[];
  isDark: boolean;
}) {
  return (
    <View className="mt-3">
      <FlatList
        data={data}
        keyExtractor={(item) => item.grupoMuscular}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-2 w-[48%]">
            <View
              className="h-2.5 w-2.5 rounded-full mr-2"
              style={{ backgroundColor: "#94a3b8" }}
            />
            <Text
              className="text-xs flex-1"
              style={{ color: isDark ? "#e5e7eb" : "#334155" }}
              numberOfLines={1}
            >
              {item.grupoMuscular}
            </Text>
            <Text
              className="text-xs font-semibold ml-2"
              style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
            >
              {item.porcentaje.toFixed(1)}%
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/* ---------- Vacío / sin datos ---------- */
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
        <Text style={{ color: isDark ? "#e5e7eb" : "#94a3b8" }}>⭐️</Text>
      </View>
      <Text
        className="text-sm"
        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
      >
        No hay datos de distribución para mostrar.
      </Text>
      <Text
        className="text-xs mt-1"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Completa tus rutinas para ver qué músculos trabajas más.
      </Text>
    </View>
  );
}
