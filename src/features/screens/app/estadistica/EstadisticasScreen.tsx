// src/features/screens/EstadisticasScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import {
  obtenerActividadReciente,
  obtenerDistribucionMuscular,
  obtenerEstadisticasCalorias,
  obtenerAdherenciaYConsistencia,
  obtenerCargaInternaSemanal,
  obtenerDiasColorEstres,
  obtenerProgresoSubjetivoEjercicios,
} from "@/features/api/estadisticas.api";

import { useSyncStore } from "@/features/store/useSyncStore";

import ActividadRecienteCard from "@/shared/components/estadistica/ActividadRecienteCard";
import DistribucionMuscularCard from "@/shared/components/estadistica/DistribucionMuscularCard";
import CaloriasQuemadasCard from "@/shared/components/estadistica/CaloriasQuemadasCard";
import AdherenciaConsistenciaCard from "@/shared/components/estadistica/AdherenciaConsistenciaCard";
import EstadisticasSkeleton from "@/shared/components/skeleton/EstadisticasSkeleton";
import { useRewardedAd } from "@/shared/lib/ads/useRewardedAd";

// Nuevos cards para las métricas de estrés
import CargaInternaCard from "@/shared/components/estadistica/CargaInternaCard";
import DiasColorEstresCard from "@/shared/components/estadistica/DiasColorEstresCard";
import ProgresoSubjetivoEjerciciosCard from "@/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard";

// Modal sincero de anuncios
import NoAdsModal from "@/shared/components/ads/NoAdsModal";

// helper para reintentos
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actividad, setActividad] = useState<any>(null);
  const [muscular, setMuscular] = useState<any>(null);
  const [calorias, setCalorias] = useState<any>(null);
  const [adherencia, setAdherencia] = useState<any>(null);

  // métricas basadas en estrés
  const [cargaInterna, setCargaInterna] = useState<any>(null);
  const [diasColorEstres, setDiasColorEstres] = useState<any>(null);
  const [progresoSubjetivo, setProgresoSubjetivo] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  // no-ads modal + reintento
  const [noAdsModalVisible, setNoAdsModalVisible] = useState(false);
  const [noAdsRetrying, setNoAdsRetrying] = useState(false);

  const workoutRev = useSyncStore((s) => s.workoutRev);
  const routineRev = useSyncStore((s) => s.routineRev);

  const { mostrarAnuncioYObtenerToken } =
    useRewardedAd("feature:estadisticas");

  const loadAllStats = useCallback(
    async (opts: { allowAd?: boolean; showSkeleton?: boolean } = {}) => {
      const { allowAd = false, showSkeleton = true } = opts;

      if (showSkeleton) {
        setLoading(true);
      }

      setError(null);

      try {
        const [
          a,
          m,
          c,
          ad,
          ci, // carga interna
          dce, // días color estrés
          ps, // progreso subjetivo ejercicios
        ] = await Promise.all([
          obtenerActividadReciente(),
          obtenerDistribucionMuscular(),
          obtenerEstadisticasCalorias(),
          obtenerAdherenciaYConsistencia(),
          obtenerCargaInternaSemanal(),
          obtenerDiasColorEstres(),
          obtenerProgresoSubjetivoEjercicios(),
        ]);

        setActividad(a);
        setMuscular(m);
        setCalorias(c);
        setAdherencia(ad);
        setCargaInterna(ci);
        setDiasColorEstres(dce);
        setProgresoSubjetivo(ps);
      } catch (err: any) {
        console.log("[Estadisticas] loadAllStats error", err);

        const errorCode =
          err?.errorCode ||
          err?.raw?.response?.data?.errorCode ||
          err?.response?.data?.errorCode;

        // Backend exige anuncio para ver stats de hoy
        if (errorCode === "AD_REQUIRED_STATS_DAYPASS" && allowAd) {
          try {
            // Solo necesitamos que complete el anuncio (SSV)
            await mostrarAnuncioYObtenerToken();
            // Reintento sin volver a forzar anuncio para evitar bucle
            await loadAllStats({ allowAd: false, showSkeleton });
            return;
          } catch (adError: any) {
            console.log(
              "[Estadisticas] error al mostrar anuncio para stats",
              adError
            );

            const isNoInventory =
              adError?.code === "NO_AD_AVAILABLE" ||
              adError?.code === "NO_FILL" ||
              adError?.reason === "no-ad";

            const isAdLoadError =
              typeof adError?.message === "string" &&
              adError.message.includes("No se pudo cargar el anuncio");

            // Si no hay anuncios o falla la carga → modal sincero
            if (isNoInventory || isAdLoadError) {
              setNoAdsModalVisible(true);
              return;
            }

            // Otros errores → mensaje genérico
            setError(
              "No pudimos cargar tus estadísticas. Intenta de nuevo más tarde."
            );
            return;
          }
        } else {
          setError(
            "No pudimos cargar tus estadísticas. Intenta de nuevo más tarde."
          );
        }
      } finally {
        if (showSkeleton) {
          setLoading(false);
        }
      }
    },
    [mostrarAnuncioYObtenerToken]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllStats({ allowAd: true, showSkeleton: false });
    } finally {
      setRefreshing(false);
    }
  }, [loadAllStats]);

  // Reintento de anuncio desde el modal "no hay anuncios" (hasta 1 minuto)
  const reintentarAnuncioStats = useCallback(async () => {
    if (noAdsRetrying) return;

    setNoAdsRetrying(true);
    const start = Date.now();

    try {
      let anuncioMostrado = false;

      while (!anuncioMostrado && Date.now() - start < 60_000) {
        try {
          await mostrarAnuncioYObtenerToken();
          anuncioMostrado = true;
        } catch (error: any) {
          const isNoInventory =
            error?.code === "NO_AD_AVAILABLE" ||
            error?.code === "NO_FILL" ||
            error?.reason === "no-ad";

          const isAdLoadError =
            typeof error?.message === "string" &&
            error.message.includes("No se pudo cargar el anuncio");

          if (isNoInventory || isAdLoadError) {
            console.log(
              "[Estadisticas][reintentarAnuncio] sin anuncios o error de carga, reintentando en 5s…"
            );
            await sleep(5000);
            continue;
          }

          console.error(
            "[Estadisticas][reintentarAnuncio] Error cargando anuncio:",
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

      if (!anuncioMostrado) {
        Toast.show({
          type: "info",
          text1: "Seguimos sin anuncios",
          text2:
            "No hemos encontrado anuncios ahora mismo. Prueba más tarde o usa la versión Premium desde tu perfil.",
        });
        return;
      }

      // Si el anuncio se ha mostrado correctamente → recargamos stats sin forzar anuncio
      await loadAllStats({ allowAd: false, showSkeleton: false });
      setNoAdsModalVisible(false);
    } finally {
      setNoAdsRetrying(false);
    }
  }, [noAdsRetrying, mostrarAnuncioYObtenerToken, loadAllStats]);

  // Primer render → carga con posibilidad de anuncio
  useEffect(() => {
    loadAllStats({ allowAd: true, showSkeleton: true });
  }, [loadAllStats]);

  // Cuando cambian workout/routine → recarga stats (después de entrenar / cambiar rutina)
  useEffect(() => {
    if (workoutRev === 0 && routineRev === 0) return;
    loadAllStats({ allowAd: true, showSkeleton: false });
  }, [workoutRev, routineRev, loadAllStats]);

  if (loading) {
    return <EstadisticasSkeleton />;
  }

  // Caso: fallo genérico de API/red
  if (error) {
    return (
      <View
        className={`flex-1 items-center justify-center px-6 ${
          isDark ? "bg-[#0b1220]" : "bg-red-50"
        }`}
      >
        <View
          className={`rounded-2xl p-6 border shadow-sm ${
            isDark
              ? "bg-[#141c2c] border-red-500/20"
              : "bg-white border-red-300"
          }`}
        >
          <Text
            className={`text-lg font-bold mb-2 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            Hubo un problema
          </Text>
          <Text
            className={isDark ? "text-gray-300" : "text-gray-700"}
          >
            {error}
          </Text>
          <Text
            className={`mt-3 text-sm ${
              isDark ? "text-gray-400" : "text-red-500"
            }`}
          >
            Revisa tu conexión o intenta de nuevo más tarde.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className={`flex-1 px-5 pb-20 ${
          isDark ? "bg-[#0b1220]" : "bg-white"
        }`}
        contentContainerStyle={{ paddingVertical: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#e5e7eb" : "#0f172a"}
            colors={[isDark ? "#e5e7eb" : "#0f172a"]}
            progressBackgroundColor={isDark ? "#0b1220" : "#ffffff"}
          />
        }
      >
        <View className="mb-6 items-center">
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Estadísticas
          </Text>
          <Text
            className={isDark ? "text-gray-400" : "text-gray-600"}
          >
            Revisa tus avances y cómo puedes mejorar
          </Text>
        </View>

        <View className="gap-6">
          {/* Actividad reciente (días activos + sesiones) */}
          <ActividadRecienteCard
            diasActivos={actividad?.diasActivos}
            totalSesiones={actividad?.totalSesiones}
            detallePorDia={actividad?.detalles}
          />

          {/* Distribución muscular */}
          <DistribucionMuscularCard
            distribucion={
              muscular?.distribucion || [
                { grupoMuscular: "Piernas", porcentaje: 35 },
                { grupoMuscular: "Espalda", porcentaje: 25 },
                { grupoMuscular: "Pecho", porcentaje: 20 },
                { grupoMuscular: "Brazos", porcentaje: 10 },
                { grupoMuscular: "Hombros", porcentaje: 10 },
              ]
            }
          />

          {/* Calorías */}
          <CaloriasQuemadasCard
            total={calorias?.totalCalorias}
            promedio={calorias?.promedioDiario}
            detalle={calorias?.detallePorDia}
          />

          {/* Adherencia & consistencia */}
          <AdherenciaConsistenciaCard
            planificadas={adherencia?.totalPlanificadas}
            completadas={adherencia?.totalCompletadas}
            adherencia={adherencia?.adherencia}
            consistencia={adherencia?.consistenciaSemanal}
          />

          {/* Carga interna semanal (nivel de estrés) */}
          <CargaInternaCard
            semanas={cargaInterna?.semanas}
            totalSesiones={cargaInterna?.totalSesiones}
            detalleSemanas={cargaInterna?.detalles}
          />

          {/* Días por nivel de estrés (verde / ámbar / rojo) */}
          <DiasColorEstresCard
            diasActivos={diasColorEstres?.diasActivos}
            resumen={diasColorEstres?.resumen}
            detalles={diasColorEstres?.detalles}
          />

          {/* Progreso subjetivo por ejercicio */}
          <ProgresoSubjetivoEjerciciosCard
            diasAnalizados={progresoSubjetivo?.diasAnalizados}
            ejercicios={progresoSubjetivo?.ejercicios}
          />
        </View>
      </ScrollView>

      {/* Modal sincero: no hay anuncios + reintento 1 minuto */}
      <NoAdsModal
        visible={noAdsModalVisible}
        loading={noAdsRetrying}
        onRetry={reintentarAnuncioStats}
        onGoPremium={undefined} // si quieres, aquí puedes abrir tu paywall
        onClose={() => setNoAdsModalVisible(false)}
      />
    </>
  );
}
