// File: src/features/cuenta/components/Perfil.tsx
import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Frame gradient
    frameGradientDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    frameGradientLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],

    // Card interior
    cardBgDark: "rgba(15,24,41,0.70)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Avatar
    avatarRingDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    avatarRingLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],
    avatarBgDark: "rgba(255,255,255,0.06)",
    avatarBgLight: "#F5F5F5",
    avatarBorderDark: "rgba(255,255,255,0.08)",
    avatarInitialsDark: "#CBD5E1",
    avatarInitialsLight: "#6B7280",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",

    // Chip normal (métricas)
    chipBgDark: "rgba(148,163,184,0.12)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",
    chipTextDark: "#CBD5E1",
    chipTextLight: "#475569",

    // ChipSoft (objetivo)
    chipSoftBgDark: "rgba(15,24,41,0.60)",
    chipSoftBgLight: "#FFFFFF",
    chipSoftBorderDark: "rgba(255,255,255,0.09)",
    chipSoftBorderLight: "rgba(0,0,0,0.06)",
  },
  radius: { lg: 16, full: 999 },
  spacing: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

// ── Componente ────────────────────────────────────────────────────────────────
export default function Perfil() {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();

  const iniciales = useMemo(() => {
    const n = (usuario?.nombre?.[0] ?? "").toUpperCase();
    const a = (usuario?.apellido?.[0] ?? "").toUpperCase();
    return (n + a) || "U";
  }, [usuario?.nombre, usuario?.apellido]);

  if (!usuario) return null;
  // ── Fin lógica original ───────────────────────────────────────────────────

  const frameGradient = isDark ? tokens.color.frameGradientDark : tokens.color.frameGradientLight;
  const avatarRing = isDark ? tokens.color.avatarRingDark : tokens.color.avatarRingLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <View style={styles.root}>
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

            {/* ── Avatar ──────────────────────────────────────────────────── */}
            <LinearGradient
              colors={avatarRing as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View
                style={[
                  styles.avatarInner,
                  {
                    backgroundColor: isDark ? tokens.color.avatarBgDark : tokens.color.avatarBgLight,
                    borderColor: isDark ? tokens.color.avatarBorderDark : "transparent",
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                {usuario.imagenPerfil ? (
                  <Image
                    source={{ uri: usuario.imagenPerfil }}
                    resizeMode="cover"
                    style={styles.avatarImage}
                    accessibilityLabel={`Foto de ${usuario.nombre ?? "usuario"}`}
                  />
                ) : (
                  <Text
                    accessibilityLabel="Avatar por defecto"
                    style={[
                      styles.avatarInitials,
                      { color: isDark ? tokens.color.avatarInitialsDark : tokens.color.avatarInitialsLight },
                    ]}
                  >
                    {iniciales}
                  </Text>
                )}
              </View>
            </LinearGradient>

            {/* ── Info ─────────────────────────────────────────────────────── */}
            <View style={styles.infoCol}>
              {/* Nombre completo */}
              <Text numberOfLines={1} style={[styles.name, { color: textPrimary }]}>
                {usuario.nombre} {usuario.apellido}
              </Text>

              {/* Email */}
              <Text numberOfLines={1} style={[styles.email, { color: textSecondary }]}>
                {usuario.correo}
              </Text>

              {/* Métricas (edad, peso, altura) */}
              <View style={styles.metricsRow}>
                <Chip isDark={isDark}>{usuario.edad} años</Chip>
                <Chip isDark={isDark}>
                  {usuario.peso} {usuario.medidaPeso}
                </Chip>
                <Chip isDark={isDark}>
                  {usuario.altura} {usuario.medidaAltura}
                </Chip>
              </View>

              {/* Objetivo (peso + lugar) */}
              <View style={styles.goalsRow}>
                <ChipSoft isDark={isDark}>
                  Meta: {usuario.pesoObjetivo} {usuario.medidaPeso}
                </ChipSoft>

                {"lugarEntrenamiento" in usuario && (
                  <ChipSoft isDark={isDark}>
                    Lugar: {(usuario as any).lugarEntrenamiento}
                  </ChipSoft>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Chip (métricas) ───────────────────────────────────────────────────────────
function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
          borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: isDark ? tokens.color.chipTextDark : tokens.color.chipTextLight }]}>
        {children}
      </Text>
    </View>
  );
}

// ── ChipSoft (objetivo) ───────────────────────────────────────────────────────
function ChipSoft({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={[
        styles.chipSoft,
        {
          backgroundColor: isDark ? tokens.color.chipSoftBgDark : tokens.color.chipSoftBgLight,
          borderColor: isDark ? tokens.color.chipSoftBorderDark : tokens.color.chipSoftBorderLight,
        },
      ]}
    >
      <Text style={[styles.chipSoftText, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
        {children}
      </Text>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  // Frame gradiente
  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
  },

  // Card interior
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.xl,
  },

  // Fila principal
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.lg,
  },

  // Avatar
  avatarRing: {
    borderRadius: tokens.radius.full,
    padding: 2,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Info
  infoCol: {
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  email: {
    fontSize: 12,
  },

  // Métricas
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },

  // Chips de métricas
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Objetivos
  goalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginTop: 2,
  },

  // ChipSoft
  chipSoft: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  chipSoftText: {
    fontSize: 11,
    fontWeight: "500",
  },
});