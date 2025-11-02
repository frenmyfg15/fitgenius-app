import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";

// 🧠 Store y API (mantén las mismas funciones y hooks)
import {
  obtenerActividadReciente,
  obtenerDistribucionMuscular,
  obtenerEstadisticasCalorias,
  obtenerAdherenciaYConsistencia,
} from "@/features/api/estadisticas.api";

// 📊 Componentes (se crearán en RN)
import ActividadRecienteCard from "@/shared/components/estadistica/ActividadRecienteCard";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useStatsCache } from "@/features/store/useStatesCache";
import DistribucionMuscularCard from "@/shared/components/estadistica/DistribucionMuscularCard";
import CaloriasQuemadasCard from "@/shared/components/estadistica/CaloriasQuemadasCard";
import AdherenciaConsistenciaCard from "@/shared/components/estadistica/AdherenciaConsistenciaCard";
import EstadisticasSkeleton from "@/shared/components/skeleton/EstadisticasSkeleton";

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [actividad, setActividad] = useState<any>(null);
  const [muscular, setMuscular] = useState<any>(null);
  const [calorias, setCalorias] = useState<any>(null);
  const [adherencia, setAdherencia] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const workoutRev = useSyncStore((s) => s.workoutRev);
  const routineRev = useSyncStore((s) => s.routineRev);
  const statsCache = useStatsCache();

  // 🧠 Cargar datos (cache + fetch inicial)
  useEffect(() => {
    const cached = statsCache.get();
    if (cached) {
      setActividad(cached.actividad);
      setMuscular(cached.muscular);
      setCalorias(cached.calorias);
      setAdherencia(cached.adherencia);
      setLoading(false);
      return;
    }

    let aborted = false;
    (async () => {
      try {
        const [a, m, c, ad] = await Promise.all([
          obtenerActividadReciente(),
          obtenerDistribucionMuscular(),
          obtenerEstadisticasCalorias(),
          obtenerAdherenciaYConsistencia(),
        ]);
        if (aborted) return;
        setActividad(a);
        setMuscular(m);
        setCalorias(c);
        setAdherencia(ad);
        statsCache.set({ actividad: a, muscular: m, calorias: c, adherencia: ad });
      } catch {
        if (!aborted) setError("No pudimos cargar tus estadísticas. Intenta de nuevo más tarde.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  // 🔄 Refetch cuando cambia algo
  useEffect(() => {
    if (workoutRev === 0 && routineRev === 0) return;

    let aborted = false;
    setLoading(true);
    (async () => {
      try {
        const [a, m, c, ad] = await Promise.all([
          obtenerActividadReciente(),
          obtenerDistribucionMuscular(),
          obtenerEstadisticasCalorias(),
          obtenerAdherenciaYConsistencia(),
        ]);
        if (aborted) return;
        setActividad(a);
        setMuscular(m);
        setCalorias(c);
        setAdherencia(ad);
        statsCache.set({ actividad: a, muscular: m, calorias: c, adherencia: ad });
        setError(null);
      } catch {
        if (!aborted) setError("No pudimos cargar tus estadísticas. Intenta de nuevo más tarde.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [workoutRev, routineRev]);

  /* ----------------- ESTADOS DE CARGA Y ERROR ----------------- */

  if (loading) {
    return <EstadisticasSkeleton />;
  }

  if (error) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${isDark ? "bg-[#0b1220]" : "bg-red-50"}`}>
        <View
          className={`rounded-2xl p-6 border shadow-sm ${
            isDark ? "bg-[#141c2c] border-red-500/20" : "bg-white border-red-300"
          }`}
        >
          <Text className={`text-lg font-bold mb-2 ${isDark ? "text-red-400" : "text-red-600"}`}>
            Hubo un problema
          </Text>
          <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>{error}</Text>
          <Text className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-red-500"}`}>
            Revisa tu conexión o contacta a soporte.
          </Text>
        </View>
      </View>
    );
  }

  /* ----------------- CONTENIDO PRINCIPAL ----------------- */

  return (
    <ScrollView
      className={`flex-1 px-5 pb-20 ${isDark ? "bg-[#0b1220]" : "bg-white"}`}
      contentContainerStyle={{ paddingVertical: 24 }}
    >
      {/* Header */}
      <View className="mb-6 items-center">
        <Text className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          Estadísticas
        </Text>
        <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Revisa tus avances y cómo puedes mejorar
        </Text>
      </View>

      {/* Tarjetas */}
      <View className="gap-6">
        <ActividadRecienteCard
          diasActivos={actividad?.diasActivos}
          totalSesiones={actividad?.totalSesiones}
          detallePorDia={actividad?.detalles}
        />

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

        <CaloriasQuemadasCard
          total={calorias?.totalCalorias}
          promedio={calorias?.promedioDiario}
          detalle={calorias?.detallePorDia}
        />

        <AdherenciaConsistenciaCard
          planificadas={adherencia?.totalPlanificadas}
          completadas={adherencia?.totalCompletadas}
          adherencia={adherencia?.adherencia}
          consistencia={adherencia?.consistenciaSemanal}
        />
      </View>
    </ScrollView>
  );
}
