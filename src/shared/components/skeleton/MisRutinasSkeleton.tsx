// src/shared/components/skeleton/MisRutinasSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
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
    height,
}: {
    children: React.ReactNode;
    radius?: number;
    height: number;
}) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const t = useShimmer();

    const base = isDark ? "#080D17" : "rgba(15,23,42,0.06)";
    const highlight = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)";

    return (
        <View style={{ overflow: "hidden", borderRadius: radius, backgroundColor: base }}>
            <View style={{ height }}>{children}</View>
            <Animated.View
                pointerEvents="none"
                style={{
                    height,
                    width: "160%",
                    marginTop: -height,
                    transform: [
                        {
                            translateX: t.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-80, 80],
                            }),
                        },
                    ],
                    opacity: 0.9,
                }}
            >
                <LinearGradient
                    colors={["transparent", highlight, "transparent"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ height: "100%", width: "100%" }}
                />
            </Animated.View>
        </View>
    );
}

const Block = ({ h, r = 12 }: { h: number; r?: number }) => (
    <Shimmer radius={r} height={h}>
        <View style={{ height: h, width: "100%" }} />
    </Shimmer>
);

/* ---- Skeleton: 3 tarjetas verticales ---- */
export default function MisRutinasSkeleton() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View
            style={{
                // ✅ Mismos valores que MisRutinasScreen → tokens.color.bgDark / bgLight
                backgroundColor: isDark ? "#080D17" : "#F8FAFC",
                padding: 5,
                paddingBottom: 80,
                minHeight: "100%",
                width: "100%",
            }}
        >
            <View style={{ marginTop: 18 }}><Block h={120} /></View>
            <View style={{ marginTop: 18 }}><Block h={120} /></View>
            <View style={{ marginTop: 18 }}><Block h={120} /></View>
        </View>
    );
}