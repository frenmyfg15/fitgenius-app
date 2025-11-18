// useIaGenerate.ts
import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { crearRutina } from "@/features/api/rutinas.api";

type CrearRutinaPayload = { nombre: string; instruccion?: string };

export function useIaGenerate(onCreate?: () => void) {
  const usuario = useUsuarioStore((s) => s.usuario);
  const setUsuario = useUsuarioStore((s) => s.setUsuario);
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);
  const rutinasIACreadas = useUsuarioStore((s) => s.usuario?.rutinasIACreadas ?? 0);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [instruccion, setInstruccion] = useState("");

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const maxNombre = 60;
  const maxInstr = 600;

  const nombreLen = useMemo(() => nombre.trim().length, [nombre]);
  const instrLen = useMemo(() => instruccion.trim().length, [instruccion]);

  const abrirModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    if (loading) return;
    setShowModal(false);
  }, [loading]);

  const crear = useCallback(async () => {
    if (loading) return;

    if (!nombre.trim()) {
      Toast.show({ type: "error", text1: "Ponle un nombre a tu rutina" });
      return;
    }

    console.log("=== IA CREATE: START ===");
    console.log("payload:", { nombre, instruccion });

    setLoading(true);
    let rutinaId: number | undefined;

    try {
      const res: any = await crearRutina({ nombre, instruccion } as CrearRutinaPayload);

      console.log("[IA][crearRutina][res]:", JSON.stringify(res, null, 2));

      const rawId =
        res?.data?.rutina?.id ??
        res?.rutina?.id ??
        res?.data?.id ??
        res?.id;

      if (rawId != null) {
        const parsed = typeof rawId === "number" ? rawId : Number(rawId);
        rutinaId = Number.isNaN(parsed) ? undefined : parsed;
      }

      console.log("[IA][crearRutina] rutinaId detectado (number):", rutinaId);

      if (!rutinaId) {
        console.warn("[IA][crearRutina] No se pudo leer rutinaId desde la respuesta");
      }

      const prevIACount = rutinasIACreadas ?? 0;

      if (usuario) {
        const nextUser: UsuarioLogin = {
          ...usuario,
          rutinaActivaId: rutinaId ?? usuario.rutinaActivaId,
          rutinasIACreadas: prevIACount + 1,
        };

        console.log("[IA][crearRutina] Actualizando usuario:", nextUser);
        setUsuario(nextUser);
      } else {
        console.warn("[IA][crearRutina] usuario undefined, no se actualiza store");
      }

      // UX: aunque la IA tarde, damos feedback positivo
      Toast.show({
        type: "success",
        text1: "¡Rutina generada!",
        text2: "Actualizando ejercicios…",
      });
    } catch (error: any) {
      console.error("=== ERROR creando rutina IA ===");
      console.error("[IA][error].message:", error?.message);
      console.error("[IA][error].code:", error?.code);
      console.error("[IA][error].name:", error?.name);
      console.error("[IA][error].config?.url:", error?.config?.url);
      console.error("[IA][error].config?.timeout:", error?.config?.timeout);
      if (error?.response) {
        console.error("[IA][error].response.status:", error.response.status);
        console.error("[IA][error].response.data:", error.response.data);
      }
      if (error?.request?._response) {
        console.error("[IA][error].request._response:", error.request._response);
      }

      // comportamiento pedido: aunque falle, cerramos modal y recargamos como éxito
      Toast.show({
        type: "info",
        text1: "Estamos cargando tu nueva rutina",
        text2: "Si la IA tardó, se actualizará al abrirla.",
      });
    } finally {
      console.log("Limpiando caches…");
      useSyncStore.getState().bumpRoutineRev();
      useRutinasCache.getState().clear();
      useRutinaCache.getState().clear();

      console.log("Cerrando modal…");
      setShowModal(false);

      console.log("Disparando onCreate()…");
      onCreate?.();

      setLoading(false);
      console.log("=== IA CREATE: END ===");
    }
  }, [
    loading,
    nombre,
    instruccion,
    usuario,
    setUsuario,
    rutinasIACreadas,
    onCreate,
  ]);

  const suggestionChips = useMemo(
    () => [
      "Fullbody 3 días nivel principiante",
      "Push/Pull/Legs 5 días fuerza + hipertrofia",
      "Upper/Lower 4 días con foco en glúteo",
      "Torso/Pierna con 2 sesiones de core",
    ],
    []
  );

  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const lockedByPlan = !isPremiumActive && rutinasIACreadas >= 1;

  const handleChangeNombre = useCallback(
    (t: string) => {
      setNombre(t.slice(0, maxNombre));
    },
    [maxNombre]
  );

  const handleChangeInstruccion = useCallback(
    (t: string) => {
      setInstruccion(t.slice(0, maxInstr));
    },
    [maxInstr]
  );

  return {
    loading,
    showModal,
    nombre,
    instruccion,
    maxNombre,
    maxInstr,
    nombreLen,
    instrLen,
    suggestionChips,
    isDark,
    lockedByPlan,
    abrirModal,
    cerrarModal,
    crear,
    handleChangeNombre,
    handleChangeInstruccion,
    setInstruccion,
  };
}
