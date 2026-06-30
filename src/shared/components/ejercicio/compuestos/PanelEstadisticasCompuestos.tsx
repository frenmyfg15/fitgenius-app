import React, { useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";

// 👇 Subcomponentes de compuestos
import GraficoVolumenPorSerieCompuestos from "./GraficoVolumenPorSerieCompuestos";
import EstadisticasRendimientoCompuestos from "./EstadisticasRendimientoCompuestos";
import VisualizacionesSugeridasCompuestos from "./VisualizacionesSugeridasCompuestos";

/** ================= Tipos mínimos usados en el panel ================= */
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
  /** Pásame exactamente lo que llega en `ultimaSesion` del backend para compuestos */
  ultimaSesion?: UltimaSesionCompuesta | null;
};

/**
 * PanelEstadisticasCompuestos
 * - Normaliza `detallesSeriesCompuestas` a una lista plana por registro, preservando `serieNumero`.
 * - Llama SIEMPRE a los hooks antes de cualquier return condicional para evitar
 *   “Rendered more hooks than during the previous render”.
 */
export default function PanelEstadisticasCompuestos({
  visible,
  onClose,
  ultimaSesion,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ✅ Hook SIEMPRE se ejecuta, independientemente de `visible`
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

  // 🔒 Chequeo defensivo de imports (no afecta hooks)
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

  // ⛔ Return condicional DESPUÉS de los hooks
  if (!visible) return null;

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
            ? "bg-[#111111]/95 border-t border-white/10"
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
            Estadísticas del ejercicio compuesto
          </Text>

          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar panel de estadísticas (compuestos)"
            activeOpacity={0.8}
            className={"p-2 rounded-full " + (isDark ? "bg-white/10" : "bg-neutral-200")}
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
          </TouchableOpacity>
        </View>

        {/* Contenido scrollable */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {hayDatos ? (
            <View className="flex-col gap-3">
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
