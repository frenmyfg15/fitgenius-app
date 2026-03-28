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

/* Assets locales */
const iconKcal = require("../../../../assets/fit/ejercicio/calorias.png");
const iconExp = require("../../../../assets/fit/ejercicio/experiencia.png");
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

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
  radius: {
    xl: 28,
    full: 999,
  },
  spacing: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
} as const;

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

type SerieSimple = { reps: number; peso: number };
type SerieCompuesta = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
}[];

type Props = {
  series?: SerieSimple[];
  seriesComp?: SerieCompuesta[];
  nivelEstres?: number | null;
  esCompuesto?: boolean;
  onFinish?: () => void;
};

function calcVolumen(s: SerieSimple[]) {
  return s.reduce((a, x) => a + x.peso * x.reps, 0);
}

function calcVolumenComp(sc: SerieCompuesta[]) {
  return sc.reduce(
    (a, s) =>
      a +
      s.reduce(
        (b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0),
        0
      ),
    0
  );
}

function calcCalorias(s: SerieSimple[]) {
  return Math.round(s.reduce((a, x) => a + x.peso * x.reps * 0.1, 0) + s.length * 3);
}

function calcCaloriasComp(sc: SerieCompuesta[]) {
  return Math.round(
    sc.reduce(
      (a, s) =>
        a +
        s.reduce(
          (b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0) * 0.1,
          0
        ),
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

const StatCard = memo(function StatCard({
  isDark,
  title,
  value,
  sub,
  image,
}: {
  isDark: boolean;
  title: string;
  value: string;
  sub?: string;
  image?: any;
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
          { backgroundColor: tokens.color.accentSoft },
        ]}
      >
        {image ? (
          <Image
            source={image}
            accessibilityIgnoresInvertColors
            style={styles.statIconImg}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.statIconDot} />
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
              color: isDark
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

export default function CelebracionModal({
  series = [],
  seriesComp = [],
  nivelEstres = null,
  esCompuesto = false,
  onFinish,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
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

    return {
      volText: vol >= 1000 ? `${(vol / 1000).toFixed(1)} t` : `${vol.toFixed(0)} kg`,
      kcalText: `${kcal} kcal`,
      seriesText: `${n} serie${n !== 1 ? "s" : ""}`,
      bestText: best ? `${best.peso} kg × ${best.reps}` : null,
      bestSub: best ? `${(best.peso * best.reps).toFixed(0)} kg de volumen` : null,
      rpeText: rpe ? `RPE ${rpe.v} · ${rpe.label}` : null,
      rpeSub: rpe ? getMotiv(rpe.v) : null,
      expText: "+1.25 EXP",
    };
  }, [esCompuesto, series, seriesComp, nivelEstres]);

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

      {/* Sin ScrollView — el contenido se distribuye con flex */}
      <View style={styles.inner}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text
            style={[
              styles.heroTitle,
              {
                color: isDark
                  ? tokens.color.textPrimaryDark
                  : tokens.color.textPrimaryLight,
              },
            ]}
          >
            Sesión completada
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            Tu entrenamiento se ha guardado correctamente
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <StatCard
            isDark={isDark}
            title="Volumen total"
            value={data.volText}
            sub={data.seriesText}
          />
          <StatCard
            isDark={isDark}
            title="Calorías"
            value={data.kcalText}
            sub="estimación"
            image={iconKcal}
          />
          {data.bestText ? (
            <StatCard
              isDark={isDark}
              title="Mejor serie"
              value={data.bestText}
              sub={data.bestSub ?? undefined}
            />
          ) : (
            <StatCard
              isDark={isDark}
              title="Esfuerzo percibido"
              value={data.rpeText ?? "—"}
              sub={data.rpeSub ?? undefined}
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

        {/* CTA outline monocromo */}
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
            <Text
              style={[
                styles.ctaText,
                {
                  color: isDark
                    ? tokens.color.textPrimaryDark
                    : tokens.color.textPrimaryLight,
                },
              ]}
            >
              Continuar
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    elevation: 999999,
  },
  // Ocupa todo el espacio disponible, sin scroll
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 24,
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
    lineHeight: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  stats: {
    gap: 10,
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
    backgroundColor: tokens.color.accent,
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
  ctaWrap: {
    // sin margen extra, el gap del inner lo gestiona
  },
  cta: {
    height: 54,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: '#22C55E'
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});