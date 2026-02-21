import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

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
  esCardio?: boolean;
};

export default function PanelEstadisticas({
  visible,
  onClose,
  detallesSeries,
  esCardio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isOpenRef = useRef(false); // ✅ guard anti double present/dismiss

  const snapPoints = useMemo(() => ["40%", "80%"], []);

  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      bottomSheetModalRef.current?.present();
      wasVisible.current = true;
    }

    if (!visible && wasVisible.current) {
      bottomSheetModalRef.current?.dismiss();
      wasVisible.current = false;
    }
  }, [visible]);

  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    []
  );

  const hasData = Boolean(detallesSeries && detallesSeries.length > 0);
  const topInset = Math.max(insets.top, 12);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={() => {
        isOpenRef.current = false; // ✅ sincroniza estado real
        onClose();
      }}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableOverDrag={false}
      overDragResistanceFactor={0}
      topInset={topInset}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#64748b" : "#94a3b8",
      }}
      backgroundStyle={{
        backgroundColor: isDark ? "#0b1220" : "#ffffff",
      }}
      style={{
        zIndex: 1000,
        ...(Platform.OS === "android" ? { elevation: 1000 } : null),
      }}
      containerStyle={{
        zIndex: 1000,
        ...(Platform.OS === "android" ? { elevation: 1000 } : null),
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-2 mb-4">
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
          onPress={handleClosePress}
          activeOpacity={0.85}
          className={"p-2 rounded-full " + (isDark ? "bg-white/10" : "bg-neutral-200")}
        >
          <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 120,
        }}
      >
        {hasData ? (
          <View className="flex-col gap-6">
            <GraficoPesoPorSerie series={detallesSeries as any} esCardio={esCardio} />
            <EstadisticasRendimiento detallesSeries={detallesSeries as any} esCardio={esCardio} />
            <VisualizacionesSugeridas detallesSeries={detallesSeries as any} esCardio={esCardio} />
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}