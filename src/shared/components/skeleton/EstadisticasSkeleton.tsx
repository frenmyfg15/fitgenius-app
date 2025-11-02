import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* ---------- Primitivos ---------- */
function useShimmer() {
  const translate = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translate, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(translate, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translate]);
  return translate;
}

function Shimmer({ children, borderRadius = 12 }: { children: React.ReactNode; borderRadius?: number }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const translate = useShimmer();

  const base = isDark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";
  const highlight = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)";

  return (
    <View style={{ overflow: "hidden", borderRadius, backgroundColor: base }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0, right: 0,
          transform: [
            {
              translateX: translate.interpolate({
                inputRange: [-1, 1],
                outputRange: [-300, 300],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={["transparent", highlight, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonBlock({
  height,
  width = "100%",
  radius = 10,
  style,
}: {
  height: number;
  width?: number | string;
  radius?: number;
  style?: any;
}) {
  return (
    <Shimmer borderRadius={radius}>
      <View style={{ height, width } as any} />
    </Shimmer>
  );
}

/* Línea pequeña (texto) */
function SkeletonLine({ w = "60%", h = 12, radius = 6, style }: any) {
  return <SkeletonBlock height={h} width={w} radius={radius} style={style} />;
}

/* Chip pill */
function SkeletonPill({ w = 72, h = 28 }: { w?: number; h?: number }) {
  return <SkeletonBlock height={h} width={w} radius={999} />;
}

/* ---------- Tarjetas ---------- */

/* ActividadRecienteCard */
function ActividadRecienteSkeleton() {
  return (
    <CardShell>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>
        <View>
          <SkeletonLine w={120} h={14} />
          <View style={{ height: 6 }} />
          <SkeletonLine w={80} h={10} />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ alignItems: "flex-end" }}>
            <SkeletonLine w={70} h={10} />
            <View style={{ height: 6 }} />
            <SkeletonLine w={40} h={16} />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <SkeletonLine w={90} h={10} />
            <View style={{ height: 6 }} />
            <SkeletonLine w={50} h={16} />
          </View>
        </View>
      </View>

      {/* “Gráfico” */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 24 }}>
        <SkeletonBlock height={220} radius={12} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 }}>
        <SkeletonPill w={110} h={34} />
        <SkeletonPill w={130} h={34} />
      </View>
    </CardShell>
  );
}

/* DistribucionMuscularCard */
function DistribucionMuscularSkeleton() {
  return (
    <CardShell>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
        <View>
          <SkeletonLine w={160} h={14} />
          <View style={{ height: 6 }} />
          <SkeletonLine w={140} h={10} />
        </View>
        <SkeletonLine w={120} h={10} />
      </View>

      <View style={{ alignItems: "center", paddingHorizontal: 16, paddingBottom: 20 }}>
        {/* Radar placeholder circular */}
        <SkeletonBlock height={260} width={260} radius={130} />
        <View style={{ height: 12 }} />
        {/* Leyenda 2 columnas */}
        <View style={{ width: "100%", gap: 8 }}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <SkeletonLine w={"46%"} h={12} />
              <SkeletonLine w={"46%"} h={12} />
            </View>
          ))}
        </View>
      </View>
    </CardShell>
  );
}

/* CaloriasQuemadasCard */
function CaloriasQuemadasSkeleton() {
  return (
    <CardShell>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <View>
          <SkeletonLine w={150} h={14} />
          <View style={{ height: 6 }} />
          <SkeletonLine w={120} h={10} />
        </View>
      </View>

      {/* KPIs móviles */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
        <SkeletonPill w={120} h={36} />
        <SkeletonPill w={140} h={36} />
      </View>

      {/* Chart */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 24 }}>
        <SkeletonBlock height={220} radius={12} />
      </View>
    </CardShell>
  );
}

/* AdherenciaConsistenciaCard */
function AdherenciaConsistenciaSkeleton() {
  return (
    <CardShell>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <View>
          <SkeletonLine w={170} h={14} />
          <View style={{ height: 6 }} />
          <SkeletonLine w={200} h={10} />
        </View>
      </View>

      {/* KPIs */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 12 }}>
        <SkeletonPill w={160} h={40} />
        <SkeletonPill w={160} h={40} />
      </View>

      {/* Dos gauges */}
      <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 20, paddingBottom: 20 }}>
        <SkeletonBlock height={160} width={"50%"} radius={12} />
        <SkeletonBlock height={160} width={"50%"} radius={12} />
      </View>
    </CardShell>
  );
}

/* Contenedor de card con mismo padding/border que tus cards (sin borde degradado, solo placeholder) */
function CardShell({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        backgroundColor: isDark ? "rgba(20,28,44,0.65)" : "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

/* ---------- Skeleton de la screen completa ---------- */
export default function EstadisticasSkeleton() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, alignItems: "center" }}>
        <SkeletonLine w={160} h={20} radius={10} />
        <View style={{ height: 8 }} />
        <SkeletonLine w={220} h={12} radius={8} />
      </View>

      <View style={{ paddingHorizontal: 20, gap: 24, paddingBottom: 32 }}>
        <ActividadRecienteSkeleton />
        <DistribucionMuscularSkeleton />
        <CaloriasQuemadasSkeleton />
        <AdherenciaConsistenciaSkeleton />
      </View>
    </View>
  );
}
