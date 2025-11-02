import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

/* ---------------- Tipos ---------------- */
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

/* ---------------- Utils imagen ----------------
   Coloca los assets en: "@/assets/components/mensajeVacio/*.png"
*/
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

/* ---------------- Componente ---------------- */
const MensajeVacio: React.FC<MensajeVacioProps> = ({
  titulo,
  descripcion,
  textoBoton,
  rutaDestino,
  paddingTop = 60,
  mostrarBoton = true,
  nombreImagen = "pesa",
}) => {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"]

  return (
    <View
      className="px-6 items-center justify-center text-center"
      style={{ paddingTop }}
      accessibilityRole="summary"
      accessibilityLabel="Mensaje informativo"
    >
      <Image
        source={obtenerImagen(nombreImagen)}
        accessibilityIgnoresInvertColors
        className="w-24 h-24 mb-4"
        resizeMode="contain"
      />

      <Text
        className={
          isDark
            ? "text-2xl font-bold text-white mb-2"
            : "text-2xl font-bold text-gray-900 mb-2"
        }
        accessibilityRole="header"
      >
        {titulo}
      </Text>

      <View className="max-w-[560px]">
        {typeof descripcion === "string" ? (
          <Text
            className={
              isDark
                ? "text-[#94a3b8] text-base leading-relaxed mb-6 text-center"
                : "text-gray-600 text-base leading-relaxed mb-6 text-center"
            }
          >
            {descripcion}
          </Text>
        ) : (
          <View className="mb-6">{descripcion}</View>
        )}
      </View>

      {mostrarBoton && (
        <LinearGradient colors={marcoGradient as any} className="rounded-2xl p-[1px]"
                  style={{ borderRadius: 15, overflow: "hidden" }}
                >
          <TouchableOpacity
            onPress={() => navigation.navigate(rutaDestino as never)}
            className={
              "px-6 py-2 rounded-full " +
              (isDark ? "bg-[#0f172a]" : "bg-white")
            }
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={textoBoton}
          >
            <Text
              className={
                "text-sm font-semibold " +
                (isDark ? "text-white" : "text-gray-900")
              }
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
