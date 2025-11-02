// src/shared/components/ui/Header.tsx
import React, { useMemo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Lock, Gift } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { SafeAreaView } from "react-native-safe-area-context";

import logo from "../../../../assets/logo.png";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();

    // ✅ Selectores primitivos del store
    const nombre = useUsuarioStore((s) => s.usuario?.nombre ?? "");
    const imagenPerfil = useUsuarioStore((s) => s.usuario?.imagenPerfil ?? "");
    const planActual = useUsuarioStore((s) => s.usuario?.planActual);
    const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);

    const { isPremiumActive, isPremiumUnpaid } = useMemo(() => {
        const active = planActual === "PREMIUM" && haPagado;
        const unpaid = planActual === "PREMIUM" && !haPagado;
        return { isPremiumActive: active, isPremiumUnpaid: unpaid };
    }, [planActual, haPagado]);

    // Fallback de avatar por inicial
    const avatarUrl = useMemo(() => {
        const n = nombre || "U";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            n
        )}&background=111827&color=FFFFFF&bold=true&uppercase=true&size=96&length=1&rounded=true`;
    }, [nombre]);

    const goRutinasTab = () => {
        // navega al tab "Rutinas" (ajústalo si tu tab tiene otro nombre)
        // @ts-ignore - usamos names de tabs simples
        navigation.navigate("Rutinas");
    };

    const goPerfilTab = () => {
        // @ts-ignore
        navigation.navigate("Perfil");
    };

    return (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>

            <View
                style={{
                    height: 56,
                    paddingHorizontal: 12,
                    backgroundColor: isDark ? "#0b1220" : "#ffffff",
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <TouchableOpacity
                    onPress={goRutinasTab}
                    activeOpacity={0.7}
                    style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}
                >
                    <Image
                        source={logo}
                        resizeMode="contain"
                        style={{ width: 58, height: 58 }}
                    />
                </TouchableOpacity>

                <ThemeToggle text={false} />


                {(nombre || imagenPerfil) ? (
                    <TouchableOpacity
                        onPress={goPerfilTab}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                    >
                        <View style={{ alignItems: "flex-end" }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    maxWidth: 180,
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: isDark ? "#e5e7eb" : "#0f172a",
                                }}
                            >
                                {nombre}
                            </Text>

                            {isPremiumActive && (
                                <View
                                    style={{
                                        marginTop: 2,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                        backgroundColor: "rgba(17,24,39,0.9)",
                                        borderRadius: 999,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <Sparkles size={12} color="#fff" />
                                    <Text style={{ fontSize: 10, color: "#fff" }}>Premium</Text>
                                </View>
                            )}
                        </View>

                        {/* Avatar con gradiente */}
                        <LinearGradient
                            colors={["#a78bfa", "#f472b6", "#60a5fa"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 999,
                                padding: 3,
                                shadowColor: "#000",
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                shadowOffset: { width: 0, height: 1 },
                                elevation: 2,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderRadius: 999,
                                    overflow: "hidden",
                                    backgroundColor: "#fff",
                                }}
                            >
                                <Image
                                    source={imagenPerfil ? { uri: imagenPerfil } : { uri: avatarUrl }}
                                    resizeMode="cover"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </View>

                            {/* Badge de plan */}
                            <View
                                style={{
                                    position: "absolute",
                                    bottom: -6,
                                    left: -6,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 999,
                                    backgroundColor: "#fff",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    shadowOffset: { width: 0, height: 1 },
                                    elevation: 3,
                                    borderWidth: 1,
                                    borderColor: isDark ? "#1f2937" : "#e5e7eb",
                                }}
                                accessibilityLabel={
                                    isPremiumActive
                                        ? "Plan Premium activo"
                                        : isPremiumUnpaid
                                            ? "Suscripción pendiente o expirada"
                                            : "Plan Gratuito"
                                }
                            >
                                {isPremiumActive ? (
                                    <Sparkles size={16} color="#7c3aed" strokeWidth={2} />
                                ) : isPremiumUnpaid ? (
                                    <Lock size={16} color="#b45309" strokeWidth={2} />
                                ) : (
                                    <Gift size={16} color={isDark ? "#9ca3af" : "#525252"} strokeWidth={2} />
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    // Si no hay usuario, puedes dejar solo el logo o un placeholder
                    <View style={{ width: 56, height: 56 }} />
                )}
            </View>
        </SafeAreaView>
    );
}
