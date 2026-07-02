// src/features/fit/components/PesoObjetivoProgreso.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

const VIZ_GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;

const LOCK = {
  bgDark:         "rgba(15,23,42,0.80)",
  bgLight:        "rgba(240,253,250,0.95)",
  borderDark:     "rgba(255,255,255,0.16)",
  borderLight:    "rgba(15,118,110,0.18)",
  iconBgDark:     "rgba(15,23,42,1)",
  iconBgLight:    "#FFFFFF",
  iconBorderDark: "rgba(148,163,184,0.50)",
  iconBorderLight:"rgba(16,185,129,0.35)",
  iconDark:       "#A7F3D0",
  iconLight:      "#047857",
  titleLight:     "#065F46",
  textLight:      "#047857",
  ctaDark:        "#A7F3D0",
  ctaLight:       "#047857",
} as const;

type UnidadPeso = "KG" | "LB";

type PesoObjetivoProgresoProps = {
  peso?: number | string | null;
  objetivo?: number | string | null;
  medidaPeso?: UnidadPeso;
};

const KG_TO_LB = 2.2046226218;

function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function formatKgOrLb(valueKg: number, medidaPeso: UnidadPeso) {
  if (medidaPeso === "LB") return kgToLb(Number(valueKg) || 0);
  return `${round1(valueKg)} kg`;
}

function Chip({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  const t = scheme(isDark);
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: t.textPrimary }]}>{value}</Text>
    </View>
  );
}

function PesoObjetivoSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#E5E7EB";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB";

  return (
    <View pointerEvents="none">
      <View style={styles.skelHeader}>
        <View style={[styles.skelBarLg, { backgroundColor: base }]} />
        <View style={[styles.skelBarSm, { backgroundColor: base }]} />
      </View>

      <View style={styles.skelGrid}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.skelCard,
              {
                borderColor: border,
                backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
              },
            ]}
          >
            <View style={[styles.skelLineSm, { backgroundColor: base }]} />
            <View style={[styles.skelLineMd, { backgroundColor: base }]} />
          </View>
        ))}
      </View>

      <View style={styles.skelRingWrap}>
        <View style={[styles.skelRing, { borderColor: base }]}>
          <View style={[styles.skelLineLg, { backgroundColor: base }]} />
          <View style={[styles.skelLineWide, { backgroundColor: base }]} />
        </View>
      </View>

      <View style={styles.skelBarArea}>
        <View style={[styles.skelBarFull, { backgroundColor: base }]} />
        <View style={[styles.skelFooterLine, { backgroundColor: base }]} />
      </View>
    </View>
  );
}

export default function PesoObjetivoProgreso({
  peso,
  objetivo,
  medidaPeso = "KG",
}: PesoObjetivoProgresoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const usuario = useUsuarioStore((s) => s.usuario);
  const navigation = useNavigation<any>();

  const t = scheme(isDark);

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const locked = !(planActual === "PREMIUM" && haPagado);

  const handleGoPremium = useCallback(() => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  }, [navigation]);

  const pesoKg = Number(peso ?? 0);
  const objetivoKg = Number(objetivo ?? 0);

  const unidadPesoLabel = medidaPeso === "LB" ? "lb" : "kg";
  const hasData = Boolean(pesoKg && objetivoKg);

  const rumbo: "bajar" | "subir" | "igual" = useMemo(() => {
    if (!hasData) return "igual";
    if (objetivoKg === pesoKg) return "igual";
    return objetivoKg < pesoKg ? "bajar" : "subir";
  }, [hasData, objetivoKg, pesoKg]);

  const pct = useMemo(() => {
    if (!hasData) return 0;
    if (rumbo === "igual") return 1;
    return objetivoKg > pesoKg
      ? Math.min(pesoKg / objetivoKg, 1)
      : Math.min(objetivoKg / pesoKg, 1);
  }, [hasData, rumbo, objetivoKg, pesoKg]);

  const deltaKg = useMemo(() => (hasData ? objetivoKg - pesoKg : 0), [hasData, objetivoKg, pesoKg]);
  const alcanzado = rumbo === "igual";
  const dash = C * (1 - pct);

  const deltaDisplayValue =
    medidaPeso === "LB" ? round1(deltaKg * KG_TO_LB) : round1(deltaKg);

  const estado = useMemo(() => {
    if (!hasData) return "";
    if (alcanzado) return "¡Has alcanzado tu objetivo!";
    const abs = Math.abs(deltaDisplayValue).toFixed(1);
    return deltaDisplayValue < 0
      ? `Te sobran ${abs} ${unidadPesoLabel}`
      : `Te faltan ${abs} ${unidadPesoLabel}`;
  }, [hasData, alcanzado, deltaDisplayValue, unidadPesoLabel]);

  const chipLabel = useMemo(() => {
    if (alcanzado) return "Objetivo logrado";
    return objetivoKg < pesoKg ? "Objetivo: bajar" : "Objetivo: subir";
  }, [alcanzado, objetivoKg, pesoKg]);

  const pesoDisplay = formatKgOrLb(pesoKg, medidaPeso);
  const objetivoDisplay = formatKgOrLb(objetivoKg, medidaPeso);
  const diferenciaDisplay = `${deltaDisplayValue > 0 ? "+" : ""}${deltaDisplayValue} ${unidadPesoLabel}`;

  const cardBg = isDark ? Colors.dark.surface : Colors.secondary;

  if (locked) {
    return (
      <View style={styles.root}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <PesoObjetivoSkeleton isDark={isDark} />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleGoPremium}
            style={[
              styles.lockCta,
              {
                borderColor: isDark ? LOCK.borderDark : LOCK.borderLight,
                backgroundColor: isDark ? LOCK.bgDark : LOCK.bgLight,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hazte Premium para ver el progreso hacia tu peso objetivo"
          >
            <View
              style={[
                styles.lockIconWrap,
                {
                  backgroundColor: isDark ? LOCK.iconBgDark : LOCK.iconBgLight,
                  borderColor: isDark ? LOCK.iconBorderDark : LOCK.iconBorderLight,
                },
              ]}
            >
              <Lock
                size={18}
                color={isDark ? LOCK.iconDark : LOCK.iconLight}
                strokeWidth={2}
              />
            </View>

            <View style={styles.lockTextWrap}>
              <Text
                style={[
                  styles.lockTitle,
                  { color: isDark ? t.textPrimary : LOCK.titleLight },
                ]}
              >
                Progreso hacia tu peso objetivo Premium
              </Text>
              <Text
                style={[
                  styles.lockDesc,
                  { color: isDark ? t.textSecondary : LOCK.textLight },
                ]}
              >
                Hazte Premium para seguir tu avance hacia el peso objetivo con anillos y métricas
                detalladas.
              </Text>
            </View>

            <Text
              style={[
                styles.lockMore,
                { color: isDark ? LOCK.ctaDark : LOCK.ctaLight },
              ]}
            >
              Ver más
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!hasData) return null;

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Progreso hacia tu peso objetivo</Text>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: t.textSecondary }]}>{chipLabel}</Text>
          </View>
        </View>

        <View style={styles.chipsRow}>
          <Chip label="Actual" value={pesoDisplay} isDark={isDark} />
          <Chip label="Objetivo" value={objetivoDisplay} isDark={isDark} />
          <Chip label="Diferencia" value={diferenciaDisplay} isDark={isDark} />
        </View>

        <View style={styles.ringWrap}>
          <View style={styles.ringBox}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 180 180"
              style={styles.ringSvg}
              accessibilityRole="image"
              accessibilityLabel="Progreso hacia el peso objetivo"
            >
              <Defs>
                <SvgLinearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor={VIZ_GRADIENT[0]} />
                  <Stop offset="50%" stopColor={VIZ_GRADIENT[1]} />
                  <Stop offset="100%" stopColor={VIZ_GRADIENT[2]} />
                </SvgLinearGradient>
                <SvgLinearGradient id="kGradMuted" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="rgba(0,255,64,0.5)" />
                  <Stop offset="50%" stopColor="rgba(94,230,157,0.5)" />
                  <Stop offset="100%" stopColor="rgba(178,0,255,0.5)" />
                </SvgLinearGradient>
              </Defs>

              <Circle cx={CX} cy={CY} r={R} stroke={isDark ? t.border : t.surface} strokeWidth={12} fill="transparent" />

              <Circle
                cx={CX}
                cy={CY}
                r={R}
                stroke={alcanzado ? "url(#kGrad)" : "url(#kGradMuted)"}
                strokeWidth={12}
                fill="transparent"
                strokeDasharray={C}
                strokeDashoffset={dash}
                strokeLinecap="round"
              />
            </Svg>

            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={[styles.ringKicker, { color: t.textSecondary }]}>Progreso</Text>
              <Text style={[styles.ringValue, { color: t.textPrimary }]}>{Math.round(pct * 100)}%</Text>
              <Text style={[styles.ringDesc, { color: t.textSecondary }]}>{estado}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.barTrack,
            {
              backgroundColor: isDark ? t.border : t.surface,
              borderColor: t.border,
            },
          ]}
          accessibilityRole="progressbar"
          accessibilityLabel="Barra de progreso"
          accessibilityValue={{ min: 0, max: 1, now: pct }}
        >
          <LinearGradient
            colors={["#8bff62", "#39ff14", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${pct * 100}%` }]}
          />
        </View>

        <Text style={[styles.footnote, { color: t.textSecondary }]}>
          Mantén hábitos sostenibles: el progreso lento y constante suele ser más efectivo y fácil
          de mantener a largo plazo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 220,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    lineHeight: 14,
  },
  chipsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    fontFamily: Font.body.bold,
    letterSpacing: 0.1,
  },
  ringWrap: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ringBox: {
    width: 176,
    height: 176,
    position: "relative",
  },
  ringSvg: {
    position: "absolute",
    inset: 0,
    transform: [{ rotate: "-90deg" }],
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  ringKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  ringValue: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    fontFamily: Font.title.bold,
    letterSpacing: -0.4,
  },
  ringDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    textAlign: "center",
  },
  barTrack: {
    marginTop: 16,
    height: 10,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  barFill: {
    height: "100%",
  },
  footnote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  lockCta: {
    marginTop: 16,
    borderRadius: 12,
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
    fontFamily: Font.body.bold,
    lineHeight: 16,
  },
  lockDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  lockMore: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: Font.body.bold,
  },
  skelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skelBarLg: { width: 180, height: 16, borderRadius: 6 },
  skelBarSm: { width: 90, height: 14, borderRadius: 6 },
  skelGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  skelCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  skelLineSm: { width: 70, height: 10, borderRadius: 6 },
  skelLineMd: { width: 90, height: 14, borderRadius: 6 },
  skelRingWrap: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  skelRing: {
    width: 176,
    height: 176,
    borderRadius: 999,
    borderWidth: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skelLineLg: { width: 80, height: 12, borderRadius: 6 },
  skelLineWide: { marginTop: 8, width: 140, height: 10, borderRadius: 6 },
  skelBarArea: { marginTop: 16 },
  skelBarFull: { height: 10, width: "100%", borderRadius: 999 },
  skelFooterLine: { marginTop: 12, height: 12, width: "100%", borderRadius: 6 },
});
