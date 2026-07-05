// src/features/screens/app/estadistica/EstadisticasContent.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

import {
  obtenerActividadReciente,
  obtenerDistribucionMuscular,
  obtenerEstadisticasCalorias,
  obtenerAdherenciaYConsistencia,
  obtenerCargaInternaSemanal,
  obtenerDiasColorEstres,
  obtenerProgresoSubjetivoEjercicios,
  obtenerProgresoMuscular,
} from "@/features/api/estadisticas.api";

import { useSyncStore } from "@/features/store/useSyncStore";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useEstadisticasCache } from "@/features/store/useEstadisticasCache";

import ActividadRecienteCard from "@/shared/components/estadistica/ActividadRecienteCard";
import DistribucionMuscularCard from "@/shared/components/estadistica/DistribucionMuscularCard";
import CaloriasQuemadasCard from "@/shared/components/estadistica/CaloriasQuemadasCard";
import AdherenciaConsistenciaCard from "@/shared/components/estadistica/AdherenciaConsistenciaCard";
import EstadisticasSkeleton from "@/shared/components/skeleton/EstadisticasSkeleton";
import CargaInternaCard from "@/shared/components/estadistica/CargaInternaCard";
import DiasColorEstresCard from "@/shared/components/estadistica/DiasColorEstresCard";
import ProgresoSubjetivoEjerciciosCard from "@/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard";
import ProgresoMuscularCard from "@/shared/components/estadistica/ProgresoMuscularCard";

function PremiumLockedCard({ title, description }: { title: string; description: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const navigation = useNavigation<any>();

  const handleGoPremium = useCallback(() => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  }, [navigation]);

  return (
    <View style={[styles.premiumCard, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
      <View style={styles.lockSkeletonWrap} pointerEvents="none">
        <View style={[styles.lockSkeletonTitle, { backgroundColor: isDark ? t.border : t.surface }]} />
        <View style={[styles.lockSkeletonLine, { backgroundColor: isDark ? t.border : t.surface }]} />
        <View style={[styles.lockSkeletonLineShort, { backgroundColor: isDark ? t.border : t.surface }]} />
        <View style={styles.lockSkeletonRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.lockSkeletonMiniCard,
                {
                  backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
                  borderColor: t.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleGoPremium}
        style={[
          styles.lockCta,
          {
            borderColor: Colors.accentBorder,
            backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
          },
        ]}
      >
        <View
          style={[
            styles.lockIconWrap,
            { backgroundColor: Colors.accentSubtle, borderColor: Colors.accentBorder },
          ]}
        >
          <Lock size={18} color={Colors.accent} strokeWidth={2} />
        </View>

        <View style={styles.lockTextWrap}>
          <Text style={[styles.lockTitle, { color: t.textPrimary }]}>{title}</Text>
          <Text style={[styles.lockDesc, { color: t.textSecondary }]}>{description}</Text>
        </View>

        <Text style={[styles.lockMore, { color: Colors.accent }]}>Ver más</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EstadisticasContent() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const usuario = useUsuarioStore((s) => s.usuario);

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremium = planActual === "PREMIUM" && haPagado;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actividad, setActividad] = useState<any>(null);
  const [muscular, setMuscular] = useState<any>(null);
  const [calorias, setCalorias] = useState<any>(null);
  const [adherencia, setAdherencia] = useState<any>(null);
  const [cargaInterna, setCargaInterna] = useState<any>(null);
  const [diasColorEstres, setDiasColorEstres] = useState<any>(null);
  const [progresoSubjetivo, setProgresoSubjetivo] = useState<any>(null);
  const [progresoMuscular, setProgresoMuscular] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const workoutRev = useSyncStore((s) => s.workoutRev);
  const routineRev = useSyncStore((s) => s.routineRev);

  const estadisticasCache = useEstadisticasCache(
    useShallow((s) => ({ get: s.get, set: s.set, clear: s.clear }))
  );

  const applyCache = useCallback((cached: NonNullable<ReturnType<typeof estadisticasCache.get>>) => {
    setActividad(cached.actividad);
    setMuscular(cached.muscular);
    setCalorias(cached.calorias);
    setAdherencia(cached.adherencia);
    setCargaInterna(cached.cargaInterna);
    setDiasColorEstres(cached.diasColorEstres);
    setProgresoSubjetivo(cached.progresoSubjetivo);
    setProgresoMuscular(cached.progresoMuscular);
  }, []);

  const loadAllStats = useCallback(
    async (opts: { showSkeleton?: boolean } = {}) => {
      const { showSkeleton = true } = opts;
      if (showSkeleton) setLoading(true);
      setError(null);

      try {
        const [a, m, c] = await Promise.allSettled([
          obtenerActividadReciente(),
          obtenerDistribucionMuscular(),
          obtenerEstadisticasCalorias(),
        ]);

        const actividad = a.status === "fulfilled" ? a.value : null;
        const muscular = m.status === "fulfilled" ? m.value : null;
        const calorias = c.status === "fulfilled" ? c.value : null;

        setActividad(actividad);
        setMuscular(muscular);
        setCalorias(calorias);

        if (a.status === "rejected" && m.status === "rejected" && c.status === "rejected") {
          setError("No pudimos cargar tus estadísticas. Intenta de nuevo más tarde.");
        }

        let adherencia = null;
        let cargaInterna = null;
        let diasColorEstres = null;
        let progresoSubjetivo = null;
        let progresoMuscular = null;

        if (isPremium) {
          const [ad, ci, dce, ps, pm] = await Promise.allSettled([
            obtenerAdherenciaYConsistencia(),
            obtenerCargaInternaSemanal(),
            obtenerDiasColorEstres(),
            obtenerProgresoSubjetivoEjercicios(),
            obtenerProgresoMuscular(),
          ]);

          adherencia = ad.status === "fulfilled" ? ad.value : null;
          cargaInterna = ci.status === "fulfilled" ? ci.value : null;
          diasColorEstres = dce.status === "fulfilled" ? dce.value : null;
          progresoSubjetivo = ps.status === "fulfilled" ? ps.value : null;
          progresoMuscular = pm.status === "fulfilled" ? pm.value : null;

          setAdherencia(adherencia);
          setCargaInterna(cargaInterna);
          setDiasColorEstres(diasColorEstres);
          setProgresoSubjetivo(progresoSubjetivo);
          setProgresoMuscular(progresoMuscular);
        }

        estadisticasCache.set({ actividad, muscular, calorias, adherencia, cargaInterna, diasColorEstres, progresoSubjetivo, progresoMuscular });
      } catch (err) {
        console.log("[Estadisticas] loadAllStats error", err);
        setError("No pudimos cargar tus estadísticas. Intenta de nuevo más tarde.");
      } finally {
        if (showSkeleton) setLoading(false);
      }
    },
    [isPremium, estadisticasCache]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllStats({ showSkeleton: false });
    } finally {
      setRefreshing(false);
    }
  }, [loadAllStats]);

  useEffect(() => {
    const cached = estadisticasCache.get();
    if (cached) {
      applyCache(cached);
      setLoading(false);
      loadAllStats({ showSkeleton: false });
    } else {
      loadAllStats({ showSkeleton: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workoutRev === 0 && routineRev === 0) return;
    estadisticasCache.clear();
    loadAllStats({ showSkeleton: false });
  }, [workoutRev, routineRev, loadAllStats, estadisticasCache]);

  const bg = isDark ? Colors.primary : Colors.secondary;

  if (loading) return <EstadisticasSkeleton />;

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bg }]}>
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
              borderColor: isDark ? "rgba(239,68,68,0.2)" : "#FECACA",
            },
          ]}
        >
          <Text style={[styles.errorTitle, { color: isDark ? "#F87171" : "#DC2626" }]}>
            Hubo un problema
          </Text>
          <Text style={{ color: t.textPrimary, fontFamily: Font.body.regular }}>{error}</Text>
          <Text style={[styles.errorSubtitle, { color: isDark ? t.textSecondary : "#EF4444" }]}>
            Revisa tu conexión o intenta de nuevo.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={t.textPrimary}
          colors={[Colors.accent]}
          progressBackgroundColor={bg}
        />
      }
    >
      <View style={styles.cardsGap}>
        {actividad && (
          <ActividadRecienteCard
            diasActivos={actividad?.diasActivos}
            totalSesiones={actividad?.totalSesiones}
            detallePorDia={actividad?.detalles}
          />
        )}

        {calorias && (
          <CaloriasQuemadasCard
            total={calorias?.totalCalorias}
            promedio={calorias?.promedioDiario}
            detalle={calorias?.detallePorDia}
          />
        )}

        {muscular && (
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
        )}

        {isPremium ? (
          adherencia && (
            <AdherenciaConsistenciaCard
              planificadas={adherencia?.totalPlanificadas}
              completadas={adherencia?.totalCompletadas}
              adherencia={adherencia?.adherencia}
              consistencia={adherencia?.consistenciaSemanal}
            />
          )
        ) : (
          <PremiumLockedCard
            title="Adherencia y consistencia Premium"
            description="Desbloquea métricas de cumplimiento, consistencia semanal y seguimiento más avanzado."
          />
        )}

        {isPremium ? (
          cargaInterna && (
            <CargaInternaCard
              semanas={cargaInterna?.semanas}
              totalSesiones={cargaInterna?.totalSesiones}
              detalleSemanas={cargaInterna?.detalles}
            />
          )
        ) : (
          <PremiumLockedCard
            title="Carga interna Premium"
            description="Consulta tu carga semanal acumulada para entender mejor tu volumen y recuperación."
          />
        )}

        {isPremium ? (
          diasColorEstres && (
            <DiasColorEstresCard
              diasActivos={diasColorEstres?.diasActivos}
              resumen={diasColorEstres?.resumen}
              detalles={diasColorEstres?.detalles}
            />
          )
        ) : (
          <PremiumLockedCard
            title="Estrés por colores Premium"
            description="Visualiza tus días activos por nivel de estrés para detectar patrones y ajustar tu entrenamiento."
          />
        )}

        {isPremium ? (
          progresoMuscular && (
            <ProgresoMuscularCard
              grupos={progresoMuscular?.grupos}
              grupoMasProgresado={progresoMuscular?.grupoMasProgresado}
              grupoMasEstancado={progresoMuscular?.grupoMasEstancado}
            />
          )
        ) : (
          <PremiumLockedCard
            title="Progreso muscular Premium"
            description="Descubre qué grupos musculares están mejorando y cuáles se están estancando semana a semana."
          />
        )}

        {isPremium ? (
          progresoSubjetivo && (
            <ProgresoSubjetivoEjerciciosCard
              diasAnalizados={progresoSubjetivo?.diasAnalizados}
              ejercicios={progresoSubjetivo?.ejercicios}
            />
          )
        ) : (
          <PremiumLockedCard
            title="Progreso subjetivo Premium"
            description="Analiza cómo percibes tu mejora por ejercicio y detecta avances que no se ven solo en los números."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 140 : 130,
  },
  cardsGap: { gap: 20 },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    marginBottom: 8,
  },
  errorSubtitle: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: Font.body.regular,
  },
  premiumCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    overflow: "hidden",
  },
  lockSkeletonWrap: { opacity: 0.95 },
  lockSkeletonTitle: { height: 16, width: "52%", borderRadius: 6 },
  lockSkeletonLine: { marginTop: 12, height: 12, width: "92%", borderRadius: 6 },
  lockSkeletonLineShort: { marginTop: 8, height: 12, width: "68%", borderRadius: 6 },
  lockSkeletonRow: { marginTop: 16, flexDirection: "row", gap: 12 },
  lockSkeletonMiniCard: { flex: 1, height: 74, borderRadius: 14, borderWidth: 1 },
  lockCta: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  lockIconWrap: {
    height: 32,
    width: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    flexShrink: 0,
  },
  lockTextWrap: { flex: 1, minWidth: 0 },
  lockTitle: { fontSize: 13, fontWeight: "800", fontFamily: Font.body.bold, lineHeight: 16 },
  lockDesc: { marginTop: 2, fontSize: 11, fontFamily: Font.body.semiBold, lineHeight: 14 },
  lockMore: { marginLeft: 8, fontSize: 11, fontWeight: "800", fontFamily: Font.body.bold },
});
