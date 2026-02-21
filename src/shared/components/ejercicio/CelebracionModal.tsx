import React, { useEffect, useState, memo, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";

/* Assets locales */
const iconKcal = require("../../../../assets/fit/ejercicio/calorias.png");
const iconExp = require("../../../../assets/fit/ejercicio/experiencia.png");
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

// ── Design tokens ─────────────────────────────────────────────────────────────
const t = {
  // Un único color de acento; todo lo demás es escala de grises
  accent: "#E8FF47",          // lima pálido → destaca sin gritar
  accentDim: "rgba(232,255,71,0.12)",

  dark: {
    bg: "rgba(10,10,10,0.98)",
    border: "rgba(255,255,255,0.07)",
    textPrimary: "#F5F5F5",
    textMuted: "rgba(255,255,255,0.35)",
    pip: "rgba(255,255,255,0.15)",
    pipDone: "rgba(255,255,255,0.6)",
    pipActive: "#FFFFFF",
  },
  light: {
    bg: "rgba(255,255,255,0.98)",
    border: "rgba(0,0,0,0.06)",
    textPrimary: "#0A0A0A",
    textMuted: "rgba(0,0,0,0.35)",
    pip: "rgba(0,0,0,0.12)",
    pipDone: "rgba(0,0,0,0.5)",
    pipActive: "#0A0A0A",
  },
  r: { card: 20, full: 999 },
  sp: { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 },
} as const;

// ── RPE ───────────────────────────────────────────────────────────────────────
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

// ── Tipos ─────────────────────────────────────────────────────────────────────
type SerieSimple = { reps: number; peso: number };
type SerieCompuesta = { ejercicioId: number; pesoKg?: number; repeticiones?: number; duracionSegundos?: number }[];

type Props = {
  visible: boolean;
  series?: SerieSimple[];
  seriesComp?: SerieCompuesta[];
  nivelEstres?: number | null;
  esCompuesto?: boolean;
  dwellMs?: number;
  onFinish?: () => void;
};

// ── Cálculos ──────────────────────────────────────────────────────────────────
function calcVolumen(s: SerieSimple[]) { return s.reduce((a, x) => a + x.peso * x.reps, 0); }
function calcVolumenComp(sc: SerieCompuesta[]) { return sc.reduce((a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0), 0), 0); }
function calcCalorias(s: SerieSimple[]) { return Math.round(s.reduce((a, x) => a + x.peso * x.reps * 0.1, 0) + s.length * 3); }
function calcCaloriasComp(sc: SerieCompuesta[]) { return Math.round(sc.reduce((a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0) * 0.1, 0), 0) + sc.length * 5); }
function mejorSerie(s: SerieSimple[]) { return s.length ? s.reduce((b, x) => x.peso * x.reps > b.peso * b.reps ? x : b) : null; }
function getMotiv(n: number) { if (n <= 3) return "Recuperación activa"; if (n <= 5) return "Zona aeróbica"; if (n <= 7) return "Zona de desarrollo"; if (n <= 9) return "Alta intensidad"; return "Esfuerzo máximo"; }

// ── Fases ─────────────────────────────────────────────────────────────────────
type Phase = { key: string; glyph: string; useImage?: any; label: string; value: string; sub: string };

function buildPhases(
  series: SerieSimple[], seriesComp: SerieCompuesta[],
  nivelEstres: number | null | undefined, esCompuesto: boolean,
): Phase[] {
  const vol = esCompuesto ? calcVolumenComp(seriesComp) : calcVolumen(series);
  const kcal = esCompuesto ? calcCaloriasComp(seriesComp) : calcCalorias(series);
  const best = esCompuesto ? null : mejorSerie(series);
  const rpe = RPE_SCALE.find(r => r.v === nivelEstres) ?? null;
  const n = esCompuesto ? seriesComp.length : series.length;

  const out: Phase[] = [];

  out.push({
    key: "vol", glyph: "◈",
    label: "Volumen total",
    value: vol >= 1000 ? `${(vol / 1000).toFixed(1)} t` : `${vol.toFixed(0)} kg`,
    sub: `${n} serie${n !== 1 ? "s" : ""}`,
  });

  out.push({
    key: "kcal", glyph: "", useImage: iconKcal,
    label: "Calorías",
    value: `${kcal} kcal`,
    sub: "estimación de la sesión",
  });

  if (best) {
    out.push({
      key: "best", glyph: "◆",
      label: "Mejor serie",
      value: `${best.peso} kg × ${best.reps}`,
      sub: `${(best.peso * best.reps).toFixed(0)} kg de volumen`,
    });
  }

  if (rpe) {
    out.push({
      key: "rpe", glyph: "◉",
      label: "Esfuerzo percibido",
      value: `RPE ${rpe.v}  ·  ${rpe.label}`,
      sub: getMotiv(rpe.v),
    });
  }

  out.push({
    key: "exp", glyph: "", useImage: iconExp,
    label: "Experiencia",
    value: "+1.25 EXP",
    sub: "Sesión completada",
  });

  return out;
}

// ── Tarjeta ───────────────────────────────────────────────────────────────────
const PhaseCard = memo(function PhaseCard({
  phase, isDark, dwellMs, onFinish,
}: { phase: Phase; isDark: boolean; dwellMs: number; onFinish: () => void }) {
  const tok = isDark ? t.dark : t.light;

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  useEffect(() => {
    // reset
    translateY.value = -120;
    opacity.value = 0;
    scale.value = 0.94;

    // entrada desde arriba
    translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
    scale.value = withSpring(1, { damping: 22, stiffness: 220 });
    opacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) });

    // salida hacia arriba
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) });
      translateY.value = withTiming(-90, { duration: 280, easing: Easing.in(Easing.quad) },
        (done) => { if (done) runOnJS(onFinish)(); });
    }, dwellMs);

    return () => clearTimeout(timer);
  }, [phase.key]);

  return (
    <Animated.View style={[s.cardWrap, animStyle]}>
      <View style={[s.card, { backgroundColor: tok.bg, borderColor: tok.border }]}>
        {/* Línea acento superior */}
        <View style={s.topLine} />

        {/* Icono */}
        <View style={[s.iconBox, { backgroundColor: t.accentDim }]}>
          {phase.useImage ? (
            <Image
              source={phase.useImage}
              accessibilityIgnoresInvertColors
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={[s.glyph, { color: t.accent }]}>{phase.glyph}</Text>
          )}
        </View>

        {/* Texto */}
        <View style={s.textBlock}>
          <Text style={[s.label, { color: tok.textMuted }]}>{phase.label}</Text>
          <Text style={[s.value, { color: tok.textPrimary }]}>{phase.value}</Text>
          <Text style={[s.sub, { color: tok.textMuted }]}>{phase.sub}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

// ── Principal ─────────────────────────────────────────────────────────────────
export default function CelebracionModal({
  visible, series = [], seriesComp = [], nivelEstres = null,
  esCompuesto = false, dwellMs = 1900, onFinish,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tok = isDark ? t.dark : t.light;

  const phases = useMemo(
    () => buildPhases(series, seriesComp, nivelEstres, esCompuesto),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible],
  );

  const [phaseIdx, setPhaseIdx] = useState<number | null>(null);
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    if (visible) { setPhaseIdx(0); setConfettiDone(false); }
    else { setPhaseIdx(null); }
  }, [visible]);

  const next = () => {
    setPhaseIdx(prev => {
      if (prev === null) return null;
      const n = prev + 1;
      if (n >= phases.length) { onFinish?.(); return null; }
      return n;
    });
  };

  if (!visible || phaseIdx === null) return null;

  const current = phases[phaseIdx];

  return (
    <View style={s.overlay} pointerEvents="box-none">
      {/* Confeti sutil */}
      {!confettiDone && (
        <LottieView
          source={confettiAnim}
          autoPlay loop={false}
          onAnimationFinish={() => setConfettiDone(true)}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Card */}
      {current && (
        <PhaseCard
          key={current.key}
          phase={current}
          isDark={isDark}
          dwellMs={dwellMs}
          onFinish={next}
        />
      )}

      {/* Pips — debajo de la card */}
      <View style={s.pipsRow}>
        {phases.map((p, i) => (
          <View
            key={p.key}
            style={[
              s.pip,
              {
                backgroundColor:
                  i < phaseIdx ? tok.pipDone :
                    i === phaseIdx ? tok.pipActive :
                      tok.pip,
                width: i === phaseIdx ? 18 : 5,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 64,
  },

  cardWrap: {
    width: "82%",
    maxWidth: 340,
  },
  card: {
    borderRadius: t.r.card,
    borderWidth: 1,
    padding: t.sp.xl,
    paddingTop: t.sp.xl + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: t.sp.md,
    overflow: "hidden",
    // sombra sutil
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  // Línea de acento en la parte superior (1.5 px)
  topLine: {
    position: "absolute",
    top: 0, left: 24, right: 24,
    height: 1.5,
    borderRadius: t.r.full,
    backgroundColor: t.accent,
    opacity: 0.9,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: t.r.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  glyph: {
    fontSize: 22,
    lineHeight: 26,
  },

  textBlock: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  value: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
  },

  // Pips
  pipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
  pip: {
    height: 5,
    borderRadius: t.r.full,
  },
});