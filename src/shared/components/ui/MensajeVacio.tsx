// File: src/shared/components/ui/MensajeVacio.tsx
//
// REDESIGN — React Native + NativeWind v4
// Sistema de tokens: consistente con MisRutinas.tsx
// Lógica           : 100% intacta (props, navegación, condicionales)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — mismo sistema que MisRutinas.tsx
// ─────────────────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#475569",

    // Superficie botón
    surfaceDark: "#0F1829",
    surfaceLight: "#FFFFFF",

    // Gradiente borde botón primary (idéntico a MisRutinas)
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Imagen: halo de fondo sutil
    haloDark: "rgba(0,232,90,0.07)",
    haloLight: "rgba(0,196,77,0.06)",
    haloBorderDark: "rgba(0,232,90,0.14)",
    haloBorderLight: "rgba(0,196,77,0.12)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    full: 999,
    xl: 20,
  },
} as const;

const MARCO_GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS — sin cambios (API pública intacta)
// ─────────────────────────────────────────────────────────────────────────────
interface MensajeVacioProps {
  icono?: string;
  titulo: string;
  descripcion: string | React.ReactNode;
  textoBoton: string;
  rutaDestino: string;
  paddingTop?: number;
  mostrarBoton?: boolean;
  nombreImagen?:
  | "pesa"
  | "feed"
  | "analisis"
  | "campana"
  | "amigos"
  | "descanso"
  | "estadistica"
  | "crear"
  | "nopost"
  | "rutinas";
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS — sin cambios
// ─────────────────────────────────────────────────────────────────────────────
const images = {
  pesa: require("../../../../assets/mensajeVacio/pesa.png"),
  feed: require("../../../../assets/mensajeVacio/feed.png"),
  analisis: require("../../../../assets/mensajeVacio/analisis.png"),
  campana: require("../../../../assets/mensajeVacio/campana.png"),
  amigos: require("../../../../assets/mensajeVacio/amigos.png"),
  descanso: require("../../../../assets/mensajeVacio/descanso.png"),
  estadistica: require("../../../../assets/mensajeVacio/estadistica.png"),
  crear: require("../../../../assets/mensajeVacio/crear.png"),
  nopost: require("../../../../assets/mensajeVacio/nopost.png"),
  rutinas: require("../../../../assets/mensajeVacio/rutinas.png"),
} as const;

const obtenerImagen = (nombre: string) =>
  (images as any)[nombre] ?? images.pesa;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────
const MensajeVacio: React.FC<MensajeVacioProps> = ({
  titulo,
  descripcion,
  textoBoton,
  rutaDestino,
  paddingTop = 60,
  mostrarBoton = true,
  nombreImagen = "pesa",
}) => {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  // ── Fin lógica original ───────────────────────────────────────────────────

  return (
    <View
      style={[styles.root, { paddingTop }]}
      // FIX: "summary" no es un accessibilityRole válido en RN.
      // "none" es correcto para contenedores informativos sin rol semántico propio.
      accessibilityRole="none"
      accessibilityLabel="Mensaje informativo"
    >
      {/* ── Imagen con halo decorativo ────────────────────────────────────────
          El halo aporta profundidad sin añadir complejidad.
          La imagen sube de 96 × 96 → 128 × 128 para mejor presencia.
      ─────────────────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.imageHalo,
          {
            backgroundColor: isDark
              ? tokens.color.haloDark
              : tokens.color.haloLight,
            borderColor: isDark
              ? tokens.color.haloBorderDark
              : tokens.color.haloBorderLight,
          },
        ]}
      >
        <Image
          source={obtenerImagen(nombreImagen)}
          accessibilityIgnoresInvertColors
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* ── Título ────────────────────────────────────────────────────────── */}
      <Text
        style={[
          styles.title,
          {
            color: isDark
              ? tokens.color.textPrimaryDark
              : tokens.color.textPrimaryLight,
          },
        ]}
        accessibilityRole="header"
      >
        {titulo}
      </Text>

      {/* ── Descripción ───────────────────────────────────────────────────── */}
      <View style={styles.descWrapper}>
        {typeof descripcion === "string" ? (
          <Text
            style={[
              styles.description,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            {descripcion}
          </Text>
        ) : (
          <View style={styles.descNode}>{descripcion}</View>
        )}
      </View>

      {/* ── Botón CTA — solo si mostrarBoton = true (lógica sin cambios) ──── */}
      {mostrarBoton && (
        <LinearGradient
          colors={MARCO_GRADIENT as any}
          // Mantengo ambos: className original + style. Sin cambios de comportamiento.
          className="rounded-2xl p-[1px]"
          style={styles.gradientBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate(rutaDestino as never)}
            style={[
              styles.ctaInner,
              {
                backgroundColor: isDark
                  ? tokens.color.surfaceDark
                  : tokens.color.surfaceLight,
              },
            ]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={textoBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.ctaText,
                {
                  color: isDark
                    ? tokens.color.textPrimaryDark
                    : tokens.color.textPrimaryLight,
                },
              ]}
            >
              {textoBoton}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

export default MensajeVacio;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Contenedor raíz
  root: {
    paddingHorizontal: tokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Halo circular detrás de la imagen
  imageHalo: {
    width: 148,
    height: 148,
    borderRadius: 74,      // perfecto círculo
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  image: {
    width: 112,
    height: 112,
  },

  // Título
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: tokens.spacing.sm,
  },

  // Descripción
  descWrapper: {
    maxWidth: 320,
    marginBottom: tokens.spacing.xl,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  descNode: {
    alignItems: "center",
  },

  // Botón gradiente
  gradientBorder: {
    borderRadius: tokens.radius.full, // sobreescribe el 15 del className — más coherente con el sistema
    overflow: "hidden",
    padding: 1.5,
  },
  ctaInner: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: 12,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160, // área táctil mínima cómoda
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});