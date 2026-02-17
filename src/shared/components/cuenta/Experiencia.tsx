// File: src/features/cuenta/components/Experiencia.tsx
import React, { useMemo } from "react";
import { View, Text, Image, ImageSourcePropType, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { CheckCircle2 } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

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

    // Badge insignia
    badgeFrameDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    badgeFrameLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],
    badgeBgDark: "rgba(255,255,255,0.06)",
    badgeBgLight: "#FFFFFF",
    badgeBorderDark: "rgba(255,255,255,0.08)",
    badgeBorderLight: "transparent",

    // Label nivel (pill en esquina)
    labelBgDark: "rgba(15,24,41,0.85)",
    labelBgLight: "#FFFFFF",
    labelBorderDark: "rgba(255,255,255,0.09)",
    labelBorderLight: "rgba(0,0,0,0.07)",

    // Barra de progreso
    trackBgDark: "rgba(148,163,184,0.14)",
    trackBgLight: "#E2E8F0",
    trackBorderDark: "rgba(255,255,255,0.06)",
    barGradient: ["#8BFF62", "#00E85A", "#A855F7"] as string[],
    barDot: "#FFFFFF",
    barDotBorder: "rgba(0,0,0,0.12)",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textPercentDark: "#CBD5E1",
    textPercentLight: "#475569",

    // Max level check
    checkColor: "#00E85A",
  },
  radius: { lg: 16, md: 12, sm: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 20 },
} as const;

// ── Niveles — sin cambios ─────────────────────────────────────────────────────
type Nivel = { nombre: string; experiencia: number; icono: ImageSourcePropType };

const NIVELES: Nivel[] = [
  { nombre: "Bronce", experiencia: 0, icono: require("../../../../assets/fit/cuenta/bronce.png") },
  { nombre: "Plata", experiencia: 500, icono: require("../../../../assets/fit/cuenta/plata.png") },
  { nombre: "Oro", experiencia: 1500, icono: require("../../../../assets/fit/cuenta/oro.png") },
  { nombre: "Platino", experiencia: 3000, icono: require("../../../../assets/fit/cuenta/platino.png") },
  { nombre: "Diamante", experiencia: 5000, icono: require("../../../../assets/fit/cuenta/diamante.png") },
  { nombre: "Maestro", experiencia: 8000, icono: require("../../../../assets/fit/cuenta/maestro.png") },
  { nombre: "Élite", experiencia: 12000, icono: require("../../../../assets/fit/cuenta/elite.png") },
];

// ── Componente ────────────────────────────────────────────────────────────────
export default function Experiencia() {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const experiencia = usuario?.experiencia ?? 0;

  const { nivelActual, siguienteNivel, pct } = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < NIVELES.length; i++) {
      if (experiencia >= NIVELES[i].experiencia) idx = i;
    }
    const actual = NIVELES[idx];
    const siguiente = NIVELES[idx + 1] ?? NIVELES[idx];
    const span = Math.max(1, siguiente.experiencia - actual.experiencia);
    const prog = actual.nombre === siguiente.nombre
      ? 1
      : (experiencia - actual.experiencia) / span;
    const clamped = Math.min(Math.max(prog, 0), 1);
    return {
      nivelActual: actual,
      siguienteNivel: siguiente,
      pct: Math.round(clamped * 100),
    };
  }, [experiencia]);

  const maxLevel = nivelActual.nombre === siguienteNivel.nombre;
  // ── Fin lógica original ───────────────────────────────────────────────────

  const frameGradient = isDark ? tokens.color.frameGradientDark : tokens.color.frameGradientLight;
  const badgeFrameGrad = isDark ? tokens.color.badgeFrameDark : tokens.color.badgeFrameLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textPercent = isDark ? tokens.color.textPercentDark : tokens.color.textPercentLight;

  return (
    <View style={styles.root}>
      {/* Frame con borde gradiente */}
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
          {/* ── Insignia del nivel ────────────────────────────────────────── */}
          <View style={styles.badgeWrapper}>
            <LinearGradient
              colors={badgeFrameGrad as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeFrame}
            >
              <View
                style={[
                  styles.badgeInner,
                  {
                    backgroundColor: isDark ? tokens.color.badgeBgDark : tokens.color.badgeBgLight,
                    borderColor: isDark ? tokens.color.badgeBorderDark : tokens.color.badgeBorderLight,
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <Image
                  source={nivelActual.icono}
                  resizeMode="contain"
                  style={styles.badgeImage}
                />
              </View>
            </LinearGradient>

            {/* Pill de nombre del nivel */}
            <View
              style={[
                styles.levelLabel,
                {
                  backgroundColor: isDark ? tokens.color.labelBgDark : tokens.color.labelBgLight,
                  borderColor: isDark ? tokens.color.labelBorderDark : tokens.color.labelBorderLight,
                },
              ]}
            >
              <Text style={[styles.levelLabelText, { color: textPrimary }]}>
                {nivelActual.nombre}
              </Text>
            </View>
          </View>

          {/* ── Info y barra de progreso ──────────────────────────────────── */}
          <View style={styles.infoCol}>

            {/* Título + porcentaje */}
            <View style={styles.infoRow}>
              <Text style={[styles.infoTitle, { color: textPrimary }]}>
                Progreso de experiencia
              </Text>
              <Text style={[styles.infoPercent, { color: textPercent }]}>
                {pct}%
              </Text>
            </View>

            {/* Barra de progreso */}
            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: isDark ? tokens.color.trackBgDark : tokens.color.trackBgLight,
                  borderColor: isDark ? tokens.color.trackBorderDark : "transparent",
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <View style={[styles.progressFill, { width: `${pct}%` }]}>
                <LinearGradient
                  colors={tokens.color.barGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
                {/* Dot en el extremo */}
                <View
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: tokens.color.barDot,
                      borderColor: tokens.color.barDotBorder,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Texto auxiliar (XP / siguiente nivel) */}
            <Text style={[styles.infoFooter, { color: textSecondary }]}>
              {maxLevel ? (
                <Text style={{ color: textPrimary, fontWeight: "600" }}>
                  Nivel máximo alcanzado{" "}
                  <CheckCircle2 size={13} color={tokens.color.checkColor} strokeWidth={2.5} />
                </Text>
              ) : (
                <>
                  {experiencia}
                  <Text style={{ color: isDark ? "#475569" : "#94A3B8" }}> / </Text>
                  {siguienteNivel.experiencia} exp para{" "}
                  <Text style={{ color: textPrimary, fontWeight: "600" }}>
                    {siguienteNivel.nombre}
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 600,
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
    padding: tokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },

  // Badge (insignia + pill)
  badgeWrapper: {
    position: "relative",
  },
  badgeFrame: {
    borderRadius: tokens.radius.md,
    padding: 2,
  },
  badgeInner: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.sm,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeImage: {
    width: 70,
    height: 70,
  },

  // Pill de nombre del nivel (esquina inferior derecha)
  levelLabel: {
    position: "absolute",
    right: -6,
    bottom: -6,
    borderRadius: tokens.radius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelLabelText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Info (título, barra, footer)
  infoCol: {
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  infoPercent: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Barra de progreso
  progressTrack: {
    height: 11,
    width: "100%",
    borderRadius: tokens.radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    position: "relative",
  },
  progressGradient: {
    height: "100%",
    width: "100%",
  },
  progressDot: {
    position: "absolute",
    right: -5,
    top: "50%",
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  // Footer (texto de XP)
  infoFooter: {
    fontSize: 12,
    lineHeight: 17,
  },
});