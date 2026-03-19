// src/features/fit/components/TasaMetabolicaBasal.tsx
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
import { cmToFt } from "@/shared/utils/cmToFt";
import { kgToLb } from "@/shared/utils/kgToLb";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type UnidadPeso = "KG" | "LB";
type UnidadAltura = "CM" | "FT";

type TasaMetabolicaBasalProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  edad?: number | string | null;
  sexo?: string | null;
  medidaPeso?: UnidadPeso;
  medidaAltura?: UnidadAltura;
  soloGrafica?: boolean;
};

const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    chipBgDark: "rgba(148,163,184,0.12)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",

    metricBgDark: "rgba(15,24,41,0.55)",
    metricBgLight: "#FFFFFF",
    metricBorderDark: "rgba(255,255,255,0.06)",
    metricBorderLight: "rgba(0,0,0,0.06)",

    ringBaseDark: "rgba(148,163,184,0.22)",
    ringBaseLight: "#E5E7EB",

    barTrackDark: "rgba(148,163,184,0.18)",
    barTrackLight: "#E5E7EB",
    barBorderDark: "rgba(255,255,255,0.10)",
    barBorderLight: "#E5E7EB",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#475569",
    textMutedDark: "#64748B",
    textMutedLight: "#6B7280",

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
  },
  radius: { lg: 16, md: 12, sm: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function Chip({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? tokens.color.metricBgDark : tokens.color.metricBgLight,
          borderColor: isDark ? tokens.color.metricBorderDark : tokens.color.metricBorderLight,
        },
      ]}
    >
      <Text
        style={[
          styles.metricLabel,
          { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textMutedLight },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metricValue,
          { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function TmbSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#E5E7EB";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB";

  return (
    <View>
      <View style={styles.skelHeader}>
        <View style={[styles.skelBarLg, { backgroundColor: base }]} />
        <View style={[styles.skelBarMd, { backgroundColor: base }]} />
      </View>

      <View style={styles.skelGrid}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.skelCard,
              {
                borderColor: border,
                backgroundColor: isDark ? "rgba(15,24,41,0.55)" : "#FFFFFF",
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
          <View style={[styles.skelLineSm2, { backgroundColor: base }]} />
        </View>
      </View>

      <View style={[styles.skelFooterLine1, { backgroundColor: base }]} />
      <View style={[styles.skelFooterLine2, { backgroundColor: base }]} />
    </View>
  );
}

export default function TasaMetabolicaBasal({
  peso,
  altura,
  edad,
  sexo,
  medidaPeso = "KG",
  medidaAltura = "CM",
  soloGrafica = false,
}: TasaMetabolicaBasalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const usuario = useUsuarioStore((s) => s.usuario);
  const navigation = useNavigation<any>();

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const locked = !(planActual === "PREMIUM" && haPagado);

  const handleGoPremium = useCallback(() => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  }, [navigation]);

  const pesoKg = Number(peso ?? 0);
  const alturaCm = Number(altura ?? 0);
  const edadNum = Number(edad ?? 0);
  const sexoRaw = String(sexo ?? "");

  const hasInputs = pesoKg > 0 && alturaCm > 0 && edadNum > 0 && !!sexoRaw.trim();

  const sexoNorm = sexoRaw.toLowerCase().startsWith("m") ? "M" : "F";

  const tmb = useMemo(() => {
    if (!hasInputs) return null;
    const base = 10 * pesoKg + 6.25 * alturaCm - 5 * edadNum;
    return Math.round(sexoNorm === "M" ? base + 5 : base - 161);
  }, [hasInputs, pesoKg, alturaCm, edadNum, sexoNorm]);

  const minTMB = 1000;
  const maxTMB = 3000;

  const { estado, isGradient } = useMemo(() => {
    if (tmb == null) return { estado: "", isGradient: false };
    if (tmb < minTMB) return { estado: "por debajo", isGradient: false };
    if (tmb > maxTMB) return { estado: "por encima", isGradient: false };
    return { estado: "en rango estimado", isGradient: true };
  }, [tmb]);

  const pct = useMemo(() => {
    if (tmb == null) return 0;
    return Math.max(0, Math.min(1, (tmb - minTMB) / (maxTMB - minTMB)));
  }, [tmb]);

  const dash = C * (1 - pct);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const ringBase = isDark ? tokens.color.ringBaseDark : tokens.color.ringBaseLight;

  const pesoDisplay =
    medidaPeso?.toUpperCase() === "KG"
      ? `${round1(pesoKg)} kg`
      : kgToLb(Number(pesoKg) || 0);

  const alturaDisplay =
    medidaAltura?.toUpperCase() === "FT"
      ? cmToFt(Number(alturaCm) || 0)
      : `${round1(alturaCm)} cm`;

  if (locked) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={GRADIENT as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frame}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
              },
            ]}
          >
            <TmbSkeleton isDark={isDark} />

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleGoPremium}
              style={[
                styles.lockCta,
                {
                  borderColor: isDark ? tokens.color.lockCardBorderDark : tokens.color.lockCardBorderLight,
                  backgroundColor: isDark ? tokens.color.lockCardBgDark : tokens.color.lockCardBgLight,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Hazte Premium para ver tu TMB"
            >
              <View
                style={[
                  styles.lockIconWrap,
                  {
                    backgroundColor: isDark ? tokens.color.lockIconBgDark : tokens.color.lockIconBgLight,
                    borderColor: isDark ? tokens.color.lockIconBorderDark : tokens.color.lockIconBorderLight,
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
                    { color: isDark ? tokens.color.lockTitleDark : tokens.color.lockTitleLight },
                  ]}
                >
                  Tasa metabólica basal Premium
                </Text>
                <Text
                  style={[
                    styles.lockDesc,
                    { color: isDark ? tokens.color.lockTextDark : tokens.color.lockTextLight },
                  ]}
                >
                  Hazte Premium para ver tu TMB diaria personalizada y entender mejor tus necesidades
                  calóricas en reposo.
                </Text>
              </View>

              <Text
                style={[
                  styles.lockMore,
                  { color: isDark ? tokens.color.lockCtaDark : tokens.color.lockCtaLight },
                ]}
              >
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!hasInputs || tmb == null) return null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.frame}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
              borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>Tasa metabólica basal</Text>

            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                  borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: isGradient ? textPrimary : textSecondary }]}>
                {estado}
              </Text>
            </View>
          </View>

          {!soloGrafica && (
            <View style={styles.chipsRow}>
              <Chip label="Peso" value={pesoDisplay} isDark={isDark} />
              <Chip label="Altura" value={alturaDisplay} isDark={isDark} />
              <Chip label="Edad" value={`${edadNum} años`} isDark={isDark} />
            </View>
          )}

          <View style={styles.ringWrap}>
            <View style={styles.ringBox}>
              <Svg
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
                style={styles.ringSvg}
                accessibilityLabel="Anillo de TMB"
                role="img"
              >
                <Defs>
                  <SvgLinearGradient id="tmbGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor={tokens.color.gradientStart} />
                    <Stop offset="50%" stopColor={tokens.color.gradientMid} />
                    <Stop offset="100%" stopColor={tokens.color.gradientEnd} />
                  </SvgLinearGradient>

                  <SvgLinearGradient id="tmbGradMuted" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="rgba(0,255,64,0.5)" />
                    <Stop offset="50%" stopColor="rgba(94,230,157,0.5)" />
                    <Stop offset="100%" stopColor="rgba(178,0,255,0.5)" />
                  </SvgLinearGradient>
                </Defs>

                <Circle cx={CX} cy={CY} r={R} stroke={ringBase} strokeWidth={12} fill="transparent" />

                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={isGradient ? "url(#tmbGrad)" : "url(#tmbGradMuted)"}
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                />
              </Svg>

              <View style={styles.ringCenter} pointerEvents="none">
                <Text style={[styles.ringKicker, { color: textSecondary }]}>TMB estimada</Text>
                <Text style={[styles.ringValue, { color: textPrimary }]}>{tmb}</Text>
                <Text style={[styles.ringUnit, { color: textSecondary }]}>kcal / día</Text>
              </View>
            </View>
          </View>

          <View style={styles.barWrap}>
            <View
              style={[
                styles.barTrack,
                {
                  backgroundColor: isDark ? tokens.color.barTrackDark : tokens.color.barTrackLight,
                  borderColor: isDark ? tokens.color.barBorderDark : tokens.color.barBorderLight,
                },
              ]}
              accessibilityRole="progressbar"
              accessibilityLabel="Rango de TMB"
              accessibilityValue={{ min: minTMB, max: maxTMB, now: tmb }}
            >
              <LinearGradient
                colors={["#8bff62", "#39ff14", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${pct * 100}%` }]}
              />
            </View>

            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, { color: textMuted }]}>{minTMB} kcal</Text>
              <Text style={[styles.barLabel, { color: textMuted }]}>{maxTMB} kcal</Text>
            </View>
          </View>

          <Text style={[styles.footnote, { color: textSecondary }]}>
            La TMB es una aproximación basada en fórmulas estándar. Factores como masa magra, sueño,
            estrés o medicación pueden modificar tus necesidades reales.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
  },

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
  },

  title: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    maxWidth: 220,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    textTransform: "capitalize",
  },

  chipsRow: {
    marginTop: tokens.spacing.md,
    flexDirection: "row",
    gap: tokens.spacing.md,
  },

  metric: {
    flex: 1,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
  },

  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  metricValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 0.1,
  },

  ringWrap: {
    marginTop: tokens.spacing.lg,
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
  },

  ringKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },

  ringValue: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  ringUnit: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },

  barWrap: {
    marginTop: tokens.spacing.lg,
  },

  barTrack: {
    height: 10,
    width: "100%",
    borderRadius: tokens.radius.full,
    overflow: "hidden",
    borderWidth: 1,
  },

  barFill: {
    height: "100%",
  },

  barLabels: {
    marginTop: tokens.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  barLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },

  footnote: {
    marginTop: tokens.spacing.lg,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  lockCta: {
    marginTop: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },

  lockIconWrap: {
    height: 32,
    width: 32,
    borderRadius: tokens.radius.full,
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

  skelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
  },

  skelBarLg: {
    width: 150,
    height: 16,
    borderRadius: 6,
  },

  skelBarMd: {
    width: 120,
    height: 14,
    borderRadius: 6,
  },

  skelGrid: {
    marginTop: tokens.spacing.md,
    flexDirection: "row",
    gap: tokens.spacing.md,
  },

  skelCard: {
    flex: 1,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },

  skelLineSm: {
    width: 70,
    height: 10,
    borderRadius: 6,
  },

  skelLineMd: {
    width: 90,
    height: 14,
    borderRadius: 6,
  },

  skelRingWrap: {
    marginTop: tokens.spacing.lg,
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

  skelLineLg: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },

  skelLineSm2: {
    marginTop: 8,
    width: 70,
    height: 10,
    borderRadius: 6,
  },

  skelFooterLine1: {
    marginTop: tokens.spacing.lg,
    height: 12,
    width: "100%",
    borderRadius: 6,
  },

  skelFooterLine2: {
    marginTop: tokens.spacing.sm,
    height: 12,
    width: "75%",
    borderRadius: 6,
  },
});