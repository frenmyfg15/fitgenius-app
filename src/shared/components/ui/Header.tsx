// src/shared/components/ui/Header.tsx
import React, { memo, useCallback, useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import {
  Sparkles,
  Lock,
  Gift,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import logo from "../../../../assets/logo.png";

type PlanState = "PREMIUM_ACTIVE" | "PREMIUM_UNPAID" | "FREE";

const tokens = {
  color: {
    headerBgDark: "#080D17",
    headerBgLight: "#FFFFFF",
    headerBorderDark: "rgba(255,255,255,0.06)",
    headerBorderLight: "rgba(15,23,42,0.08)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textMutedDark: "#94A3B8",
    textMutedLight: "#64748B",

    ringNeutralDark: ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"],
    ringNeutralLight: ["rgba(15,23,42,0.10)", "rgba(15,23,42,0.06)"],
    ringPremium: ["#a78bfa", "#f472b6", "#60a5fa"],
  },
} as const;

function PlanChip({ state }: { state: PlanState }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (state === "FREE") return null;

  const isActive = state === "PREMIUM_ACTIVE";
  const label = isActive ? "Premium" : "Premium pendiente";
  const Icon = isActive ? Sparkles : Lock;

  return (
    <View
      style={[
        styles.planChip,
        {
          borderColor: isDark
            ? "rgba(255,255,255,0.10)"
            : "rgba(15,23,42,0.10)",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(15,23,42,0.04)",
        },
      ]}
      accessibilityLabel={label}
    >
      <Icon size={12} color={isActive ? "#a78bfa" : "#f59e0b"} />
      <Text
        style={[
          styles.planChipText,
          {
            color: isDark
              ? tokens.color.textPrimaryDark
              : tokens.color.textPrimaryLight,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function Avatar({ uri, planState }: { uri: string; planState: PlanState }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const ring =
    planState === "PREMIUM_ACTIVE"
      ? tokens.color.ringPremium
      : isDark
        ? tokens.color.ringNeutralDark
        : tokens.color.ringNeutralLight;

  const badge = useMemo(() => {
    if (planState === "PREMIUM_ACTIVE") {
      return {
        Icon: Sparkles,
        color: "#7C3AED",
        a11y: "Plan Premium activo",
      };
    }
    if (planState === "PREMIUM_UNPAID") {
      return {
        Icon: Lock,
        color: "#B45309",
        a11y: "Suscripción pendiente o expirada",
      };
    }
    return {
      Icon: Gift,
      color: isDark ? "#9CA3AF" : "#525252",
      a11y: "Plan Gratuito",
    };
  }, [planState, isDark]);

  return (
    <View style={styles.avatarWrap}>
      <LinearGradient
        colors={ring as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarRing}
      >
        <View
          style={[
            styles.avatarInner,
            {
              backgroundColor: isDark
                ? tokens.color.headerBgDark
                : tokens.color.headerBgLight,
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(15,23,42,0.10)",
            },
          ]}
        >
          <Image source={{ uri }} resizeMode="cover" style={styles.avatarImg} />
        </View>
      </LinearGradient>

      <View
        style={[
          styles.avatarBadge,
          {
            backgroundColor: isDark
              ? tokens.color.headerBgDark
              : tokens.color.headerBgLight,
            borderColor: isDark
              ? "rgba(255,255,255,0.10)"
              : "rgba(15,23,42,0.10)",
          },
        ]}
        accessibilityLabel={badge.a11y}
      >
        <badge.Icon size={12} color={badge.color} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function Header() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

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

  const hasUser = Boolean(nombre || imagenPerfil);

  const bg = isDark ? tokens.color.headerBgDark : tokens.color.headerBgLight;
  const border = isDark
    ? tokens.color.headerBorderDark
    : tokens.color.headerBorderLight;
  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textMuted = isDark
    ? tokens.color.textMutedDark
    : tokens.color.textMutedLight;

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: bg }}>
      <View
        style={[
          styles.bar,
          { backgroundColor: bg, borderBottomColor: border },
        ]}
      >
        <Pressable
          onPress={goRutinasTab}
          hitSlop={10}
          style={styles.brandBtn}
          accessibilityRole="button"
          accessibilityLabel="Ir a Rutinas"
        >
          <Image source={logo} resizeMode="contain" style={styles.logo} />
          <Text style={[styles.brandText, { color: textPrimary }]}>
            FitGenius
          </Text>
        </Pressable>

        <View style={styles.spacer} />

        {hasUser ? (
          <Pressable
            onPress={goPerfilTab}
            hitSlop={10}
            style={styles.userBtn}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <View style={styles.userText}>
              <Text
                numberOfLines={1}
                style={[styles.userName, { color: textPrimary }]}
              >
                {nombre}
              </Text>
              <PlanChip state={planState} />
            </View>

            <Avatar uri={avatarSrc} planState={planState} />

            <ChevronRight
              size={16}
              color={
                isDark
                  ? "rgba(226,232,240,0.75)"
                  : "rgba(15,23,42,0.55)"
              }
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        ) : (
          <View style={{ width: 52, height: 52 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(Header);

const styles = StyleSheet.create({
  bar: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  brandBtn: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  logo: {
    width: 42,
    height: 42,
  },
  brandText: {
    marginLeft: 10,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  spacer: {
    flex: 1,
  },

  userBtn: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  userText: {
    alignItems: "flex-end",
    marginRight: 10,
    minWidth: 0,
  },
  userName: {
    maxWidth: 150,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  planChip: {
    marginTop: 4,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  planChipText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  avatarWrap: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 999,
    padding: 2.5,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },

  avatarBadge: {
    position: "absolute",
    bottom: 1,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});