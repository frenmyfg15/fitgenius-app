import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import {
  useUsuarioStore,
  UsuarioLogin,
} from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { crearRutina } from "@/features/api/rutinas.api";
import { useRewardedAd } from "@/shared/lib/ads/useRewardedAd";

type CrearRutinaPayload = { nombre: string; instruccion?: string };

// helper pequeño
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function useIaGenerate(onCreate?: () => void) {
  const usuario = useUsuarioStore((s) => s.usuario);
  const setUsuario = useUsuarioStore((s) => s.setUsuario);
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);
  const rutinasIACreadas =
    useUsuarioStore((s) => s.usuario?.rutinasIACreadas ?? 0);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [instruccion, setInstruccion] = useState("");

  // modal "no hay anuncios"
  const [noAdsModalVisible, setNoAdsModalVisible] = useState(false);
  const [noAdsRetrying, setNoAdsRetrying] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const maxNombre = 60;
  const maxInstr = 600;

  const nombreLen = useMemo(() => nombre.trim().length, [nombre]);
  const instrLen = useMemo(
    () => instruccion.trim().length,
    [instruccion]
  );

  const { mostrarAnuncioYObtenerToken } = useRewardedAd(
    "feature:ia-generate-rutina"
  );

  const abrirModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    if (loading) return;
    setShowModal(false);
  }, [loading]);

  const getRutinaIdFromResponse = useCallback((res: any): number | undefined => {
    const rawId =
      res?.data?.rutina?.id ??
      res?.rutina?.id ??
      res?.data?.id ??
      res?.id;

    if (rawId == null) return undefined;
    const parsed = typeof rawId === "number" ? rawId : Number(rawId);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, []);

  const handleSuccess = useCallback(
    (rutinaId?: number) => {
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
        console.warn(
          "[IA][crearRutina] usuario undefined, no se actualiza store"
        );
      }

      Toast.show({
        type: "success",
        text1: "¡Rutina generada!",
        text2: "Actualizando ejercicios…",
      });

      console.log("Limpiando caches…");
      useSyncStore.getState().bumpRoutineRev();
      useRutinasCache.getState().clear();
      useRutinaCache.getState().clear();

      console.log("Cerrando modal…");
      setShowModal(false);

      console.log("Disparando onCreate()…");
      onCreate?.();
    },
    [onCreate, rutinasIACreadas, setUsuario, usuario]
  );

  const crear = useCallback(async () => {
    if (loading) return;
    if (!nombre.trim()) return;

    console.log("=== IA CREATE: START ===");
    console.log("payload:", { nombre, instruccion });

    setLoading(true);
    const payload: CrearRutinaPayload = { nombre, instruccion };

    try {
      // 1) Intento sin anuncio
      try {
        const res: any = await crearRutina(payload);
        console.log(
          "[IA][crearRutina][res]:",
          JSON.stringify(res, null, 2)
        );

        const rutinaId = getRutinaIdFromResponse(res);
        console.log(
          "[IA][crearRutina] rutinaId detectado (number):",
          rutinaId
        );

        handleSuccess(rutinaId);
        console.log("=== IA CREATE: END (sin anuncio) ===");
        return;
      } catch (error: any) {
        console.error(
          "=== ERROR creando rutina IA (primer intento) ==="
        );
        console.error("[IA][error].message:", error?.message);
        console.error("[IA][error].code:", error?.code);

        // ✅ Si NO es AD_REQUIRED → mantenemos comportamiento "soft-success"
        if (error?.errorCode !== "AD_REQUIRED") {
          console.warn(
            "[IA][crearRutina] Error sin AD_REQUIRED → comportamiento 'soft-success'"
          );
          handleSuccess(undefined);
          console.log("=== IA CREATE: END (error sin anuncio) ===");
          return;
        }

        // 2) Backend exige anuncio → intentamos mostrar rewarded
        console.log("[IA][crearRutina] AD_REQUIRED → mostrando anuncio…");

        try {
          const adToken = await mostrarAnuncioYObtenerToken();

          // Usuario canceló / cerró el anuncio
          if (!adToken) {
            console.log(
              "[IA][crearRutina] Usuario cerró/canceló el anuncio"
            );
            Toast.show({
              type: "info",
              text1: "Anuncio necesario",
              text2:
                "Para generar esta rutina con IA necesitas ver un anuncio o usar la versión Premium desde tu perfil.",
            });
            console.log("=== IA CREATE: END (cancel anuncio) ===");
            return;
          }

          console.log(
            "[IA][crearRutina] Ad token recibido, reintentando con token…"
          );
          const res2: any = await crearRutina(payload, adToken);
          console.log(
            "[IA][crearRutina][res con anuncio]:",
            JSON.stringify(res2, null, 2)
          );

          const rutinaId2 = getRutinaIdFromResponse(res2);
          console.log(
            "[IA][crearRutina] rutinaId (con anuncio):",
            rutinaId2
          );

          handleSuccess(rutinaId2);
          console.log("=== IA CREATE: END (con anuncio) ===");
          return;
        } catch (error2: any) {
          console.error(
            "=== ERROR creando rutina IA (con anuncio) ==="
          );
          console.error("[IA][error2].message:", error2?.message);
          console.error("[IA][error2].code:", error2?.code);

          const isNoInventory =
            error2?.code === "NO_AD_AVAILABLE" ||
            error2?.code === "NO_FILL" ||
            error2?.reason === "no-ad";

          const isAdLoadError =
            typeof error2?.message === "string" &&
            error2.message.includes("No se pudo cargar el anuncio");

          // 🔹 Caso 1: no hay anuncios o no se pudieron cargar → modal sincero
          if (isNoInventory || isAdLoadError) {
            console.log(
              "[IA][crearRutina] NO_AD_AVAILABLE / NO_FILL / no-ad / load-error → mostramos modal sincero"
            );
            setNoAdsModalVisible(true);
            console.log("=== IA CREATE: END (no hay anuncios o error carga) ===");
            return;
          }

          // 🔹 Caso 2: cualquier otro error técnico con el anuncio
          console.warn(
            "[IA][crearRutina] Error técnico con anuncio (distinto) → sin éxito"
          );
          Toast.show({
            type: "error",
            text1: "No se pudo mostrar el anuncio",
            text2: "Vuelve a intentarlo en unos segundos.",
          });
          console.log("=== IA CREATE: END (error técnico anuncio) ===");
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    getRutinaIdFromResponse,
    handleSuccess,
    instruccion,
    loading,
    mostrarAnuncioYObtenerToken,
    nombre,
    setNoAdsModalVisible,
  ]);

  // Reintento desde el modal "no hay anuncios": buscar anuncio durante 1 minuto
  const reintentarAnuncioIa = useCallback(async () => {
    if (noAdsRetrying) return;
    if (!nombre.trim()) {
      Toast.show({
        type: "info",
        text1: "Falta el nombre",
        text2: "Ponle nombre a la rutina antes de reintentar.",
      });
      return;
    }

    const payload: CrearRutinaPayload = { nombre, instruccion };

    setNoAdsRetrying(true);
    const start = Date.now();

    try {
      let adToken: string | null = null;

      while (!adToken && Date.now() - start < 60_000) {
        try {
          adToken = await mostrarAnuncioYObtenerToken();
          if (adToken) break;
        } catch (error: any) {
          const isNoInventory =
            error?.code === "NO_AD_AVAILABLE" ||
            error?.code === "NO_FILL" ||
            error?.reason === "no-ad";

          const isAdLoadError =
            typeof error?.message === "string" &&
            error.message.includes("No se pudo cargar el anuncio");

          // Sin anuncios o no se pudieron cargar → esperamos y reintentamos
          if (isNoInventory || isAdLoadError) {
            console.log(
              "[IA][reintentarAnuncioIa] sin anuncios o error carga, reintentando en 5s…"
            );
            await sleep(5000);
            continue;
          }

          console.error(
            "[IA][reintentarAnuncioIa] Error cargando anuncio:",
            error
          );
          Toast.show({
            type: "error",
            text1: "Error al cargar el anuncio",
            text2: "Vuelve a intentarlo en unos segundos.",
          });
          return;
        }
      }

      if (!adToken) {
        Toast.show({
          type: "info",
          text1: "Seguimos sin anuncios",
          text2:
            "No hemos encontrado anuncios ahora mismo. Prueba más tarde o usa la versión Premium desde tu perfil.",
        });
        return;
      }

      // Tenemos anuncio → intentamos crear con token
      setLoading(true);
      try {
        const res: any = await crearRutina(payload, adToken);
        console.log(
          "[IA][reintentarAnuncioIa][res con anuncio]:",
          JSON.stringify(res, null, 2)
        );

        const rutinaId = getRutinaIdFromResponse(res);
        handleSuccess(rutinaId);

        setNoAdsModalVisible(false);
      } catch (error: any) {
        console.error(
          "[IA][reintentarAnuncioIa] Error creando rutina con anuncio:",
          error
        );
        Toast.show({
          type: "error",
          text1: "No se pudo generar la rutina",
          text2: "Inténtalo de nuevo en unos minutos.",
        });
      } finally {
        setLoading(false);
      }
    } finally {
      setNoAdsRetrying(false);
    }
  }, [
    getRutinaIdFromResponse,
    handleSuccess,
    instruccion,
    mostrarAnuncioYObtenerToken,
    noAdsRetrying,
    nombre,
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

    // anuncios
    noAdsModalVisible,
    setNoAdsModalVisible,
    noAdsRetrying,
    reintentarAnuncioIa,
  };
}
