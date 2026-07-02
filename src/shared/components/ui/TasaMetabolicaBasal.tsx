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

function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
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

  const t = scheme(isDark);

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

  const pesoDisplay =
    medidaPeso?.toUpperCase() === "KG"
      ? `${round1(pesoKg)} kg`
      : kgToLb(Number(pesoKg) || 0);

  const alturaDisplay =
    medidaAltura?.toUpperCase() === "FT"
      ? cmToFt(Number(alturaCm) || 0)
      : `${round1(alturaCm)} cm`;

  const cardBg = isDark ? Colors.dark.surface : Colors.secondary;

  if (locked) {
    return (
      <View style={styles.root}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TmbSkeleton isDark={isDark} />

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
            accessibilityLabel="Hazte Premium para ver tu TMB"
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
                Tasa metabólica basal Premium
              </Text>
              <Text
                style={[
                  styles.lockDesc,
                  { color: isDark ? t.textSecondary : LOCK.textLight },
                ]}
              >
                Hazte Premium para ver tu TMB diaria personalizada y entender mejor tus necesidades
                calóricas en reposo.
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

  if (!hasInputs || tmb == null) return null;

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Tasa metabólica basal</Text>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: isGradient ? t.textPrimary : t.textSecondary }]}>
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
                  <Stop offset="0%" stopColor={VIZ_GRADIENT[0]} />
                  <Stop offset="50%" stopColor={VIZ_GRADIENT[1]} />
                  <Stop offset="100%" stopColor={VIZ_GRADIENT[2]} />
                </SvgLinearGradient>

                <SvgLinearGradient id="tmbGradMuted" x1="0" y1="0" x2="1" y2="1">
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
                stroke={isGradient ? "url(#tmbGrad)" : "url(#tmbGradMuted)"}
                strokeWidth={12}
                fill="transparent"
                strokeDasharray={C}
                strokeDashoffset={dash}
                strokeLinecap="round"
              />
            </Svg>

            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={[styles.ringKicker, { color: t.textSecondary }]}>TMB estimada</Text>
              <Text style={[styles.ringValue, { color: t.textPrimary }]}>{tmb}</Text>
              <Text style={[styles.ringUnit, { color: t.textSecondary }]}>kcal / día</Text>
            </View>
          </View>
        </View>

        <View style={styles.barWrap}>
          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
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
            <Text style={[styles.barLabel, { color: t.textTertiary }]}>{minTMB} kcal</Text>
            <Text style={[styles.barLabel, { color: t.textTertiary }]}>{maxTMB} kcal</Text>
          </View>
        </View>

        <Text style={[styles.footnote, { color: t.textSecondary }]}>
          La TMB es una aproximación basada en fórmulas estándar. Factores como masa magra, sueño,
          estrés o medicación pueden modificar tus necesidades reales.
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
    textTransform: "capitalize",
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
  ringUnit: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  barWrap: {
    marginTop: 16,
  },
  barTrack: {
    height: 10,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  barFill: {
    height: "100%",
  },
  barLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  footnote: {
    marginTop: 16,
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
  skelBarLg: { width: 150, height: 16, borderRadius: 6 },
  skelBarMd: { width: 120, height: 14, borderRadius: 6 },
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
  skelLineSm2: { marginTop: 8, width: 70, height: 10, borderRadius: 6 },
  skelFooterLine1: { marginTop: 16, height: 12, width: "100%", borderRadius: 6 },
  skelFooterLine2: { marginTop: 8, height: 12, width: "75%", borderRadius: 6 },
});
