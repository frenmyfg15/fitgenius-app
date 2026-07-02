import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView, Text, StyleSheet } from "react-native";
import { X, CalendarDays } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import CalendarioSesiones from "@/shared/components/ui/CalendarioSesiones";

import GraficoVolumenPorSerieCompuestos from "./GraficoVolumenPorSerieCompuestos";
import EstadisticasRendimientoCompuestos from "./EstadisticasRendimientoCompuestos";
import VisualizacionesSugeridasCompuestos from "./VisualizacionesSugeridasCompuestos";
import { obtenerSesionesEjercicioCompuesto } from "@/features/api/ejercicios.api";

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
  ejercicioCompuestoId?: number | null;
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

export default function PanelEstadisticasCompuestos({
  visible,
  onClose,
  ultimaSesion,
  ejercicioCompuestoId,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const [sesionActual, setSesionActual] = useState<UltimaSesionCompuesta | null | undefined>(
    ultimaSesion
  );
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current && ejercicioCompuestoId) {
      setCargandoSesion(true);
      obtenerSesionesEjercicioCompuesto(ejercicioCompuestoId)
        .then((data) => {
          setFechasDisponibles(data?.fechasDisponibles ?? []);
          if (data?.sesion) {
            setSesionActual(data.sesion);
            setFechaSeleccionada(
              typeof data.sesion.fecha === "string" ? data.sesion.fecha.slice(0, 10) : null
            );
          }
        })
        .catch(() => { })
        .finally(() => setCargandoSesion(false));
    }
    if (!visible) {
      setCalendarioAbierto(false);
    }
    wasVisible.current = visible;
  }, [visible, ejercicioCompuestoId]);

  const handleSelectFecha = useCallback(
    (ymd: string) => {
      if (!ejercicioCompuestoId || ymd === fechaSeleccionada) {
        setCalendarioAbierto(false);
        return;
      }

      setCargandoSesion(true);
      obtenerSesionesEjercicioCompuesto(ejercicioCompuestoId, ymd)
        .then((data) => {
          if (data?.sesion) {
            setSesionActual(data.sesion);
            setFechaSeleccionada(ymd);
          }
        })
        .catch(() => { })
        .finally(() => {
          setCargandoSesion(false);
          setCalendarioAbierto(false);
        });
    },
    [ejercicioCompuestoId, fechaSeleccionada]
  );

  const registrosPlanos = useMemo(() => {
    const detalles = sesionActual?.detallesSeriesCompuestas ?? [];
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
  }, [sesionActual]);

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

        {!!ejercicioCompuestoId && (fechaSeleccionada || fechasDisponibles.length > 0) && (
          <View style={styles.fechaRow}>
            <Text style={[styles.fechaTexto, { color: t.textSecondary }]}>
              {fechaSeleccionada ? formatearFecha(fechaSeleccionada) : "Sesión"}
            </Text>

            <TouchableOpacity
              onPress={() => setCalendarioAbierto((v) => !v)}
              activeOpacity={0.85}
              style={[styles.fechaBtn, { backgroundColor: isDark ? t.border : t.surface }]}
            >
              <CalendarDays size={14} color={t.textPrimary} />
              <Text style={{ fontFamily: Font.body.semiBold, fontSize: 12, color: t.textPrimary }}>
                {calendarioAbierto ? "Cerrar" : "Ver otro día"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
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

          {hayDatos ? (
            <View style={{ gap: 12, opacity: cargandoSesion ? 0.5 : 1 }}>
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
  fechaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
