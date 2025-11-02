import React from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// ⬅️ CORREGIDO: este import era la causa habitual del “displayName of undefined”.
// Asegúrate de que la ruta exista. Si tu MensajeVacio está en otra carpeta, ajusta aquí.
import MensajeVacio from "@/shared/components/ui/MensajeVacio";

import GraficoPesoPorSerie from "./GraficoPesoPorSerie";
import VisualizacionesSugeridas from "./VisualizacionesSugeridas";
import EstadisticasRendimiento from "./EstadisticasRendimiento";

type DetalleSerie = {
  pesoKg: number;
  repeticiones: number;
  serieNumero: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  detallesSeries?: DetalleSerie[];
};

export default function PanelEstadisticas({ visible, onClose, detallesSeries }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  // Pequeña verificación defensiva: si algún import viniera undefined, avisamos.
  if (!GraficoPesoPorSerie || !EstadisticasRendimiento || !VisualizacionesSugeridas || !MensajeVacio) {
    console.warn(
      "[PanelEstadisticas] Alguno de los componentes importados es undefined. Revisa las rutas de import."
    );
  }

  return (
    <View
      className="absolute inset-0 z-40 flex-col justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      {/* Contenedor del panel */}
      <View
        className={
          "h-[95%] rounded-t-3xl p-6 " +
          (isDark
            ? "bg-[#0b1220]/95 border-t border-white/10"
            : "bg-white/95 border-t border-neutral-200")
        }
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 8,
        }}
      >
        {/* Header con botón cerrar */}
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className={
              isDark
                ? "text-white font-extrabold text-lg"
                : "text-neutral-900 font-extrabold text-lg"
            }
          >
            Estadísticas del ejercicio
          </Text>

          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar panel de estadísticas"
            activeOpacity={0.8}
            className={
              "p-2 rounded-full " +
              (isDark ? "bg-white/10" : "bg-neutral-200")
            }
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
          </TouchableOpacity>
        </View>

        {/* Contenido scrollable */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {detallesSeries && detallesSeries.length > 0 ? (
            <View className="flex-col gap-3">
              <GraficoPesoPorSerie series={detallesSeries} />
              <EstadisticasRendimiento detallesSeries={detallesSeries} />
              <VisualizacionesSugeridas detallesSeries={detallesSeries} />
            </View>
          ) : (
            <MensajeVacio
              titulo="Aún no has registrado una sesión"
              descripcion="Una vez completes al menos una sesión de este ejercicio, aquí podrás ver tus estadísticas, progreso y análisis personalizados."
              textoBoton="Crear mi rutina"
              rutaDestino="MisRutinas"
              nombreImagen="estadistica"
              mostrarBoton={false}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
