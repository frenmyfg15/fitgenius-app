// src/shared/components/skeleton/HomeSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* ---- Shimmer base ---- */
function useShimmer() {
  const t = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(t, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return t;
}

function Shimmer({
  children,
  radius = 12,
}: {
  children: React.ReactNode;
  radius?: number;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = useShimmer();

  const base = isDark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";
  const highlight = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)";

  return (
    <View style={{ overflow: "hidden", borderRadius: radius, backgroundColor: base }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0, // ← en RN no existe "inset"
          transform: [
            {
              translateX: t.interpolate({
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

const Block = ({
  h,
  r = 12,
}: {
  h: number;
  r?: number;
}) => (
  <Shimmer radius={r}>
    <View style={{ height: h, width: "100%" }} />
  </Shimmer>
);

/* ---- Skeleton con la estructura del mock ---- */
export default function HomeSkeleton() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ScrollView
      style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 80,
        minHeight: "100%",
      }}
    >
      {/* 1) Barra superior (full width) */}
      <Block h={62} />

      {/* 2) Fila de 3 usando flex-row y márgenes (sin gap) */}
      <View className="flex-row py-10">
        {/* Col 1 */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <Block h={140} />
        </View>

        {/* Col 2 */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <Block h={140} />
        </View>

        {/* Col 3 (más alto) */}
        <View style={{ flex: 1 }}>
          <Block h={140} />
        </View>
      </View>

      {/* 3) Tres bloques full width apilados */}
      <View style={{ marginTop: 18 }}>
        <Block h={72} />
      </View>
      <View style={{ marginTop: 18 }}>
        <Block h={72} />
      </View>
      <View style={{ marginTop: 18 }}>
        <Block h={72} />
      </View>
      <View style={{ marginTop: 18 }}>
        <Block h={72} />
      </View>
      <View style={{ marginTop: 18 }}>
        <Block h={72} />
      </View>
    </ScrollView>
  );
}
