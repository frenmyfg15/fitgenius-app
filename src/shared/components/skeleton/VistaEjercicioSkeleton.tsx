// File: src/shared/components/ejercicio/VistaEjercicioSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* ---------- Primitivos (igual que EstadisticasSkeleton) ---------- */
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

    const base = isDark ? "#080D17" : "rgba(15,23,42,0.06)";
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

function SkeletonBlock({
    height,
    width = "100%",
    radius = 10,
}: {
    height: number;
    width?: number | string;
    radius?: number;
}) {
    return (
        <Shimmer borderRadius={radius}>
            <View style={{ height, width } as any} />
        </Shimmer>
    );
}

function SkeletonLine({ w = "60%", h = 12, radius = 6 }: { w?: number | string; h?: number; radius?: number }) {
    return <SkeletonBlock height={h} width={w} radius={radius} />;
}

function SkeletonPill({ w = 72, h = 28 }: { w?: number; h?: number }) {
    return <SkeletonBlock height={h} width={w} radius={999} />;
}

/* ---------- Secciones ---------- */

/* GIF del ejercicio */
function ImagenEjercicioSkeleton() {
    return (
        <View style={{ width: "100%", aspectRatio: 1, padding: 20, alignItems: "center", justifyContent: "center" }}>
            <SkeletonBlock height={280} width={280} radius={50} />
            {/* Botón descanso */}
            <View style={{ position: "absolute", bottom: 8, right: 28 }}>
                <SkeletonPill w={110} h={36} />
            </View>
        </View>
    );
}

/* NotaIA */
function NotaIASkeleton() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    return (
        <View
            style={{
                width: "100%",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                backgroundColor: isDark ? "rgba(20,28,44,0.65)" : "#F8FAFC",
                padding: 14,
                gap: 8,
            }}
        >
            <SkeletonLine w="40%" h={10} />
            <SkeletonLine w="90%" h={13} />
            <SkeletonLine w="75%" h={13} />
            {/* Pills sugeridas */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <SkeletonPill w={80} h={28} />
                <SkeletonPill w={90} h={28} />
                <SkeletonPill w={70} h={28} />
            </View>
        </View>
    );
}

/* Filas de series */
function SeriesInputSkeleton() {
    return (
        <View style={{ width: "100%", gap: 10, marginTop: 12 }}>
            {[...Array(3)].map((_, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {/* Nº serie */}
                    <SkeletonBlock height={44} width={36} radius={10} />
                    {/* Input peso */}
                    <SkeletonBlock height={44} width={"40%"} radius={10} />
                    {/* Input reps */}
                    <SkeletonBlock height={44} width={"40%"} radius={10} />
                </View>
            ))}
        </View>
    );
}

/* Botones + / - / guardar */
function BotonesSeriesSkeleton() {
    return (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12, alignItems: "center" }}>
            <SkeletonBlock height={40} width={40} radius={999} />
            <SkeletonBlock height={40} width={40} radius={999} />
            <SkeletonBlock height={40} width={40} radius={999} />
        </View>
    );
}

/* FAB lateral */
function FabSkeleton() {
    return (
        <View
            style={{
                position: "absolute",
                right: 20,
                bottom: 130,
                alignItems: "flex-end",
                gap: 14,
            }}
        >
            <SkeletonBlock height={48} width={48} radius={999} />
        </View>
    );
}

/* ---------- Skeleton completo ---------- */
export default function VistaEjercicioSkeleton() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 140,
                    gap: 12,
                }}
            >
                <ImagenEjercicioSkeleton />
                <NotaIASkeleton />
                <SeriesInputSkeleton />
                <BotonesSeriesSkeleton />
            </View>

            <FabSkeleton />
        </View>
    );
}