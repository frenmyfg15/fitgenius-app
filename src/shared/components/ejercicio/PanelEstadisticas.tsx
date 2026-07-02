import React, { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { View, Text, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { X, CalendarDays } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import CalendarioSesiones from "@/shared/components/ui/CalendarioSesiones";
import GraficoPesoPorSerie from "./GraficoPesoPorSerie";
import EstadisticasRendimiento from "./EstadisticasRendimiento";
import VisualizacionesSugeridas from "./VisualizacionesSugeridas";
import { obtenerSesionesEjercicio } from "@/features/api/ejercicios.api";

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
  ejercicioId?: number | null;
};

const formatearFecha = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const texto = dt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export default function PanelEstadisticas({
  visible,
  onClose,
  detallesSeries,
  esCardio,
  ejercicioId,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isOpenRef = useRef(false);
  const wasVisible = useRef(false);

  const snapPoints = useMemo(() => ["40%", "80%"], []);

  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [detallesActuales, setDetallesActuales] = useState<DetalleSerie[] | undefined>(
    detallesSeries
  );
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(false);

  useEffect(() => {
    if (!visible || !ejercicioId) return;

    let cancelado = false;
    setCargandoSesion(true);

    obtenerSesionesEjercicio(ejercicioId)
      .then((data) => {
        if (cancelado) return;
        setFechasDisponibles(data?.fechasDisponibles ?? []);
        if (data?.sesion) {
          setDetallesActuales(data.sesion.detallesSeries ?? []);
          setFechaSeleccionada(
            typeof data.sesion.fecha === "string"
              ? data.sesion.fecha.slice(0, 10)
              : null
          );
        }
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelado) setCargandoSesion(false);
      });

    return () => {
      cancelado = true;
    };
  }, [visible, ejercicioId]);

  useEffect(() => {
    if (!visible) {
      setCalendarioAbierto(false);
    }
  }, [visible]);

  const handleSelectFecha = useCallback(
    (ymd: string) => {
      if (!ejercicioId || ymd === fechaSeleccionada) {
        setCalendarioAbierto(false);
        return;
      }

      setCargandoSesion(true);
      obtenerSesionesEjercicio(ejercicioId, ymd)
        .then((data) => {
          if (data?.sesion) {
            setDetallesActuales(data.sesion.detallesSeries ?? []);
            setFechaSeleccionada(ymd);
          }
        })
        .catch(() => { })
        .finally(() => {
          setCargandoSesion(false);
          setCalendarioAbierto(false);
        });
    },
    [ejercicioId, fechaSeleccionada]
  );

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

  const hasData = Boolean(detallesActuales && detallesActuales.length > 0);
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
        backgroundColor: t.textSecondary,
      }}
      backgroundStyle={{
        backgroundColor: isDark ? Colors.primary : Colors.secondary,
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
        <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
          Estadísticas del ejercicio
        </Text>

        <TouchableOpacity
          onPress={handleClosePress}
          activeOpacity={0.85}
          style={[
            styles.closeBtn,
            { backgroundColor: isDark ? t.borderStrong : t.surface },
          ]}
        >
          <X size={20} color={t.textPrimary} />
        </TouchableOpacity>
      </View>

      {!!ejercicioId && (fechaSeleccionada || fechasDisponibles.length > 0) && (
        <View style={styles.fechaRow}>
          <Text style={[styles.fechaTexto, { color: t.textSecondary }]}>
            {fechaSeleccionada ? formatearFecha(fechaSeleccionada) : "Sesión"}
          </Text>

          <TouchableOpacity
            onPress={() => setCalendarioAbierto((v) => !v)}
            activeOpacity={0.85}
            style={[
              styles.fechaBtn,
              { backgroundColor: isDark ? t.border : t.surface },
            ]}
          >
            <CalendarDays size={14} color={t.textPrimary} />
            <Text style={{ fontFamily: Font.body.semiBold, fontSize: 12, color: t.textPrimary }}>
              {calendarioAbierto ? "Cerrar" : "Ver otro día"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
        {calendarioAbierto && (
          <View style={[styles.calendarioWrap, { borderColor: t.border }]}>
            <CalendarioSesiones
              visible={calendarioAbierto}
              fechasDisponibles={fechasDisponibles}
              fechaSeleccionada={fechaSeleccionada}
              onSelectFecha={handleSelectFecha}
            />
          </View>
        )}

        {hasData ? (
          <View style={[styles.content, { opacity: cargandoSesion ? 0.5 : 1 }]}>
            <GraficoPesoPorSerie series={detallesActuales as any} esCardio={esCardio} />
            <EstadisticasRendimiento detallesSeries={detallesActuales as any} esCardio={esCardio} />
            <VisualizacionesSugeridas detallesSeries={detallesActuales as any} esCardio={esCardio} />
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
    ...TextStyle.h3,
    fontFamily: Font.title.semiBold,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 999,
  },
  fechaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  fechaTexto: {
    fontSize: 13,
    fontFamily: Font.body.medium,
  },
  fechaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  calendarioWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  content: {
    flexDirection: "column",
    gap: 24,
  },
});