import React, { memo, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import type { CoachAnalysisData } from "@/features/api/coach.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";

/* Assets locales */
const iconKcal = require("../../../../assets/fit/ejercicio/calorias.png");
const iconExp = require("../../../../assets/fit/ejercicio/experiencia.png");
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

// ── Tokens ─────────────────────────────────────────────────────────────────────

const tokens = {
  color: {
    accent: "#E8FF47",
    accentSoft: "rgba(232,255,71,0.14)",

    overlayDark: "#080D17",
    overlayLight: "#F8FAFC",

    textPrimaryDark: "#F8FAFC",
    textPrimaryLight: "#0F172A",

    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#64748B",

    textMutedDark: "rgba(255,255,255,0.48)",
    textMutedLight: "rgba(15,23,42,0.48)",

    softBgDark: "rgba(255,255,255,0.05)",
    softBgLight: "rgba(0,0,0,0.04)",

    ctaBorderDark: "#22C55E",
    ctaBorderLight: "rgba(15,23,42,0.18)",
  },
  radius: { xl: 28, full: 999 },
  spacing: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
} as const;

// ── Escala RPE ─────────────────────────────────────────────────────────────────

const RPE_SCALE = [
  { v: 1, label: "Reposo" },
  { v: 2, label: "Muy ligero" },
  { v: 3, label: "Ligero" },
  { v: 4, label: "Moderado" },
  { v: 5, label: "Algo duro" },
  { v: 6, label: "Duro" },
  { v: 7, label: "Muy duro" },
  { v: 8, label: "Intenso" },
  { v: 9, label: "Muy intenso" },
  { v: 10, label: "Máximo" },
] as const;

// ── Tipos ──────────────────────────────────────────────────────────────────────

type SerieSimple = { reps: number; peso: number };
type SerieCompuesta = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
}[];

export type Props = {
  series?: SerieSimple[];
  seriesComp?: SerieCompuesta[];
  nivelEstres?: number | null;
  esCompuesto?: boolean;
  /** Datos del coach cargados antes de la sesión (opcional, solo premium) */
  coachData?: CoachAnalysisData | null;
  onFinish?: () => void;
};

type CoachInsight = {
  emoji: string;
  titulo: string;
  mensaje: string;
  color: string;
};

// ── Helpers de cálculo ─────────────────────────────────────────────────────────

function calcVolumen(s: SerieSimple[]) {
  return s.reduce((a, x) => a + x.peso * x.reps, 0);
}

function calcVolumenComp(sc: SerieCompuesta[]) {
  return sc.reduce(
    (a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0), 0),
    0
  );
}

function calcCalorias(s: SerieSimple[]) {
  return Math.round(s.reduce((a, x) => a + x.peso * x.reps * 0.1, 0) + s.length * 3);
}

function calcCaloriasComp(sc: SerieCompuesta[]) {
  return Math.round(
    sc.reduce(
      (a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0) * 0.1, 0),
      0
    ) + sc.length * 5
  );
}

function mejorSerie(s: SerieSimple[]) {
  return s.length
    ? s.reduce((b, x) => (x.peso * x.reps > b.peso * b.reps ? x : b))
    : null;
}

function getMotiv(n: number) {
  if (n <= 3) return "Recuperación activa";
  if (n <= 5) return "Zona aeróbica";
  if (n <= 7) return "Zona de desarrollo";
  if (n <= 9) return "Alta intensidad";
  return "Esfuerzo máximo";
}

// ── Nuevos helpers pro ─────────────────────────────────────────────────────────

/** 1RM estimado de la sesión actual usando la fórmula de Epley */
function calcMejor1RM(series: SerieSimple[]): number | null {
  const estimates = series
    .filter((s) => s.peso > 0 && s.reps >= 1 && s.reps <= 15)
    .map((s) => (s.reps === 1 ? s.peso : s.peso * (1 + s.reps / 30)));
  return estimates.length ? Math.max(...estimates) : null;
}

/** Subtítulo del hero según mood del coach, readiness o nivel de estrés */
function buildHeroSubtitle(
  mood?: string,
  nivelEstres?: number | null,
  readinessScore?: number | null
): string {
  if (mood === "PROGRESAR") return "Día de progreso cumplido. Bien hecho.";
  if (mood === "MANTENER") return "Consistencia. Así se construye el progreso real.";
  if (mood === "DESCARGAR") return "Recuperación activa completada. Tu cuerpo te lo agradece.";
  if (readinessScore != null && readinessScore <= 40)
    return "Entrenaste con fatiga. Ese es el tipo de esfuerzo que marca la diferencia.";
  if (readinessScore != null && readinessScore >= 80)
    return "Tu cuerpo estaba listo hoy. Aprovechaste bien la sesión.";
  if (nivelEstres != null) {
    if (nivelEstres <= 4) return "Sesión de recuperación registrada. Descansa bien.";
    if (nivelEstres <= 6) return "Buen trabajo. Sesión de desarrollo completada.";
    if (nivelEstres <= 8) return "Gran esfuerzo. Sesión de alta intensidad registrada.";
    return "Esfuerzo máximo. Asegúrate de recuperar bien esta noche.";
  }
  return "Tu entrenamiento se ha guardado correctamente.";
}

/**
 * Insight motivacional con jerarquía de prioridad:
 * 1. Nuevo PB de 1RM estimado
 * 2. Nueva sesión pico histórica (volActual >= sesionPico.vol)
 * 3. Objetivo de volumen superado
 * 4. Racha al alza (volumen + carga)
 * 5. Tendencia de volumen al alza
 * 6. Mood PROGRESAR confirmado
 * 7. Cerca del récord histórico (≥90% de sesionPico)
 * 8. Readiness bajo pero sesión completada
 * 9. Plateau detectado — feedback constructivo
 * 10. Primera sugerencia del coach como fallback
 */
function buildCoachInsight(
  coachData: CoachAnalysisData | null | undefined,
  volActual: number,
  unRMSesion: number | null,
  medidaPeso: string
): CoachInsight | null {
  if (!coachData) return null;

  const fmt = (kg: number) =>
    medidaPeso === "KG" ? `${kg.toFixed(1)} kg` : kgToLb(kg);

  const fmtVol = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)} t` : `${v.toFixed(0)} kg`;

  // 1. Nuevo récord estimado de 1RM
  const prevRM = coachData.unRMEstimado;
  if (unRMSesion != null && prevRM != null && unRMSesion > prevRM * 1.01) {
    return {
      emoji: "★",
      titulo: "Nuevo récord estimado",
      mensaje: `1RM: ${fmt(unRMSesion)} — superaste tu marca anterior de ${fmt(prevRM)}`,
      color: "#F59E0B",
    };
  }

  // 2. Nueva sesión pico histórica
  const pico = coachData.sesionPico;
  if (pico != null && volActual > 0 && volActual >= pico.vol) {
    return {
      emoji: "★",
      titulo: "Sesión pico histórica",
      mensaje: `${fmtVol(volActual)} de volumen — es tu mejor sesión registrada en este ejercicio`,
      color: "#F59E0B",
    };
  }

  // 3. Objetivo de volumen alcanzado o superado
  const target = coachData.objetivoSesion?.volumenObjetivo;
  if (target != null && volActual > 0 && volActual >= target * 0.99) {
    const pct = ((volActual - target) / target) * 100;
    return {
      emoji: "✓",
      titulo: pct < 2 ? "Objetivo cumplido" : `Objetivo superado +${pct.toFixed(0)}%`,
      mensaje:
        pct < 2
          ? `${fmtVol(volActual)} de volumen — justo en el objetivo`
          : `${fmtVol(volActual)} conseguidos sobre ${fmtVol(target)} previstos`,
      color: "#22C55E",
    };
  }

  // 4. Racha: carga y volumen al alza
  if (
    coachData.tendenciaVolumen === "SUBIENDO" &&
    coachData.tendenciaCarga === "SUBIENDO"
  ) {
    return {
      emoji: "↗",
      titulo: "Racha en progreso",
      mensaje: "Carga y volumen llevan varias sesiones al alza en este ejercicio",
      color: "#22C55E",
    };
  }

  // 5. Tendencia de volumen al alza
  if (coachData.tendenciaVolumen === "SUBIENDO") {
    return {
      emoji: "↗",
      titulo: "Tendencia al alza",
      mensaje: "Tu volumen en este ejercicio lleva varias sesiones subiendo",
      color: "#22C55E",
    };
  }

  // 6. Mood PROGRESAR confirmado
  if (coachData.mood === "PROGRESAR") {
    return {
      emoji: "⚡",
      titulo: "Progresión confirmada",
      mensaje: "Era un día marcado para progresar — y lo lograste",
      color: "#3B82F6",
    };
  }

  // 7. Cerca del récord histórico (≥90% del pico)
  if (pico != null && volActual > 0 && volActual >= pico.vol * 0.9) {
    const pct = Math.round((volActual / pico.vol) * 100);
    return {
      emoji: "↗",
      titulo: "Cerca de tu récord",
      mensaje: `Alcanzaste el ${pct}% de tu sesión pico. Sigue empujando.`,
      color: "#22C55E",
    };
  }

  // 8. Readiness bajo pero completó la sesión — mérito de consistencia
  const readiness = coachData.readinessScore;
  if (readiness != null && readiness <= 40) {
    return {
      emoji: "⚡",
      titulo: "Consistencia ante la fatiga",
      mensaje: `Readiness ${readiness}/100 — y aun así completaste la sesión. Eso es disciplina real.`,
      color: "#3B82F6",
    };
  }

  // 9. Plateau detectado — feedback constructivo
  if (coachData.plateauEjercicio) {
    return {
      emoji: "!",
      titulo: "Zona de estancamiento",
      mensaje: "Tu coach ha detectado estancamiento. Considera variar carga, reps o tempo en la próxima sesión.",
      color: "#F59E0B",
    };
  }

  // 10. Primera sugerencia del coach como fallback informativo
  const sug = coachData.sugerencias?.[0];
  if (sug) {
    return {
      emoji: "ℹ",
      titulo: sug.titulo,
      mensaje: sug.mensaje,
      color: "#64748B",
    };
  }

  return null;
}

// ── StatCard ───────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  isDark,
  title,
  value,
  sub,
  image,
  iconSymbol,
  accentColor,
}: {
  isDark: boolean;
  title: string;
  value: string;
  sub?: string;
  image?: any;
  iconSymbol?: string;
  accentColor?: string;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isDark
            ? tokens.color.softBgDark
            : tokens.color.softBgLight,
        },
      ]}
    >
      <View
        style={[
          styles.statIconWrap,
          {
            backgroundColor: accentColor
              ? `${accentColor}22`
              : tokens.color.accentSoft,
          },
        ]}
      >
        {image ? (
          <Image
            source={image}
            accessibilityIgnoresInvertColors
            style={styles.statIconImg}
            resizeMode="contain"
          />
        ) : iconSymbol ? (
          <Text
            style={{
              fontSize: 18,
              color: accentColor ?? tokens.color.accent,
              fontWeight: "900",
            }}
          >
            {iconSymbol}
          </Text>
        ) : (
          <View
            style={[
              styles.statIconDot,
              { backgroundColor: accentColor ?? tokens.color.accent },
            ]}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.statTitle,
            {
              color: isDark
                ? tokens.color.textMutedDark
                : tokens.color.textMutedLight,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.statValue,
            {
              color: accentColor
                ? accentColor
                : isDark
                ? tokens.color.textPrimaryDark
                : tokens.color.textPrimaryLight,
            },
          ]}
        >
          {value}
        </Text>

        {!!sub && (
          <Text
            style={[
              styles.statSub,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            {sub}
          </Text>
        )}
      </View>
    </View>
  );
});

// ── CoachInsightCard ───────────────────────────────────────────────────────────

const CoachInsightCard = memo(function CoachInsightCard({
  insight,
  isDark,
}: {
  insight: CoachInsight;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.insightCard,
        {
          backgroundColor: isDark
            ? `${insight.color}18`
            : `${insight.color}10`,
          borderColor: `${insight.color}40`,
        },
      ]}
    >
      <View
        style={[
          styles.insightEmoji,
          { backgroundColor: `${insight.color}28` },
        ]}
      >
        <Text style={{ fontSize: 18, color: insight.color, fontWeight: "900" }}>
          {insight.emoji}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: insight.color,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {insight.titulo}
        </Text>
        <Text
          style={{
            color: isDark ? "#CBD5E1" : "#1E293B",
            fontSize: 13,
            fontWeight: "600",
            lineHeight: 18,
          }}
        >
          {insight.mensaje}
        </Text>
      </View>
    </View>
  );
});

// ── CelebracionModal ───────────────────────────────────────────────────────────

export default function CelebracionModal({
  series = [],
  seriesComp = [],
  nivelEstres = null,
  esCompuesto = false,
  coachData,
  onFinish,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const usuario = useUsuarioStore((s) => s.usuario);
  const medidaPeso = (usuario?.medidaPeso ?? "KG").toUpperCase();

  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    setConfettiDone(false);
  }, []);

  const data = useMemo(() => {
    const vol = esCompuesto ? calcVolumenComp(seriesComp) : calcVolumen(series);
    const kcal = esCompuesto ? calcCaloriasComp(seriesComp) : calcCalorias(series);
    const best = esCompuesto ? null : mejorSerie(series);
    const rpe = RPE_SCALE.find((r) => r.v === nivelEstres) ?? null;
    const n = esCompuesto ? seriesComp.length : series.length;
    const unRM = esCompuesto ? null : calcMejor1RM(series);

    return {
      vol,
      volText: vol >= 1000 ? `${(vol / 1000).toFixed(1)} t` : `${vol.toFixed(0)} kg`,
      kcalText: `${kcal} kcal`,
      seriesText: `${n} serie${n !== 1 ? "s" : ""}`,
      bestText: best ? `${best.peso} kg × ${best.reps}` : null,
      bestSub: best ? `${(best.peso * best.reps).toFixed(0)} kg de volumen` : null,
      rpeText: rpe ? `RPE ${rpe.v} · ${rpe.label}` : null,
      rpeSub: rpe ? getMotiv(rpe.v) : null,
      expText: "+1.25 EXP",
      unRM,
      unRMText:
        unRM != null
          ? medidaPeso === "KG"
            ? `${unRM.toFixed(1)} kg`
            : kgToLb(unRM)
          : null,
    };
  }, [esCompuesto, series, seriesComp, nivelEstres, medidaPeso]);

  const heroSubtitle = useMemo(
    () => buildHeroSubtitle(coachData?.mood, nivelEstres, coachData?.readinessScore),
    [coachData?.mood, coachData?.readinessScore, nivelEstres]
  );

  const coachInsight = useMemo(
    () => buildCoachInsight(coachData, data.vol, data.unRM, medidaPeso),
    [coachData, data.vol, data.unRM, medidaPeso]
  );

  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: isDark
            ? tokens.color.overlayDark
            : tokens.color.overlayLight,
          paddingTop: insets.top + 10,
          paddingBottom: Math.max(insets.bottom, 18),
        },
      ]}
    >
      {!confettiDone && (
        <LottieView
          source={confettiAnim}
          autoPlay
          loop={false}
          onAnimationFinish={() => setConfettiDone(true)}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View style={styles.inner}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: textPrimary }]}>
            Sesión completada
          </Text>
          <Text style={[styles.heroSubtitle, { color: textSecondary }]}>
            {heroSubtitle}
          </Text>
        </View>

        {/* Insight del coach — solo cuando hay algo motivador que decir */}
        {coachInsight && (
          <CoachInsightCard insight={coachInsight} isDark={isDark} />
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <StatCard
            isDark={isDark}
            title="Volumen total"
            value={data.volText}
            sub={data.seriesText}
            iconSymbol="↑"
            accentColor="#60A5FA"
          />
          <StatCard
            isDark={isDark}
            title="Calorías"
            value={data.kcalText}
            sub="estimación"
            image={iconKcal}
          />

          {/* Prioridad: 1RM estimado > mejor serie > RPE */}
          {data.unRMText ? (
            <StatCard
              isDark={isDark}
              title="1RM estimado"
              value={data.unRMText}
              sub="fórmula de Epley"
              iconSymbol="★"
              accentColor="#A855F7"
            />
          ) : data.bestText ? (
            <StatCard
              isDark={isDark}
              title="Mejor serie"
              value={data.bestText}
              sub={data.bestSub ?? undefined}
              iconSymbol="↑"
              accentColor="#22C55E"
            />
          ) : (
            <StatCard
              isDark={isDark}
              title="Esfuerzo percibido"
              value={data.rpeText ?? "—"}
              sub={data.rpeSub ?? undefined}
              iconSymbol="◉"
              accentColor="#F59E0B"
            />
          )}

          <StatCard
            isDark={isDark}
            title="Experiencia"
            value={data.expText}
            sub="sesión completada"
            image={iconExp}
          />
        </View>

        {/* CTA */}
        <Pressable onPress={onFinish} style={styles.ctaWrap}>
          <View
            style={[
              styles.cta,
              {
                borderColor: isDark
                  ? tokens.color.ctaBorderDark
                  : tokens.color.ctaBorderLight,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: textPrimary }]}>
              Continuar
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    elevation: 999999,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 18,
  },
  hero: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  insightEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stats: {
    gap: 8,
  },
  statCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statIconWrap: {
    width: 46,
    height: 46,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconImg: {
    width: 22,
    height: 22,
  },
  statIconDot: {
    width: 12,
    height: 12,
    borderRadius: tokens.radius.full,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  statSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  ctaWrap: {},
  cta: {
    height: 54,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "#22C55E",
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
