import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity, StyleSheet } from "react-native";
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
  const isOpenRef = useRef(false);
  const wasVisible = useRef(false);

  const snapPoints = useMemo(() => ["40%", "80%"], []);

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

  // 🔹 Padding inferior = tab bar + safe area + margen extra para que nada se corte
  const bottomPadding = insets.bottom + 100;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={() => {
        isOpenRef.current = false;
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? "#ffffff" : "#171717" }]}>
          Estadísticas del ejercicio
        </Text>

        <TouchableOpacity
          onPress={handleClosePress}
          activeOpacity={0.85}
          style={[
            styles.closeBtn,
            { backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e5e5" },
          ]}
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
          // 🔹 padding inferior dinámico: safe area + margen generoso
          paddingBottom: bottomPadding,
        }}
      >
        {hasData ? (
          <View style={styles.content}>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 8,
    borderRadius: 999,
  },
  content: {
    flexDirection: "column",
    gap: 24,
  },
});