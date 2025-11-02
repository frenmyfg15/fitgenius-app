import { useEffect, useMemo, useState, useCallback } from "react";
import { Dimensions } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

/* ---- Stores / API ---- */
import { useSyncStore } from "@/features/store/useSyncStore";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { crearRutinaPersonalizada } from "@/features/api/rutinas.api";

/* ---- Tipos ---- */
import type {
  DiaSemana,
  EjercicioVisualInfo,
  EjercicioAsignadoInput,
  EjercicioCompuestoTemporal,
  TipoCompuesto,
  Item,
} from "@/features/type/crearRutina";
import { useRutinaReducer } from "@/shared/hooks/useRutinaReducer";

const DIAS: DiaSemana[] = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"];

const getValidId = (raw: unknown): number | undefined => {
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

export function useCrearRutinaState() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();
  const route = useRoute<any>();

  /* ---------- State principal del reducer ---------- */
  const [state, dispatch] = useRutinaReducer();
  const [diaSelect, setDiaSelect] = useState<DiaSemana>("LUNES");

  /* ---------- UI flags ---------- */
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [mostrarFormularioCompuesto, setMostrarFormularioCompuesto] = useState(false);
  const [mostrarFormularioNombre, setMostrarFormularioNombre] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ---------- Edición ejercicio simple ---------- */
  const [editandoEjercicio, setEditandoEjercicio] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<{
    id: number;
    info: EjercicioVisualInfo;
    orden: number;
  } | null>(null);

  /* ---------- Compuesto ---------- */
  const [modoCompuesto, setModoCompuesto] = useState(false);
  const [compuestoTemporal, setCompuestoTemporal] = useState<EjercicioCompuestoTemporal[]>([]);
  const [ejercicioEnCompuestoActual, setEjercicioEnCompuestoActual] = useState<{
    id: number;
    info: EjercicioVisualInfo;
  } | null>(null);

  const [editarCompuesto, setEditarCompuesto] = useState<null | {
    compuestoId: number;
    orden: number;
    ejercicios: EjercicioAsignadoInput[];
    nombre: string;
    tipo: string;
    descansoSeg: number;
  }>(null);

  /* ---------- Selección lista ---------- */
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const ejerciciosDia =
    (state.dias.find((d: any) => d.diaSemana === diaSelect)?.ejercicios ?? []) as Item[];

  const haySeleccion =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < ejerciciosDia.length;

  const puedeSubir = !!haySeleccion && selectedIndex! > 0;
  const puedeBajar = !!haySeleccion && selectedIndex! < ejerciciosDia.length - 1;

  const puedePegar = Boolean((state as any).clipboard && (state as any).clipboard.length > 0);

  /* ---------- UI constants ---------- */
  const ui = useMemo(
    () => ({
      marcoGradient: ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"],
      bg: isDark ? "#0b1220" : "#ffffff",
      textPrimary: isDark ? "#e5e7eb" : "#0f172a",
      textSecondary: isDark ? "#94a3b8" : "#64748b",
      chipBg: isDark ? "rgba(148,163,184,0.16)" : "#f1f5f9",
      chipBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
      cardBg: isDark ? "rgba(20,28,44,0.85)" : "#ffffff",
      cardBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      tabActiveBg: ["#8bff62", "#39ff14", "#a855f7"] as const,
      screenH: Dimensions.get("window").height,
    }),
    [isDark]
  );

  /* ---------- Edit ID: params o AsyncStorage ---------- */
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const isEdit = typeof editId === "number";

  useEffect(() => {
    (async () => {
      const paramId = getValidId(route?.params?.id);
      if (paramId) return setEditId(paramId);
      const ls = await AsyncStorage.getItem("rutinaEditId");
      const lsId = getValidId(ls ?? undefined);
      if (lsId) setEditId(lsId);
    })();
  }, [route?.params?.id]);

  /* ---------- Acciones compuesto ---------- */
  const iniciarCompuesto = () => {
    setModoCompuesto(true);
    setMostrarBuscador(true);
  };

  const confirmarCompuesto = () => {
    if (compuestoTemporal.length === 0) return;
    setMostrarFormularioCompuesto(true);
  };

  /* ---------- Crear / Actualizar rutina ---------- */
  const handleCrearRutina = useCallback(async () => {
    if (!state.nombre.trim()) {
      Toast.show({ type: "error", text1: "El nombre de la rutina es obligatorio" });
      return;
    }
    setLoading(true);
    try {
      await crearRutinaPersonalizada(
        { nombre: state.nombre, descripcion: state.descripcion, dias: state.dias },
        editId
      );

      if (!isEdit) {
        const { usuario, setUsuario } = useUsuarioStore.getState();
        if (usuario) {
          setUsuario({ ...usuario, rutinasManualCreadas: (usuario.rutinasManualCreadas ?? 0) + 1 });
        }
        Toast.show({ type: "success", text1: "Rutina creada exitosamente" });
        dispatch({ type: "CLEAR" });
      } else {
        await AsyncStorage.removeItem("rutinaEditId");
        Toast.show({ type: "success", text1: "Rutina actualizada" });
      }

      useSyncStore.getState().bumpRoutineRev();
      nav.navigate("MisRutinas");
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e?.message || (isEdit ? "Error al actualizar la rutina" : "Error al crear la rutina"),
      });
    } finally {
      setLoading(false);
    }
  }, [state, editId, isEdit, nav, dispatch]);

  const handleCancelarEdicion = useCallback(async () => {
    try {
      dispatch({ type: "SET_NOMBRE", payload: "" });
      dispatch({ type: "SET_DESCRIPCION", payload: "" });

      const diasPresentes = (state.dias ?? []).map((d: any) => d.diaSemana);
      diasPresentes.forEach((ds: any) => {
        dispatch({ type: "REORDER_EJERCICIOS", payload: { diaSemana: ds, ejercicios: [] } });
      });

      await AsyncStorage.multiRemove(["crearRutinaState", "rutinaEditId"]);
      setEditId(undefined);
      Toast.show({ type: "info", text1: "Edición cancelada" });
    } catch {
      // noop
    }
  }, [state.dias, dispatch]);

  /* ---------- Helpers selección ---------- */
  const handleEditarSeleccion = () => {
    if (!haySeleccion) return;
    const ej = ejerciciosDia[selectedIndex!];

    if ("compuesto" in ej && ej.compuesto) {
      setEditarCompuesto({
        compuestoId: ej.ejerciciosCompuestos?.[0]?.ejercicioCompuestoId!,
        orden: ej.orden,
        ejercicios: ej.ejerciciosCompuestos!,
        nombre: ej.nombreCompuesto!,
        tipo: ej.tipoCompuesto!,
        descansoSeg: ej.descansoCompuesto ?? 0,
      });
    } else {
      setEditarCompuesto(null);
      setEjercicioSeleccionado({
        id: ej.ejercicioId!,
        info: ej.ejercicioInfo!,
        orden: ej.orden,
      });
      setEditandoEjercicio(true);
    }
  };

  const handleEliminarSeleccion = () => {
    if (!haySeleccion) return;
    const ej = ejerciciosDia[selectedIndex!];

    if ("compuesto" in ej && ej.compuesto) {
      const compuestoId = ej.ejerciciosCompuestos?.[0]?.ejercicioCompuestoId!;
      dispatch({ type: "REMOVE_EJERCICIO", payload: { diaSemana: diaSelect, compuestoId } });
    } else {
      dispatch({ type: "REMOVE_EJERCICIO", payload: { diaSemana: diaSelect, orden: ej.orden } });
    }
    setSelectedIndex(null);
  };

  const handleSubirSeleccion = () => {
    if (!puedeSubir) return;
    const nueva = [...ejerciciosDia];
    [nueva[selectedIndex! - 1], nueva[selectedIndex!]] = [nueva[selectedIndex!], nueva[selectedIndex! - 1]];
    const reorden = nueva.map((e, i) => ({ ...e, orden: i + 1 }));
    dispatch({ type: "REORDER_EJERCICIOS", payload: { diaSemana: diaSelect, ejercicios: reorden } });
    setSelectedIndex(selectedIndex! - 1);
  };

  const handleBajarSeleccion = () => {
    if (!puedeBajar) return;
    const nueva = [...ejerciciosDia];
    [nueva[selectedIndex!], nueva[selectedIndex! + 1]] = [nueva[selectedIndex! + 1], nueva[selectedIndex!]];
    const reorden = nueva.map((e, i) => ({ ...e, orden: i + 1 }));
    dispatch({ type: "REORDER_EJERCICIOS", payload: { diaSemana: diaSelect, ejercicios: reorden } });
    setSelectedIndex(selectedIndex! + 1);
  };

  /* ---------- Expose API ---------- */
  return {
    // reducer
    state,
    dispatch,

    // selección día
    DIAS,
    diaSelect,
    setDiaSelect,

    // lista/selección
    ejerciciosDia,
    selectedIndex,
    setSelectedIndex,
    haySeleccion,
    puedeSubir,
    puedeBajar,
    puedePegar,

    // flags UI
    mostrarBuscador,
    setMostrarBuscador,
    confirmClear,
    setConfirmClear,
    mostrarFormularioCompuesto,
    setMostrarFormularioCompuesto,
    mostrarFormularioNombre,
    setMostrarFormularioNombre,
    loading,

    // edición simple
    editandoEjercicio,
    setEditandoEjercicio,
    ejercicioSeleccionado,
    setEjercicioSeleccionado,

    // compuesto
    modoCompuesto,
    setModoCompuesto,
    compuestoTemporal,
    setCompuestoTemporal,
    ejercicioEnCompuestoActual,
    setEjercicioEnCompuestoActual,
    editarCompuesto,
    setEditarCompuesto,

    // meta edición
    editId,
    isEdit,

    // estilos/constantes
    ui,
    isDark,

    // acciones
    iniciarCompuesto,
    confirmarCompuesto,
    handleCrearRutina,
    handleCancelarEdicion,
    handleEditarSeleccion,
    handleEliminarSeleccion,
    handleSubirSeleccion,
    handleBajarSeleccion,

    // utilidades externas
    Toast, // por si quieres toasts locales en la pantalla
  };
}
