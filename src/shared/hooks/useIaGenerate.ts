import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "nativewind";

import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { crearRutina } from "@/features/api/rutinas.api";
import { useRewardedAd } from "@/shared/lib/ads/useRewardedAd";
import { Toast } from "@/shared/components/ui/Toast";

type CrearRutinaPayload = { nombre: string; instruccion?: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const [noAdsModalVisible, setNoAdsModalVisible] = useState(false);
  const [noAdsRetrying, setNoAdsRetrying] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const maxNombre = 60;
  const maxInstr = 600;

  const nombreLen = useMemo(() => nombre.trim().length, [nombre]);
  const instrLen = useMemo(() => instruccion.trim().length, [instruccion]);

  const { mostrarAnuncioYObtenerToken } = useRewardedAd("feature:ia-generate-rutina");

  const abrirModal = useCallback(() => setShowModal(true), []);

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

  const handleSuccess = useCallback((rutinaId?: number) => {
    if (usuario) {
      setUsuario({
        ...usuario,
        rutinaActivaId: rutinaId ?? usuario.rutinaActivaId,
        rutinasIACreadas: (rutinasIACreadas ?? 0) + 1,
      } as UsuarioLogin);
    }

    Toast.show({
      type: "success",
      text1: "Rutina generada",
      text2: "Ya puedes ver tus ejercicios.",
    });

    useSyncStore.getState().bumpRoutineRev();
    useRutinasCache.getState().clear();
    useRutinaCache.getState().clear();

    setShowModal(false);
    onCreate?.();
  }, [onCreate, rutinasIACreadas, setUsuario, usuario]);

  // ─── Crear ────────────────────────────────────────────────────────────────────

  const crear = useCallback(async () => {
    if (loading || !nombre.trim()) return;

    setLoading(true);
    const payload: CrearRutinaPayload = { nombre, instruccion };

    try {
      // 1) Intento directo sin anuncio
      try {
        const res = await crearRutina(payload);
        handleSuccess(getRutinaIdFromResponse(res));
        return;
      } catch (error: any) {
        // Error distinto a AD_REQUIRED → soft-success (rutina puede haberse creado)
        if (error?.errorCode !== "AD_REQUIRED") {
          handleSuccess(undefined);
          return;
        }
      }

      // 2) Backend exige anuncio
      try {
        const adToken = await mostrarAnuncioYObtenerToken();

        if (!adToken) {
          Toast.show({
            type: "info",
            text1: "Anuncio necesario",
            text2: "Para generar esta rutina con IA necesitas ver un anuncio o usar la versión Premium desde tu perfil.",
          });
          return;
        }

        const res2 = await crearRutina(payload, adToken);
        handleSuccess(getRutinaIdFromResponse(res2));
      } catch (error2: any) {
        const isNoAd =
          error2?.code === "NO_AD_AVAILABLE" ||
          error2?.code === "NO_FILL" ||
          error2?.reason === "no-ad" ||
          (typeof error2?.message === "string" &&
            error2.message.includes("No se pudo cargar el anuncio"));

        if (isNoAd) {
          setNoAdsModalVisible(true);
          return;
        }

        Toast.show({
          type: "error",
          text1: "No se pudo mostrar el anuncio",
          text2: "Vuelve a intentarlo en unos segundos.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [getRutinaIdFromResponse, handleSuccess, instruccion, loading, mostrarAnuncioYObtenerToken, nombre]);

  // ─── Reintentar desde modal "no hay anuncios" ─────────────────────────────────

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
          const isNoAd =
            error?.code === "NO_AD_AVAILABLE" ||
            error?.code === "NO_FILL" ||
            error?.reason === "no-ad" ||
            (typeof error?.message === "string" &&
              error.message.includes("No se pudo cargar el anuncio"));

          if (isNoAd) {
            await sleep(5000);
            continue;
          }

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
          text2: "No hemos encontrado anuncios ahora mismo. Prueba más tarde o usa la versión Premium desde tu perfil.",
        });
        return;
      }

      setLoading(true);
      try {
        const res = await crearRutina(payload, adToken);
        handleSuccess(getRutinaIdFromResponse(res));
        setNoAdsModalVisible(false);
      } catch {
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
  }, [getRutinaIdFromResponse, handleSuccess, instruccion, mostrarAnuncioYObtenerToken, noAdsRetrying, nombre]);

  // ─── Derivados ────────────────────────────────────────────────────────────────

  const suggestionChips = useMemo(() => [
    "Fullbody 3 días nivel principiante",
    "Push/Pull/Legs 5 días fuerza + hipertrofia",
    "Upper/Lower 4 días con foco en glúteo",
    "Torso/Pierna con 2 sesiones de core",
  ], []);

  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const lockedByPlan = !isPremiumActive && rutinasIACreadas >= 1;

  const handleChangeNombre = useCallback(
    (t: string) => setNombre(t.slice(0, maxNombre)),
    [maxNombre]
  );

  const handleChangeInstruccion = useCallback(
    (t: string) => setInstruccion(t.slice(0, maxInstr)),
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
    noAdsModalVisible,
    setNoAdsModalVisible,
    noAdsRetrying,
    reintentarAnuncioIa,
  };
}