import React, { useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Text, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";

import GraficoVolumenPorSerieCompuestos from "./GraficoVolumenPorSerieCompuestos";
import EstadisticasRendimientoCompuestos from "./EstadisticasRendimientoCompuestos";
import VisualizacionesSugeridasCompuestos from "./VisualizacionesSugeridasCompuestos";

type EjercicioMini = {
  id: number;
  nombre: string;
  grupoMuscular: string;
  musculoPrincipal: string;
  idGif: string;
};

type RegistroEjercicio = {
  id: number;
  detalleSerieCompuestaId: number;
  ejercicioId: number;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
  ejercicio: EjercicioMini;
};

type DetalleSerieCompuesta = {
  id: number;
  sesionCompuestaId: number;
  serieNumero: number;
  registrosEjercicios: RegistroEjercicio[];
};

type UltimaSesionCompuesta = {
  id: number;
  usuarioId: number;
  ejercicioCompuestoId: number;
  fecha: string;
  completado: boolean;
  caloriasQuemadas: number;
  detallesSeriesCompuestas: DetalleSerieCompuesta[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  ultimaSesion?: UltimaSesionCompuesta | null;
};

export default function PanelEstadisticasCompuestos({
  visible,
  onClose,
  ultimaSesion,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const registrosPlanos = useMemo(() => {
    const detalles = ultimaSesion?.detallesSeriesCompuestas ?? [];
    return detalles.flatMap((det) =>
      (det.registrosEjercicios || []).map((reg) => ({
        serieNumero: det.serieNumero,
        ejercicioId: reg.ejercicioId,
        nombre: reg.ejercicio?.nombre ?? "Ejercicio",
        grupoMuscular: reg.ejercicio?.grupoMuscular ?? "",
        musculoPrincipal: reg.ejercicio?.musculoPrincipal ?? "",
        idGif: reg.ejercicio?.idGif ?? "",
        pesoKg: typeof reg.pesoKg === "number" ? reg.pesoKg : null,
        repeticiones: typeof reg.repeticiones === "number" ? reg.repeticiones : null,
        duracionSegundos:
          typeof reg.duracionSegundos === "number" ? reg.duracionSegundos : null,
      }))
    );
  }, [ultimaSesion]);

  const hayDatos = (registrosPlanos?.length ?? 0) > 0;

  if (
    !GraficoVolumenPorSerieCompuestos ||
    !EstadisticasRendimientoCompuestos ||
    !VisualizacionesSugeridasCompuestos ||
    !MensajeVacio
  ) {
    console.warn(
      "[PanelEstadisticasCompuestos] Alguno de los componentes importados es undefined. Revisa las rutas de import."
    );
  }

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: isDark ? Colors.primary : Colors.secondary,
            borderColor: t.border,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Estadísticas del ejercicio compuesto
          </Text>

          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar panel de estadísticas (compuestos)"
            activeOpacity={0.8}
            style={[styles.closeBtn, { backgroundColor: isDark ? t.borderStrong : t.surface }]}
          >
            <X size={20} color={t.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {hayDatos ? (
            <View style={{ gap: 12 }}>
              <GraficoVolumenPorSerieCompuestos registros={registrosPlanos} />
              <EstadisticasRendimientoCompuestos registros={registrosPlanos} />
              <VisualizacionesSugeridasCompuestos registros={registrosPlanos} />
            </View>
          ) : (
            <MensajeVacio
              titulo="Aún no has registrado una sesión compuesta"
              descripcion="Cuando completes al menos una sesión de este ejercicio compuesto, verás aquí tus estadísticas, volumen por ejercicio y evolución."
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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 40,
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  panel: {
    height: "95%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    ...TextStyle.h3,
    fontFamily: Font.title.semiBold,
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 999,
  },
});
