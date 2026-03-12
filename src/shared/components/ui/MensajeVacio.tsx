import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

// ── Tokens ────────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#475569",
    textSecondaryLight: "#64748B",
    surfaceDark: "#0F1829",
    surfaceLight: "#FFFFFF",
    dividerDark: "rgba(255,255,255,0.06)",
    dividerLight: "rgba(0,0,0,0.06)",
    gradient: ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const,
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { full: 999 },
} as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface MensajeVacioProps {
  titulo: string;
  descripcion: string | React.ReactNode;
  textoBoton: string;
  rutaDestino: string;
  paddingTop?: number;
  mostrarBoton?: boolean;
  nombreImagen?:
  | "pesa" | "feed" | "analisis" | "campana" | "amigos"
  | "descanso" | "estadistica" | "crear" | "nopost" | "rutinas";
}

// ── Assets ────────────────────────────────────────────────────────────────────
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

const getImage = (name: string) => (images as any)[name] ?? images.pesa;

// ── Componente ────────────────────────────────────────────────────────────────
const MensajeVacio: React.FC<MensajeVacioProps> = ({
  titulo,
  descripcion,
  textoBoton,
  rutaDestino,
  paddingTop = 40,
  mostrarBoton = true,
  nombreImagen = "pesa",
}) => {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const surface = isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight;
  const divider = isDark ? tokens.color.dividerDark : tokens.color.dividerLight;

  return (
    <View
      style={[styles.root, { paddingTop }]}
      accessibilityRole="none"
      accessibilityLabel="Mensaje informativo"
    >
      <Image
        source={getImage(nombreImagen)}
        accessibilityIgnoresInvertColors
        style={styles.image}
        resizeMode="contain"
      />

      <View style={[styles.divider, { backgroundColor: divider }]} />

      <Text style={[styles.title, { color: textPrimary }]} accessibilityRole="header">
        {titulo}
      </Text>

      <View style={styles.descWrapper}>
        {typeof descripcion === "string" ? (
          <Text style={[styles.description, { color: textSecondary }]}>{descripcion}</Text>
        ) : (
          <View style={styles.descNode}>{descripcion}</View>
        )}
      </View>

      {mostrarBoton && (
        <LinearGradient
          colors={tokens.color.gradient}
          style={styles.gradientBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate(rutaDestino as never)}
            style={[styles.ctaInner, { backgroundColor: surface }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={textoBoton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.ctaText, { color: textPrimary }]}>{textoBoton}</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

export default MensajeVacio;

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    paddingHorizontal: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 72,
    height: 72,
    marginBottom: tokens.spacing.lg,
  },
  divider: {
    width: 28,
    height: 1.5,
    borderRadius: 2,
    marginBottom: tokens.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
    lineHeight: 24,
    marginBottom: tokens.spacing.sm,
  },
  descWrapper: {
    maxWidth: 280,
    marginBottom: tokens.spacing.lg,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  descNode: {
    alignItems: "center",
  },
  gradientBorder: {
    borderRadius: tokens.radius.full,
    padding: 1,
  },
  ctaInner: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: 10,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});