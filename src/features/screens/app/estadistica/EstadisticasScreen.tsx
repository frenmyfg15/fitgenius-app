// src/features/screens/EstadisticasScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

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
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import ActividadRecienteCard from "@/shared/components/estadistica/ActividadRecienteCard";
import DistribucionMuscularCard from "@/shared/components/estadistica/DistribucionMuscularCard";
import CaloriasQuemadasCard from "@/shared/components/estadistica/CaloriasQuemadasCard";
import AdherenciaConsistenciaCard from "@/shared/components/estadistica/AdherenciaConsistenciaCard";
import EstadisticasSkeleton from "@/shared/components/skeleton/EstadisticasSkeleton";
import CargaInternaCard from "@/shared/components/estadistica/CargaInternaCard";
import DiasColorEstresCard from "@/shared/components/estadistica/DiasColorEstresCard";
import ProgresoSubjetivoEjerciciosCard from "@/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard";

const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",

    textPrimaryDark: "#F1F5F9",
    textSecondaryDark: "#94A3B8",
    textMutedDark: "#64748B",

    textPrimaryLight: "#0F172A",
    textSecondaryLight: "#475569",
    textMutedLight: "#6B7280",

    accent: "#00E85A",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    lockCardBgDark: "rgba(15,23,42,0.80)",
    lockCardBgLight: "rgba(240,253,250,0.95)",
    lockCardBorderDark: "rgba(255,255,255,0.16)",
    lockCardBorderLight: "rgba(15,118,110,0.18)",

    lockIconBgDark: "rgba(15,23,42,1)",
    lockIconBgLight: "#FFFFFF",
    lockIconBorderDark: "rgba(148,163,184,0.50)",
    lockIconBorderLight: "rgba(16,185,129,0.35)",
    lockIconDark: "#A7F3D0",
    lockIconLight: "#047857",

    lockTitleDark: "#F1F5F9",
    lockTitleLight: "#065F46",
    lockTextDark: "#9CA3AF",
    lockTextLight: "#047857",
    lockCtaDark: "#A7F3D0",
    lockCtaLight: "#047857",

    skelDark: "rgba(148,163,184,0.16)",
    skelLight: "#E5E7EB",
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
  radius: {
    md: 14,
    lg: 20,
    full: 999,
  },
} as const;

const PREMIUM_GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;

function PremiumLockedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const handleGoPremium = useCallback(() => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  }, [navigation]);

  return (
    <LinearGradient
      colors={PREMIUM_GRADIENT as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.premiumFrame}
    >
      <View
        style={[
          styles.premiumCard,
          {
            backgroundColor: isDark
              ? tokens.color.cardBgDark
              : tokens.color.cardBgLight,
            borderColor: isDark
              ? tokens.color.cardBorderDark
              : tokens.color.cardBorderLight,
          },
        ]}
      >
        <View style={styles.lockSkeletonWrap} pointerEvents="none">
          <View
            style={[
              styles.lockSkeletonTitle,
              {
                backgroundColor: isDark
                  ? tokens.color.skelDark
                  : tokens.color.skelLight,
              },
            ]}
          />
          <View
            style={[
              styles.lockSkeletonLine,
              {
                backgroundColor: isDark
                  ? tokens.color.skelDark
                  : tokens.color.skelLight,
              },
            ]}
          />
          <View
            style={[
              styles.lockSkeletonLineShort,
              {
                backgroundColor: isDark
                  ? tokens.color.skelDark
                  : tokens.color.skelLight,
              },
            ]}
          />
          <View style={styles.lockSkeletonRow}>
            <View
              style={[
                styles.lockSkeletonMiniCard,
                {
                  backgroundColor: isDark
                    ? "rgba(15,24,41,0.55)"
                    : "#FFFFFF",
                  borderColor: isDark
                    ? tokens.color.cardBorderDark
                    : tokens.color.cardBorderLight,
                },
              ]}
            />
            <View
              style={[
                styles.lockSkeletonMiniCard,
                {
                  backgroundColor: isDark
                    ? "rgba(15,24,41,0.55)"
                    : "#FFFFFF",
                  borderColor: isDark
                    ? tokens.color.cardBorderDark
                    : tokens.color.cardBorderLight,
                },
              ]}
            />
            <View
              style={[
                styles.lockSkeletonMiniCard,
                {
                  backgroundColor: isDark
                    ? "rgba(15,24,41,0.55)"
                    : "#FFFFFF",
                  borderColor: isDark
                    ? tokens.color.cardBorderDark
                    : tokens.color.cardBorderLight,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleGoPremium}
          style={[
            styles.lockCta,
            {
              borderColor: isDark
                ? tokens.color.lockCardBorderDark
                : tokens.color.lockCardBorderLight,
              backgroundColor: isDark
                ? tokens.color.lockCardBgDark
                : tokens.color.lockCardBgLight,
            },
          ]}
        >
          <View
            style={[
              styles.lockIconWrap,
              {
                backgroundColor: isDark
                  ? tokens.color.lockIconBgDark
                  : tokens.color.lockIconBgLight,
                borderColor: isDark
                  ? tokens.color.lockIconBorderDark
                  : tokens.color.lockIconBorderLight,
              },
            ]}
          >
            <Lock
              size={18}
              color={isDark ? tokens.color.lockIconDark : tokens.color.lockIconLight}
              strokeWidth={2}
            />
          </View>

          <View style={styles.lockTextWrap}>
            <Text
              style={[
                styles.lockTitle,
                {
                  color: isDark
                    ? tokens.color.lockTitleDark
                    : tokens.color.lockTitleLight,
                },
              ]}
            >
              {title}
            </Text>

            <Text
              style={[
                styles.lockDesc,
                {
                  color: isDark
                    ? tokens.color.lockTextDark
                    : tokens.color.lockTextLight,
                },
              ]}
            >
              {description}
            </Text>
          </View>

          <Text
            style={[
              styles.lockMore,
              {
                color: isDark
                  ? tokens.color.lockCtaDark
                  : tokens.color.lockCtaLight,
              },
            ]}
          >
            Ver más
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const usuario = useUsuarioStore((s) => s.usuario);
  const navigation = useNavigation<any>();

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
  const [error, setError] = useState<string | null>(null);

  const workoutRev = useSyncStore((s) => s.workoutRev);
  const routineRev = useSyncStore((s) => s.routineRev);

  const loadAllStats = useCallback(
    async (opts: { showSkeleton?: boolean } = {}) => {
      const { showSkeleton = true } = opts;

      if (showSkeleton) setLoading(true);
      setError(null);

      try {
        const results = await Promise.allSettled([
          obtenerActividadReciente(),
          obtenerDistribucionMuscular(),
          obtenerEstadisticasCalorias(),
          obtenerAdherenciaYConsistencia(),
          obtenerCargaInternaSemanal(),
          obtenerDiasColorEstres(),
          obtenerProgresoSubjetivoEjercicios(),
        ]);

        const [a, m, c, ad, ci, dce, ps] = results;

        setActividad(a.status === "fulfilled" ? a.value : null);
        setMuscular(m.status === "fulfilled" ? m.value : null);
        setCalorias(c.status === "fulfilled" ? c.value : null);

        setAdherencia(ad.status === "fulfilled" ? ad.value : null);
        setCargaInterna(ci.status === "fulfilled" ? ci.value : null);
        setDiasColorEstres(dce.status === "fulfilled" ? dce.value : null);
        setProgresoSubjetivo(ps.status === "fulfilled" ? ps.value : null);

        const gratisFallaron =
          a.status === "rejected" &&
          m.status === "rejected" &&
          c.status === "rejected";

        if (gratisFallaron) {
          setError(
            "No pudimos cargar tus estadísticas. Intenta de nuevo más tarde."
          );
        }
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
    try {
      await loadAllStats({ showSkeleton: false });
    } finally {
      setRefreshing(false);
    }
  }, [loadAllStats]);

  useEffect(() => {
    loadAllStats({ showSkeleton: true });
  }, [loadAllStats]);

  useEffect(() => {
    if (workoutRev === 0 && routineRev === 0) return;
    loadAllStats({ showSkeleton: false });
  }, [workoutRev, routineRev, loadAllStats]);

  if (loading) {
    return <EstadisticasSkeleton />;
  }

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bg }]}>
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: isDark ? "#141C2C" : "#FFF",
              borderColor: isDark ? "rgba(239,68,68,0.2)" : "#FECACA",
            },
          ]}
        >
          <Text
            style={[
              styles.errorTitle,
              { color: isDark ? "#F87171" : "#DC2626" },
            ]}
          >
            Hubo un problema
          </Text>

          <Text style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
            {error}
          </Text>

          <Text
            style={[
              styles.errorSubtitle,
              { color: isDark ? "#94A3B8" : "#EF4444" },
            ]}
          >
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
          tintColor={isDark ? "#E5E7EB" : "#0F172A"}
          colors={[tokens.color.accent]}
          progressBackgroundColor={bg}
        />
      }
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: isDark
                ? tokens.color.textPrimaryDark
                : tokens.color.textPrimaryLight,
            },
          ]}
        >
          Estadísticas
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: isDark
                ? tokens.color.textSecondaryDark
                : tokens.color.textSecondaryLight,
            },
          ]}
        >
          Revisa tus avances y cómo puedes mejorar
        </Text>
      </View>

      <View style={styles.cardsGap}>
        {actividad && (
          <ActividadRecienteCard
            diasActivos={actividad?.diasActivos}
            totalSesiones={actividad?.totalSesiones}
            detallePorDia={actividad?.detalles}
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

        {calorias && (
          <CaloriasQuemadasCard
            total={calorias?.totalCalorias}
            promedio={calorias?.promedioDiario}
            detalle={calorias?.detallePorDia}
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

  premiumFrame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  premiumCard: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: 20,
  },

  lockSkeletonWrap: {
    opacity: 0.95,
  },

  lockSkeletonTitle: {
    height: 16,
    width: "52%",
    borderRadius: 6,
  },

  lockSkeletonLine: {
    marginTop: 12,
    height: 12,
    width: "92%",
    borderRadius: 6,
  },

  lockSkeletonLineShort: {
    marginTop: 8,
    height: 12,
    width: "68%",
    borderRadius: 6,
  },

  lockSkeletonRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },

  lockSkeletonMiniCard: {
    flex: 1,
    height: 74,
    borderRadius: 14,
    borderWidth: 1,
  },

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

  lockTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  lockTitle: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },

  lockDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  lockMore: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "800",
  },
});