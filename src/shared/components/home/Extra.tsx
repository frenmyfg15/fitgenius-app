// File: src/features/premium/Extra.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Flame, Medal, Dumbbell } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CaloriasModal from "./CaloriasModal";
import ExperienciaModal from "./ExperienciaModal";
import EjerciciosModal from "./EjerciciosModal";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "#0F1829",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.07)",
    cardBorderLight: "rgba(0,0,0,0.08)",

    iconBgDark: "rgba(255,255,255,0.05)",
    iconBgLight: "#F1F5F9",
    iconBorderDark: "rgba(255,255,255,0.08)",
    iconBorderLight: "rgba(0,0,0,0.06)",

    // Colores de icono adaptados a dark/light
    iconDark: "#CBD5E1",
    iconLight: "#475569",

    valueDark: "#F1F5F9",
    valueLight: "#0F172A",
    labelDark: "#64748B",
    labelLight: "#64748B",

    // Dots de estado (identifican cada métrica)
    dotCal: "#22C55E",
    dotXP: "#A855F7",
    dotEj: "#10B981",
  },
  radius: { lg: 16, md: 10 },
  spacing: { sm: 8, md: 12 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos — sin cambios ───────────────────────────────────────────────────────
type Props = { ejercicios: number };

// ── Utils — sin cambios ───────────────────────────────────────────────────────
function formatCompactES(value: number) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs < 1000) return new Intl.NumberFormat("es-ES").format(n);
  if (abs < 1_000_000) {
    const v = abs / 1000;
    return `${sign}${v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "")}k`;
  }
  if (abs < 1_000_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "")}M`;
  }
  const v = abs / 1_000_000_000;
  return `${sign}${v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "")}B`;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function Extra({ ejercicios }: Props) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const calorias = useUsuarioStore((s) => s.usuario?.caloriasMes ?? 0);
  const experiencia = useUsuarioStore((s) => s.usuario?.experiencia ?? 0);

  const [showCal, setShowCal] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showEj, setShowEj] = useState(false);

  const iconColor = isDark ? tokens.color.iconDark : tokens.color.iconLight;

  const items = [
    {
      key: "calorias" as const,
      icon: <Flame size={18} color={iconColor} strokeWidth={2} />,
      value: calorias,
      label: "Calorías quemadas",
      dotColor: tokens.color.dotCal,
      onPress: () => setShowCal(true),
    },
    {
      key: "experiencia" as const,
      icon: <Medal size={18} color={iconColor} strokeWidth={2} />,
      value: experiencia,
      label: "Puntos de XP",
      dotColor: tokens.color.dotXP,
      onPress: () => setShowXP(true),
    },
    {
      key: "ejercicios" as const,
      icon: <Dumbbell size={18} color={iconColor} strokeWidth={2} />,
      value: ejercicios,
      label: "Ejercicios hoy",
      dotColor: tokens.color.dotEj,
      onPress: () => setShowEj(true),
    },
  ] as const;
  // ── Fin lógica original ───────────────────────────────────────────────────

  return (
    <>
      <View style={styles.row}>
        {items.map((it) => (
          <LinearGradient
            key={it.key}
            colors={GRADIENT as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${it.label}: ${formatCompactES(it.value)}`}
              onPress={it.onPress}
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                  borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
                },
              ]}
            >
              {/* Icono */}
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isDark ? tokens.color.iconBgDark : tokens.color.iconBgLight,
                    borderColor: isDark ? tokens.color.iconBorderDark : tokens.color.iconBorderLight,
                  },
                ]}
              >
                {it.icon}
              </View>

              {/* Valor */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.value,
                  { color: isDark ? tokens.color.valueDark : tokens.color.valueLight },
                ]}
              >
                {formatCompactES(it.value)}
              </Text>

              {/* Etiqueta */}
              <Text
                style={[
                  styles.label,
                  { color: isDark ? tokens.color.labelDark : tokens.color.labelLight },
                ]}
              >
                {it.label}
              </Text>

              {/* Dot identificador (esquina superior derecha) */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: it.dotColor,
                    borderColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                  },
                ]}
                accessibilityElementsHidden
              />
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>

      {/* Modales — sin cambios */}
      <CaloriasModal visible={showCal} onClose={() => setShowCal(false)} value={calorias} />
      <ExperienciaModal visible={showXP} onClose={() => setShowXP(false)} value={experiencia} />
      <EjerciciosModal visible={showEj} onClose={() => setShowEj(false)} value={ejercicios} />
    </>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacing.md,
  },

  gradientBorder: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  card: {
    width: 108,
    height: 126,
    borderRadius: tokens.radius.lg - 1,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.sm,
    position: "relative",
    overflow: "hidden",
    // Sombra sutil
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  value: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
  },

  label: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.1,
    lineHeight: 13,
  },

  // Dot de color en esquina superior derecha
  dot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});