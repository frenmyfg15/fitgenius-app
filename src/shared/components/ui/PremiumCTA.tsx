// File: src/features/cuenta/components/PremiumMiniCTACard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, Sparkles } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Frame gradient
    frameGradientDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    frameGradientLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],

    // Card interior
    cardBgDark: "rgba(15,24,41,0.70)",
    cardBgLight: "rgba(255,255,255,0.95)",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Icono Crown
    crownBgDark: "rgba(30,40,60,0.70)",
    crownBgLight: "#1E293B",
    crownColor: "#FFFFFF",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",

    // CTA button (dark)
    ctaBgDark: "rgba(255,255,255,0.08)",
    ctaBorderDark: "rgba(255,255,255,0.08)",

    // CTA button (light) — gradiente verde
    ctaGradientLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],
    ctaBgLight: "#FFFFFF",
  },
  radius: { lg: 16, md: 12, sm: 10 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
} as const;

// ── Componente ────────────────────────────────────────────────────────────────
export default function PremiumMiniCTACard() {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const navigation = useNavigation<any>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(false);

  const handleGoToPayment = () => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  };

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleGoToPayment();
    }, 350);
  };
  // ── Fin lógica original ───────────────────────────────────────────────────

  const frameGradient = isDark ? tokens.color.frameGradientDark : tokens.color.frameGradientLight;

  return (
    <LinearGradient
      colors={frameGradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.frame}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
            borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
          },
        ]}
      >
        <View style={styles.row}>

          {/* ── Icono + Textos ────────────────────────────────────────────── */}
          <View style={styles.leftContent}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: isDark ? tokens.color.crownBgDark : tokens.color.crownBgLight },
              ]}
            >
              <Crown size={15} color={tokens.color.crownColor} strokeWidth={2.2} />
            </View>

            <View style={styles.textCol}>
              <Text
                numberOfLines={1}
                style={[styles.title, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}
              >
                Hazte Premium
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.subtitle, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}
              >
                IA avanzada y todo el catálogo
              </Text>
            </View>
          </View>

          {/* ── Precio ────────────────────────────────────────────────────── */}
          <View style={styles.price}>
            <Text style={[styles.priceAmount, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
              €4,99
            </Text>
            <Text style={[styles.pricePeriod, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
              /mes
            </Text>
          </View>

          {/* ── CTA Button ─────────────────────────────────────────────────── */}
          {isDark ? (
            <View style={[styles.ctaWrapperDark, { borderColor: tokens.color.ctaBorderDark }]}>
              <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Obtener Premium"
                style={[styles.ctaBtn, { backgroundColor: tokens.color.ctaBgDark, opacity: loading ? 0.7 : 1 }]}
              >
                {loading
                  ? <ActivityIndicator size="small" color={tokens.color.textPrimaryDark} />
                  : <Sparkles size={15} color={tokens.color.textPrimaryDark} strokeWidth={2} />
                }
                <Text style={[styles.ctaText, { color: tokens.color.textPrimaryDark }]}>
                  {loading ? "Abriendo…" : "Obtener"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <LinearGradient
              colors={tokens.color.ctaGradientLight as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Obtener Premium"
                style={[styles.ctaBtn, { backgroundColor: tokens.color.ctaBgLight, opacity: loading ? 0.7 : 1 }]}
              >
                {loading
                  ? <ActivityIndicator size="small" color={tokens.color.textPrimaryLight} />
                  : <Sparkles size={15} color={tokens.color.textPrimaryLight} strokeWidth={2} />
                }
                <Text style={[styles.ctaText, { color: tokens.color.textPrimaryLight }]}>
                  {loading ? "Abriendo…" : "Obtener"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Frame exterior (gradiente)
  frame: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  // Card interior
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    paddingHorizontal: tokens.radius.lg,
    paddingVertical: tokens.spacing.md,
  },

  // Fila principal
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
  },

  // Contenido izquierdo (icono + texto)
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.1,
  },

  // Precio
  price: {
    alignItems: "flex-end",
    marginRight: tokens.spacing.xs,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  pricePeriod: {
    fontSize: 11,
    lineHeight: 14,
  },

  // CTA wrapper (dark mode)
  ctaWrapperDark: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: 1,
  },

  // CTA gradient (light mode)
  ctaGradient: {
    borderRadius: tokens.radius.md,
    padding: 1,
  },

  // Botón CTA (interior)
  ctaBtn: {
    borderRadius: tokens.radius.md - 1,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});