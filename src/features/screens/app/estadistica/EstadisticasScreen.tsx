// src/features/screens/EstadisticasScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet, Platform } from "react-native";
import { useColorScheme } from "nativewind";

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
import CargaInternaCard from "@/shared/components/estadistica/CargaInternaCard";
import DiasColorEstresCard from "@/shared/components/estadistica/DiasColorEstresCard";
import ProgresoSubjetivoEjerciciosCard from "@/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard";

// ── TOKENS DE DISEÑO ──────────────────────────────────────────────────────────
const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",
    textPrimaryDark: "#F1F5F9",
    textSecondaryDark: "#64748B",
    textPrimaryLight: "#0F172A",
    textSecondaryLight: "#475569",
    accent: "#00E85A",
  },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
} as const;

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actividad, setActividad] = useState<any>(null);
  const [muscular, setMuscular] = useState<any>(null);
  const [calorias, setCalorias] = useState<any>(null);
  const [adherencia, setAdherencia] = useState<any>(null);
  const [cargaInterna, setCargaInterna] = useState<any>(null);
  const [diasColorEstres, setDiasColorEstres] = useState<any>(null);
  const [progresoSubjetivo, setProgresoSubjetivo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const workoutRev = useSyncStore((s) => s.workoutRev);
  const routineRev = useSyncStore((s) => s.routineRev);

  const loadAllStats = useCallback(
    async (opts: { showSkeleton?: boolean } = {}) => {
      const { showSkeleton = true } = opts;
      if (showSkeleton) setLoading(true);
      setError(null);

      try {
        const [a, m, c, ad, ci, dce, ps] = await Promise.all([
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
      } catch (err) {
        console.log("[Estadisticas] loadAllStats error", err);
        setError("No pudimos cargar tus estadísticas. Intenta de nuevo más tarde.");
      } finally {
        if (showSkeleton) setLoading(false);
      }
    },
    []
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadAllStats({ showSkeleton: false }); }
    finally { setRefreshing(false); }
  }, [loadAllStats]);

  useEffect(() => { loadAllStats({ showSkeleton: true }); }, [loadAllStats]);

  useEffect(() => {
    if (workoutRev === 0 && routineRev === 0) return;
    loadAllStats({ showSkeleton: false });
  }, [workoutRev, routineRev, loadAllStats]);

  if (loading) return <EstadisticasSkeleton />;

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bg }]}>
        <View style={[styles.errorCard, {
          backgroundColor: isDark ? "#141C2C" : "#FFF",
          borderColor: isDark ? "rgba(239,68,68,0.2)" : "#FECACA"
        }]}>
          <Text style={[styles.errorTitle, { color: isDark ? "#F87171" : "#DC2626" }]}>Hubo un problema</Text>
          <Text style={{ color: isDark ? "#CBD5E1" : "#334155" }}>{error}</Text>
          <Text style={[styles.errorSubtitle, { color: isDark ? "#94A3B8" : "#EF4444" }]}>Revisa tu conexión o intenta de nuevo.</Text>
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
          tintColor={isDark ? "#E5E7EB" : "#0F172A"}
          colors={[tokens.color.accent]}
          progressBackgroundColor={bg}
        />
      }
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
          Estadísticas
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
          Revisa tus avances y cómo puedes mejorar
        </Text>
      </View>

      {/* ── CARDS ── */}
      <View style={styles.cardsGap}>
        <ActividadRecienteCard
          diasActivos={actividad?.diasActivos}
          totalSesiones={actividad?.totalSesiones}
          detallePorDia={actividad?.detalles}
        />

        <DistribucionMuscularCard
          distribucion={muscular?.distribucion || [
            { grupoMuscular: "Piernas", porcentaje: 35 },
            { grupoMuscular: "Espalda", porcentaje: 25 },
            { grupoMuscular: "Pecho", porcentaje: 20 },
            { grupoMuscular: "Brazos", porcentaje: 10 },
            { grupoMuscular: "Hombros", porcentaje: 10 },
          ]}
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

        <CargaInternaCard
          semanas={cargaInterna?.semanas}
          totalSesiones={cargaInterna?.totalSesiones}
          detalleSemanas={cargaInterna?.detalles}
        />

        <DiasColorEstresCard
          diasActivos={diasColorEstres?.diasActivos}
          resumen={diasColorEstres?.resumen}
          detalles={diasColorEstres?.detalles}
        />

        <ProgresoSubjetivoEjerciciosCard
          diasAnalizados={progresoSubjetivo?.diasAnalizados}
          ejercicios={progresoSubjetivo?.ejercicios}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: tokens.spacing.tabBarSafe,
  },
  header: {
    marginBottom: tokens.spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  cardsGap: {
    gap: 20,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorSubtitle: {
    marginTop: 12,
    fontSize: 13,
  },
});