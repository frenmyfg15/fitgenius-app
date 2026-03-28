// src/shared/hooks/useCrearRutinaState.ts
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Dimensions } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---- Stores / API ---- */
import { useSyncStore } from "@/features/store/useSyncStore";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { crearRutinaPersonalizada } from "@/features/api/rutinas.api";

/* ---- UI ---- */
import { Toast } from "@/shared/components/ui/Toast";

/* ---- Tipos ---- */
import type {
  DiaSemana,
  EjercicioVisualInfo,
  EjercicioAsignadoInput,
  EjercicioCompuestoTemporal,
  Item,
  CompuestoItem,
  EjercicioItem,
} from "@/features/type/crearRutina";
import { useRutinaReducer } from "@/shared/hooks/useRutinaReducer";

const DIAS: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const MIN_EJERCICIOS_COMPUESTO = 2;

const getValidId = (raw: unknown): number | undefined => {
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

type EjercicioInitialValues = Partial<
  Pick<
    EjercicioAsignadoInput,
    | "seriesSugeridas"
    | "repeticionesSugeridas"
    | "pesoSugerido"
    | "descansoSeg"
    | "notaIA"
  >
>;

type EjercicioSeleccionadoState = {
  id: number;
  info: EjercicioVisualInfo;
  orden: number;
  initialValues?: EjercicioInitialValues;
};

export function useCrearRutinaState() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();
  const route = useRoute<any>();

  const [state, dispatch] = useRutinaReducer();
  const [diaSelect, setDiaSelect] = useState<DiaSemana>("LUNES");

  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [mostrarFormularioCompuesto, setMostrarFormularioCompuesto] = useState(false);
  const [mostrarFormularioNombre, setMostrarFormularioNombre] = useState(false);

  const [loading, setLoading] = useState(false);

  const [editandoEjercicio, setEditandoEjercicio] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] =
    useState<EjercicioSeleccionadoState | null>(null);

  // ✅ modoCompuesto se mantiene true hasta que ControlesCompuesto
  // haya podido hacer dismiss — se controla con compuestoConfirmado
  const [modoCompuesto, setModoCompuesto] = useState(false);
  const [compuestoConfirmado, setCompuestoConfirmado] = useState(false);
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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const ejerciciosDia = useMemo(() => {
    const dia = (state.dias ?? []).find((d: any) => d.diaSemana === diaSelect);
    return (dia?.ejercicios ?? []) as Item[];
  }, [state.dias, diaSelect]);

  const haySeleccion =
    selectedIndex !== null &&
    selectedIndex >= 0 &&
    selectedIndex < ejerciciosDia.length;

  const puedeSubir = !!haySeleccion && selectedIndex! > 0;
  const puedeBajar = !!haySeleccion && selectedIndex! < ejerciciosDia.length - 1;
  const puedePegar = Boolean(
    (state as any).clipboard && (state as any).clipboard.length > 0
  );

  const ui = useMemo(
    () => ({
      marcoGradient: ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"],
      bg: isDark ? "#080D17" : "#ffffff",
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

  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  // ─── Compuesto ────────────────────────────────────────────────────────────────

  const iniciarCompuesto = () => {
    setModoCompuesto(true);
    setCompuestoConfirmado(false);
    setMostrarBuscador(true);
  };

  const confirmarCompuesto = () => {
    // ✅ Validación mínimo 2 ejercicios
    if (compuestoTemporal.length < MIN_EJERCICIOS_COMPUESTO) {
      Toast.show({
        type: "info",
        text1: "Ejercicios insuficientes",
        text2: `Añade al menos ${MIN_EJERCICIOS_COMPUESTO} ejercicios para crear un compuesto.`,
      });
      return;
    }
    setMostrarFormularioCompuesto(true);
  };

  // ✅ Llamado desde CrearRutinaScreen cuando FormularioCompuesto confirma
  // Marca el compuesto como confirmado para que ControlesCompuesto
  // pueda hacer dismiss antes de desmontarse
  const finalizarCompuesto = useCallback(() => {
    setCompuestoConfirmado(true);
    setMostrarFormularioCompuesto(false);
  }, []);

  // ✅ Llamado desde ControlesCompuesto.onCancelar — limpia todo
  const cancelarModoCompuesto = useCallback(() => {
    setModoCompuesto(false);
    setCompuestoConfirmado(false);
    setCompuestoTemporal([]);
  }, []);

  // ✅ Llamado cuando ControlesCompuesto termina su dismiss
  // (compuesto.length === 0 → useEffect interno → dismiss → aquí)
  const cerrarModoCompuesto = useCallback(() => {
    setModoCompuesto(false);
    setCompuestoConfirmado(false);
    setCompuestoTemporal([]);
  }, []);

  // ─── Guardar rutina ───────────────────────────────────────────────────────────

  const onSuccess = useCallback(async () => {
    if (!isEdit) {
      const { usuario, setUsuario } = useUsuarioStore.getState();
      if (usuario) {
        setUsuario({
          ...usuario,
          rutinasManualCreadas: (usuario.rutinasManualCreadas ?? 0) + 1,
        });
      }
      Toast.show({
        type: "success",
        text1: "Rutina creada",
        text2: "Tu nueva rutina ya está disponible.",
      });
      dispatch({ type: "CLEAR" });
    } else {
      await AsyncStorage.removeItem("rutinaEditId");
      Toast.show({
        type: "success",
        text1: "Rutina actualizada",
        text2: "Los cambios se han guardado correctamente.",
      });
    }

    useSyncStore.getState().bumpRoutineRev();
    nav.navigate("MisRutinas");
  }, [dispatch, isEdit, nav]);

  const handleCrearRutina = useCallback(async () => {
    if (!state.nombre.trim()) return;

    const payload = {
      nombre: state.nombre,
      descripcion: state.descripcion,
      dias: state.dias,
    };

    setLoading(true);
    try {
      await crearRutinaPersonalizada(payload, editId);
      await onSuccess();
    } catch (error: any) {
      const errorCode =
        error?.errorCode ||
        error?.raw?.response?.data?.errorCode ||
        error?.response?.data?.errorCode;

      if (errorCode === "PREMIUM_REQUIRED") {
        setPremiumModalVisible(true);
        return;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [state, editId, onSuccess]);

  // ─── Cancelar edición ─────────────────────────────────────────────────────────

  const handleCancelarEdicion = useCallback(async () => {
    try {
      dispatch({ type: "SET_NOMBRE", payload: "" });
      dispatch({ type: "SET_DESCRIPCION", payload: "" });

      const diasPresentes = (state.dias ?? []).map((d: any) => d.diaSemana);
      diasPresentes.forEach((ds: any) => {
        dispatch({
          type: "REORDER_EJERCICIOS",
          payload: { diaSemana: ds, ejercicios: [] },
        });
      });

      await AsyncStorage.multiRemove(["crearRutinaState", "rutinaEditId"]);
      setEditId(undefined);
    } catch { }
  }, [state.dias, dispatch]);

  // ─── Selección ────────────────────────────────────────────────────────────────

  const handleEditarSeleccion = () => {
    if (!haySeleccion) return;
    const ej = ejerciciosDia[selectedIndex!];

    if ("compuesto" in ej && ej.compuesto === true) {
      const cmp = ej as CompuestoItem;
      const compuestoId = (cmp as any).ejercicioCompuestoId as number;
      setEditarCompuesto({
        compuestoId,
        orden: cmp.orden,
        ejercicios: cmp.ejerciciosCompuestos as any,
        nombre: cmp.nombreCompuesto,
        tipo: cmp.tipoCompuesto,
        descansoSeg: cmp.descansoCompuesto ?? 0,
      });
    } else {
      const ejItem = ej as EjercicioItem;
      setEditarCompuesto(null);
      setEjercicioSeleccionado({
        id: ejItem.ejercicioId,
        info: ejItem.ejercicioInfo,
        orden: ejItem.orden,
        initialValues: {
          seriesSugeridas: ejItem.seriesSugeridas,
          repeticionesSugeridas: ejItem.repeticionesSugeridas,
          pesoSugerido: ejItem.pesoSugerido,
          descansoSeg: ejItem.descansoSeg,
          notaIA: ejItem.notaIA,
        },
      });
      setEditandoEjercicio(true);
    }
  };

  const handleEliminarSeleccion = () => {
    if (!haySeleccion) return;
    const ej = ejerciciosDia[selectedIndex!];

    if ("compuesto" in ej && ej.compuesto === true) {
      const compuestoId = (ej as any).ejercicioCompuestoId as number;
      dispatch({
        type: "REMOVE_EJERCICIO",
        payload: {
          diaSemana: diaSelect,
          compuestoId,
        },
      });
    } else {
      dispatch({
        type: "REMOVE_EJERCICIO",
        payload: { diaSemana: diaSelect, orden: ej.orden },
      });
    }
    setSelectedIndex(null);
  };

  const handleSubirSeleccion = () => {
    if (!puedeSubir) return;
    const nueva = [...ejerciciosDia];
    [nueva[selectedIndex! - 1], nueva[selectedIndex!]] = [
      nueva[selectedIndex!],
      nueva[selectedIndex! - 1],
    ];
    dispatch({
      type: "REORDER_EJERCICIOS",
      payload: {
        diaSemana: diaSelect,
        ejercicios: nueva.map((e, i) => ({ ...e, orden: i + 1 })),
      },
    });
    setSelectedIndex(selectedIndex! - 1);
  };

  const handleBajarSeleccion = () => {
    if (!puedeBajar) return;
    const nueva = [...ejerciciosDia];
    [nueva[selectedIndex!], nueva[selectedIndex! + 1]] = [
      nueva[selectedIndex! + 1],
      nueva[selectedIndex!],
    ];
    dispatch({
      type: "REORDER_EJERCICIOS",
      payload: {
        diaSemana: diaSelect,
        ejercicios: nueva.map((e, i) => ({ ...e, orden: i + 1 })),
      },
    });
    setSelectedIndex(selectedIndex! + 1);
  };

  // ─── Return ───────────────────────────────────────────────────────────────────

  return {
    state,
    dispatch,

    DIAS,
    diaSelect,
    setDiaSelect,

    ejerciciosDia,
    selectedIndex,
    setSelectedIndex,
    haySeleccion,
    puedeSubir,
    puedeBajar,
    puedePegar,

    mostrarBuscador,
    setMostrarBuscador,
    confirmClear,
    setConfirmClear,
    mostrarFormularioCompuesto,
    setMostrarFormularioCompuesto,
    mostrarFormularioNombre,
    setMostrarFormularioNombre,
    loading,

    editandoEjercicio,
    setEditandoEjercicio,
    ejercicioSeleccionado,
    setEjercicioSeleccionado,

    modoCompuesto,
    compuestoConfirmado,
    setModoCompuesto,
    compuestoTemporal,
    setCompuestoTemporal,
    ejercicioEnCompuestoActual,
    setEjercicioEnCompuestoActual,
    editarCompuesto,
    setEditarCompuesto,

    editId,
    isEdit,

    ui,
    isDark,

    iniciarCompuesto,
    confirmarCompuesto,
    finalizarCompuesto,
    cancelarModoCompuesto,
    cerrarModoCompuesto,
    handleCrearRutina,
    handleCancelarEdicion,
    handleEditarSeleccion,
    handleEliminarSeleccion,
    handleSubirSeleccion,
    handleBajarSeleccion,

    premiumModalVisible,
    setPremiumModalVisible,
  };
}