import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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

const images = {
  pesa: require("../../../../assets/mensajeVacio/pesa.webp"),
  feed: require("../../../../assets/mensajeVacio/feed.webp"),
  analisis: require("../../../../assets/mensajeVacio/analisis.webp"),
  campana: require("../../../../assets/mensajeVacio/campana.webp"),
  amigos: require("../../../../assets/mensajeVacio/amigos.webp"),
  descanso: require("../../../../assets/mensajeVacio/descanso.webp"),
  estadistica: require("../../../../assets/mensajeVacio/estadistica.webp"),
  crear: require("../../../../assets/mensajeVacio/crear.webp"),
  nopost: require("../../../../assets/mensajeVacio/nopost.webp"),
  rutinas: require("../../../../assets/mensajeVacio/rutinas.webp"),
} as const;

const getImage = (name: string) => (images as any)[name] ?? images.pesa;

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
  const t = scheme(isDark);

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

      <View style={[styles.divider, { backgroundColor: t.border }]} />

      <Text style={[styles.title, { color: t.textPrimary }]} accessibilityRole="header">
        {titulo}
      </Text>

      <View style={styles.descWrapper}>
        {typeof descripcion === "string" ? (
          <Text style={[styles.description, { color: t.textSecondary }]}>{descripcion}</Text>
        ) : (
          <View style={styles.descNode}>{descripcion}</View>
        )}
      </View>

      {mostrarBoton && (
        <TouchableOpacity
          onPress={() => navigation.navigate(rutaDestino as never)}
          style={[
            styles.cta,
            { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
          ]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={textoBoton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.ctaText, { color: t.textPrimary }]}>{textoBoton}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MensajeVacio;

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  divider: {
    width: 28,
    height: 1.5,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    textAlign: "center",
    letterSpacing: -0.2,
    lineHeight: 24,
    marginBottom: 8,
  },
  descWrapper: {
    maxWidth: 280,
    marginBottom: 24,
  },
  description: {
    fontSize: 13,
    fontFamily: Font.body.regular,
    lineHeight: 20,
    textAlign: "center",
  },
  descNode: { alignItems: "center" },
  cta: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    letterSpacing: 0.1,
  },
});
