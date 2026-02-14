// src/shared/components/ui/Header.tsx
import React, { memo, useCallback, useMemo } from "react";
import { View, Text, Image, Pressable, Platform } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Lock, Gift, ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import logo from "../../../../assets/logo.png";
import ThemeToggle from "./ThemeToggle";

type PlanState = "PREMIUM_ACTIVE" | "PREMIUM_UNPAID" | "FREE";

function PlanChip({ state }: { state: PlanState }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (state === "FREE") return null;

  const isActive = state === "PREMIUM_ACTIVE";
  const label = isActive ? "Premium" : "Premium (pendiente)";
  const Icon = isActive ? Sparkles : Lock;

  return (
    <View
      style={{
        marginTop: 4,
        alignSelf: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
      }}
      accessibilityLabel={label}
    >
      <Icon size={12} color={isActive ? "#a78bfa" : "#f59e0b"} />
      <Text
        style={{
          marginLeft: 6,
          fontSize: 10,
          fontWeight: "700",
          color: isDark ? "#e5e7eb" : "#0f172a",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Avatar({
  uri,
  planState,
}: {
  uri: string;
  planState: PlanState;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const ring =
    planState === "PREMIUM_ACTIVE"
      ? ["#a78bfa", "#f472b6", "#60a5fa"]
      : isDark
      ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]
      : ["rgba(15,23,42,0.10)", "rgba(15,23,42,0.06)"];

  const badge = useMemo(() => {
    if (planState === "PREMIUM_ACTIVE") return { Icon: Sparkles, color: "#7c3aed", a11y: "Plan Premium activo" };
    if (planState === "PREMIUM_UNPAID") return { Icon: Lock, color: "#b45309", a11y: "Suscripción pendiente o expirada" };
    return { Icon: Gift, color: isDark ? "#9ca3af" : "#525252", a11y: "Plan Gratuito" };
  }, [planState, isDark]);

  return (
    <LinearGradient
      colors={ring as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        padding: 2.5,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.10)",
        }}
      >
        <Image source={{ uri }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
      </View>

      {/* Badge */}
      <View
        style={{
          position: "absolute",
          bottom: -6,
          left: -6,
          width: 26,
          height: 26,
          borderRadius: 999,
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
        accessibilityLabel={badge.a11y}
      >
        <badge.Icon size={14} color={badge.color} strokeWidth={2.2} />
      </View>
    </LinearGradient>
  );
}

function Header() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

  // Selectores (primitivos) para minimizar renders
  const nombre = useUsuarioStore((s) => s.usuario?.nombre ?? "");
  const imagenPerfil = useUsuarioStore((s) => s.usuario?.imagenPerfil ?? "");
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);

  const planState: PlanState = useMemo(() => {
    if (planActual === "PREMIUM" && haPagado) return "PREMIUM_ACTIVE";
    if (planActual === "PREMIUM" && !haPagado) return "PREMIUM_UNPAID";
    return "FREE";
  }, [planActual, haPagado]);

  const avatarUrl = useMemo(() => {
    const n = (nombre?.trim() || "U").slice(0, 1);
    // ui-avatars: simple, rápido. Si prefieres offline, puedo cambiarlo por inicial local.
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      n
    )}&background=111827&color=FFFFFF&bold=true&uppercase=true&size=96&length=1&rounded=true`;
  }, [nombre]);

  const avatarSrc = imagenPerfil?.trim() ? imagenPerfil : avatarUrl;

  const goRutinasTab = useCallback(() => {
    // @ts-ignore
    navigation.navigate("Rutinas");
  }, [navigation]);

  const goPerfilTab = useCallback(() => {
    // @ts-ignore
    navigation.navigate("Perfil");
  }, [navigation]);

  const hasUser = !!(nombre || imagenPerfil);

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>
      <View
        style={{
          height: 60,
          paddingHorizontal: 14,
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Left: Logo */}
        <Pressable
          onPress={goRutinasTab}
          hitSlop={10}
          style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel="Ir a Rutinas"
        >
          <Image source={logo} resizeMode="contain" style={{ width: 54, height: 54 }} />
        </Pressable>

        {/* Center: Toggle (centrado real) */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemeToggle text={false} />
        </View>

        {/* Right: User */}
        {hasUser ? (
          <Pressable
            onPress={goPerfilTab}
            hitSlop={10}
            style={{ flexDirection: "row", alignItems: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <View style={{ alignItems: "flex-end", marginRight: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  maxWidth: 170,
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? "#e5e7eb" : "#0f172a",
                }}
              >
                {nombre}
              </Text>

              <PlanChip state={planState} />
            </View>

            <Avatar uri={avatarSrc} planState={planState} />

            <ChevronRight
              size={16}
              color={isDark ? "rgba(226,232,240,0.75)" : "rgba(15,23,42,0.55)"}
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        ) : (
          // Placeholder estable (evita saltos)
          <View style={{ width: 52, height: 52 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(Header);
