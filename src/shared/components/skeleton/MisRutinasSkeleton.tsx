// src/shared/components/skeleton/MisRutinasSkeleton.tsx
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

/* ---- Efecto Shimmer sin posición absoluta ---- */
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

    const base = isDark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";
    const highlight = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)";

    // Truco: el gradiente va DESPUÉS del contenido y se superpone con marginTop negativo
    // del mismo alto del bloque. El contenedor recorta con overflow: 'hidden'.
    return (
        <View
            style={{
                overflow: "hidden",
                borderRadius: radius,
                backgroundColor: base,
            }}
        >
            {/* Contenido del bloque */}
            <View style={{ height }}>{children}</View>

            {/* “Capa” shimmer superpuesta sin absolute */}
            <Animated.View
                pointerEvents="none"
                style={{
                    height,
                    width: "160%", // más ancho para permitir el barrido
                    marginTop: -height, // ← superpone sobre el bloque
                    transform: [
                        {
                            translateX: t.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-80, 80], // barrido horizontal
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

const Block = ({
    h,
    r = 12,
}: {
    h: number;
    r?: number;
}) => (
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
                backgroundColor: isDark ? "#0b1220" : "#ffffff",
                padding: 5,
                paddingBottom: 80,
                minHeight: "100%",
                width: "100%",
            }}

        >
            <View style={{ marginTop: 18 }}>
                <Block h={120} />
            </View>
            <View style={{ marginTop: 18 }}>
                <Block h={120} />
            </View>
            <View style={{ marginTop: 18 }}>
                <Block h={120} />
            </View>
        </View>
    );
}
