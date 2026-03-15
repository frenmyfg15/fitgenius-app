// File: src/features/cuenta/components/Experiencia.tsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { CheckCircle2, X, Zap, Flame, Trophy, Target } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

// ── Tokens ────────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    frameGradientDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    frameGradientLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],
    cardBgDark: "rgba(15,24,41,0.70)",
    cardBgLight: "rgba(255,255,255,0.95)",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",
    badgeFrameDark: ["#0F1829", "#080D17", "#0F1829"] as string[],
    badgeFrameLight: ["#00E85A", "#22C55E", "#16A34A"] as string[],
    badgeBgDark: "rgba(255,255,255,0.06)",
    badgeBgLight: "#FFFFFF",
    badgeBorderDark: "rgba(255,255,255,0.08)",
    badgeBorderLight: "transparent",
    labelBgDark: "rgba(15,24,41,0.85)",
    labelBgLight: "#FFFFFF",
    labelBorderDark: "rgba(255,255,255,0.09)",
    labelBorderLight: "rgba(0,0,0,0.07)",
    trackBgDark: "rgba(148,163,184,0.14)",
    trackBgLight: "#E2E8F0",
    trackBorderDark: "rgba(255,255,255,0.06)",
    barGradient: ["#8BFF62", "#00E85A", "#A855F7"] as string[],
    barDot: "#FFFFFF",
    barDotBorder: "rgba(0,0,0,0.12)",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textPercentDark: "#CBD5E1",
    textPercentLight: "#475569",
    checkColor: "#00E85A",
  },
  radius: { lg: 16, md: 12, sm: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 20 },
} as const;

// ── Niveles ───────────────────────────────────────────────────────────────────
type Nivel = { nombre: string; experiencia: number; icono: ImageSourcePropType };

const NIVELES: Nivel[] = [
  { nombre: "Bronce", experiencia: 0, icono: require("../../../../assets/fit/cuenta/bronce.webp") },
  { nombre: "Plata", experiencia: 500, icono: require("../../../../assets/fit/cuenta/plata.webp") },
  { nombre: "Oro", experiencia: 1500, icono: require("../../../../assets/fit/cuenta/oro.webp") },
  { nombre: "Platino", experiencia: 3000, icono: require("../../../../assets/fit/cuenta/platino.webp") },
  { nombre: "Diamante", experiencia: 5000, icono: require("../../../../assets/fit/cuenta/diamante.webp") },
  { nombre: "Maestro", experiencia: 8000, icono: require("../../../../assets/fit/cuenta/maestro.webp") },
  { nombre: "Élite", experiencia: 12000, icono: require("../../../../assets/fit/cuenta/elite.webp") },
];

const XP_POR_EJERCICIO = 1.25;

// ── Feedback motivador por rango de ejercicios ───────────────────────────────
function getMensajeFeedback(ejercicios: number, nivelNombre: string, maxLevel: boolean) {
  if (maxLevel) {
    return {
      titulo: "Leyenda viva 🏆",
      mensaje: `Has completado ${ejercicios} ejercicios y alcanzado el nivel máximo. Eres la élite. No hay techo para ti.`,
      icon: "trophy",
    };
  }
  if (ejercicios === 0) {
    return {
      titulo: "El primer paso es hoy",
      mensaje: "Aún no has registrado ejercicios, pero estás aquí y eso ya cuenta. Empieza hoy y observa cómo tu nivel sube.",
      icon: "target",
    };
  }
  if (ejercicios < 10) {
    return {
      titulo: "Calentando motores 🔥",
      mensaje: `${ejercicios} ejercicios completados. Estás arrancando, y eso es lo más difícil. Cada repetición construye el hábito que te cambiará.`,
      icon: "flame",
    };
  }
  if (ejercicios < 40) {
    return {
      titulo: "El hábito se forja aquí",
      mensaje: `${ejercicios} ejercicios y nivel ${nivelNombre}. Ya no es casualidad, es disciplina. Estás construyendo algo real.`,
      icon: "flame",
    };
  }
  if (ejercicios < 100) {
    return {
      titulo: "Consistencia brutal ⚡",
      mensaje: `${ejercicios} ejercicios. La mayoría renuncia antes de llegar aquí. Tú no. Ese es exactamente tu diferencial.`,
      icon: "zap",
    };
  }
  if (ejercicios < 250) {
    return {
      titulo: "Máquina imparable",
      mensaje: `${ejercicios} ejercicios completados como nivel ${nivelNombre}. Tu cuerpo ya sabe lo que es el esfuerzo. Ahora solo queda ir a por más.`,
      icon: "zap",
    };
  }
  return {
    titulo: "Élite en construcción 👑",
    mensaje: `${ejercicios} ejercicios. Llevas tanto tiempo entrenando que ya forma parte de quién eres. El nivel ${nivelNombre} lo demuestra.`,
    icon: "trophy",
  };
}

// ── Modal de feedback ─────────────────────────────────────────────────────────
function FeedbackModal({
  visible,
  onClose,
  experiencia,
  nivelActual,
  siguienteNivel,
  pct,
  maxLevel,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  experiencia: number;
  nivelActual: Nivel;
  siguienteNivel: Nivel;
  pct: number;
  maxLevel: boolean;
  isDark: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 160, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const ejercicios = Math.floor(experiencia / XP_POR_EJERCICIO);
  const feedback = getMensajeFeedback(ejercicios, nivelActual.nombre, maxLevel);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  const IconComponent =
    feedback.icon === "trophy" ? Trophy :
      feedback.icon === "flame" ? Flame :
        feedback.icon === "zap" ? Zap : Target;

  // XP hasta el siguiente nivel
  const xpRestante = maxLevel ? 0 : siguienteNivel.experiencia - experiencia;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                modalStyles.sheet,
                {
                  backgroundColor: isDark ? "#0D1623" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Header gradiente superior */}
              <LinearGradient
                colors={["rgba(0,232,90,0.18)", "rgba(0,232,90,0)"]}
                style={modalStyles.headerGlow}
                pointerEvents="none"
              />

              {/* Botón cerrar */}
              <TouchableOpacity
                onPress={onClose}
                style={[
                  modalStyles.closeBtn,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" },
                ]}
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
              >
                <X size={15} color={isDark ? "#64748B" : "#94A3B8"} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Insignia + nivel */}
              <View style={modalStyles.badgeRow}>
                <LinearGradient
                  colors={isDark ? tokens.color.badgeFrameDark as any : tokens.color.badgeFrameLight as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={modalStyles.badgeFrame}
                >
                  <View style={[
                    modalStyles.badgeInner,
                    { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFF" },
                  ]}>
                    <Image
                      source={nivelActual.icono}
                      resizeMode="contain"
                      style={modalStyles.badgeImage}
                    />
                  </View>
                </LinearGradient>

                <View style={modalStyles.badgeMeta}>
                  <View style={[
                    modalStyles.levelPill,
                    { backgroundColor: isDark ? "rgba(0,232,90,0.12)" : "rgba(0,200,80,0.10)" },
                  ]}>
                    <Text style={modalStyles.levelPillText}>{nivelActual.nombre}</Text>
                  </View>
                  <Text style={[modalStyles.xpBig, { color: textPrimary }]}>
                    {experiencia.toLocaleString("es-ES")}
                    <Text style={[modalStyles.xpUnit, { color: textSecondary }]}> XP</Text>
                  </Text>
                </View>
              </View>

              {/* Título + mensaje */}
              <View style={modalStyles.textBlock}>
                <View style={modalStyles.iconTitleRow}>
                  <View style={[
                    modalStyles.iconBubble,
                    { backgroundColor: isDark ? "rgba(0,232,90,0.13)" : "rgba(0,200,80,0.10)" },
                  ]}>
                    <IconComponent size={16} color="#00E85A" strokeWidth={2.2} />
                  </View>
                  <Text style={[modalStyles.feedbackTitle, { color: textPrimary }]}>
                    {feedback.titulo}
                  </Text>
                </View>
                <Text style={[modalStyles.feedbackMsg, { color: textSecondary }]}>
                  {feedback.mensaje}
                </Text>
              </View>

              {/* Stats row */}
              <View style={[
                modalStyles.statsRow,
                { borderColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" },
              ]}>
                <View style={modalStyles.statItem}>
                  <Text style={[modalStyles.statValue, { color: textPrimary }]}>
                    {ejercicios}
                  </Text>
                  <Text style={[modalStyles.statLabel, { color: textSecondary }]}>
                    ejercicios
                  </Text>
                </View>

                <View style={[modalStyles.statDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" }]} />

                <View style={modalStyles.statItem}>
                  <Text style={[modalStyles.statValue, { color: textPrimary }]}>
                    {pct}%
                  </Text>
                  <Text style={[modalStyles.statLabel, { color: textSecondary }]}>
                    progreso
                  </Text>
                </View>

                <View style={[modalStyles.statDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" }]} />

                <View style={modalStyles.statItem}>
                  {maxLevel ? (
                    <>
                      <CheckCircle2 size={20} color="#00E85A" strokeWidth={2.2} />
                      <Text style={[modalStyles.statLabel, { color: textSecondary }]}>
                        máximo
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[modalStyles.statValue, { color: textPrimary }]}>
                        {xpRestante.toLocaleString("es-ES")}
                      </Text>
                      <Text style={[modalStyles.statLabel, { color: textSecondary }]}>
                        XP para {siguienteNivel.nombre}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Mini barra de progreso */}
              <View style={modalStyles.barWrap}>
                <View style={[
                  modalStyles.barTrack,
                  { backgroundColor: isDark ? "rgba(148,163,184,0.14)" : "#E2E8F0" },
                ]}>
                  <View style={[modalStyles.barFill, { width: `${pct}%` as any }]}>
                    <LinearGradient
                      colors={tokens.color.barGradient as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </View>
                </View>
                <View style={modalStyles.barLabels}>
                  <Text style={[modalStyles.barLabelText, { color: textSecondary }]}>
                    {nivelActual.nombre}
                  </Text>
                  {!maxLevel && (
                    <Text style={[modalStyles.barLabelText, { color: textSecondary }]}>
                      {siguienteNivel.nombre}
                    </Text>
                  )}
                </View>
              </View>

            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ── Experiencia (principal) ───────────────────────────────────────────────────
export default function Experiencia() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const { usuario } = useUsuarioStore();
  const experiencia = usuario?.experiencia ?? 0;

  const { nivelActual, siguienteNivel, pct } = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < NIVELES.length; i++) {
      if (experiencia >= NIVELES[i].experiencia) idx = i;
    }
    const actual = NIVELES[idx];
    const siguiente = NIVELES[idx + 1] ?? NIVELES[idx];
    const span = Math.max(1, siguiente.experiencia - actual.experiencia);
    const prog = actual.nombre === siguiente.nombre
      ? 1
      : (experiencia - actual.experiencia) / span;
    const clamped = Math.min(Math.max(prog, 0), 1);
    return { nivelActual: actual, siguienteNivel: siguiente, pct: Math.round(clamped * 100) };
  }, [experiencia]);

  const maxLevel = nivelActual.nombre === siguienteNivel.nombre;

  const frameGradient = isDark ? tokens.color.frameGradientDark : tokens.color.frameGradientLight;
  const badgeFrameGrad = isDark ? tokens.color.badgeFrameDark : tokens.color.badgeFrameLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textPercent = isDark ? tokens.color.textPercentDark : tokens.color.textPercentLight;

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.root}
        accessibilityRole="button"
        accessibilityLabel="Ver detalle de experiencia"
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.88 : 1 }}>
            <LinearGradient
              colors={frameGradient as any}
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
                {/* Insignia */}
                <View style={styles.badgeWrapper}>
                  <LinearGradient
                    colors={badgeFrameGrad as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badgeFrame}
                  >
                    <View
                      style={[
                        styles.badgeInner,
                        {
                          backgroundColor: isDark ? tokens.color.badgeBgDark : tokens.color.badgeBgLight,
                          borderColor: isDark ? tokens.color.badgeBorderDark : tokens.color.badgeBorderLight,
                          borderWidth: isDark ? 1 : 0,
                        },
                      ]}
                    >
                      <Image source={nivelActual.icono} resizeMode="contain" style={styles.badgeImage} />
                    </View>
                  </LinearGradient>

                  <View
                    style={[
                      styles.levelLabel,
                      {
                        backgroundColor: isDark ? tokens.color.labelBgDark : tokens.color.labelBgLight,
                        borderColor: isDark ? tokens.color.labelBorderDark : tokens.color.labelBorderLight,
                      },
                    ]}
                  >
                    <Text style={[styles.levelLabelText, { color: textPrimary }]}>
                      {nivelActual.nombre}
                    </Text>
                  </View>
                </View>

                {/* Info */}
                <View style={styles.infoCol}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoTitle, { color: textPrimary }]}>
                      Progreso de experiencia
                    </Text>
                    <Text style={[styles.infoPercent, { color: textPercent }]}>{pct}%</Text>
                  </View>

                  <View
                    style={[
                      styles.progressTrack,
                      {
                        backgroundColor: isDark ? tokens.color.trackBgDark : tokens.color.trackBgLight,
                        borderColor: isDark ? tokens.color.trackBorderDark : "transparent",
                        borderWidth: isDark ? 1 : 0,
                      },
                    ]}
                  >
                    <View style={[styles.progressFill, { width: `${pct}%` as any }]}>
                      <LinearGradient
                        colors={tokens.color.barGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressGradient}
                      />
                      <View
                        style={[
                          styles.progressDot,
                          { backgroundColor: tokens.color.barDot, borderColor: tokens.color.barDotBorder },
                        ]}
                      />
                    </View>
                  </View>

                  <Text style={[styles.infoFooter, { color: textSecondary }]}>
                    {maxLevel ? (
                      <Text style={{ color: textPrimary, fontWeight: "600" }}>
                        Nivel máximo alcanzado{" "}
                        <CheckCircle2 size={13} color={tokens.color.checkColor} strokeWidth={2.5} />
                      </Text>
                    ) : (
                      <>
                        {experiencia}
                        <Text style={{ color: isDark ? "#475569" : "#94A3B8" }}> / </Text>
                        {siguienteNivel.experiencia} exp para{" "}
                        <Text style={{ color: textPrimary, fontWeight: "600" }}>
                          {siguienteNivel.nombre}
                        </Text>
                      </>
                    )}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
      </Pressable>

      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        experiencia={experiencia}
        nivelActual={nivelActual}
        siguienteNivel={siguienteNivel}
        pct={pct}
        maxLevel={maxLevel}
        isDark={isDark}
      />
    </>
  );
}

// ── Estilos card ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 600, alignSelf: "center" },
  frame: { borderRadius: tokens.radius.lg, padding: 1.5 },
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  badgeWrapper: { position: "relative" },
  badgeFrame: { borderRadius: tokens.radius.md, padding: 2 },
  badgeInner: {
    width: 80, height: 80,
    borderRadius: tokens.radius.sm,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeImage: { width: 70, height: 70 },
  levelLabel: {
    position: "absolute",
    right: -6, bottom: -6,
    borderRadius: tokens.radius.full,
    paddingHorizontal: 6, paddingVertical: 3,
    borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  levelLabelText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  infoCol: { flex: 1, minWidth: 0, gap: tokens.spacing.sm },
  infoRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: tokens.spacing.sm,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 0.1 },
  infoPercent: { fontSize: 11, fontWeight: "700" },
  progressTrack: { height: 11, width: "100%", borderRadius: tokens.radius.full, overflow: "hidden" },
  progressFill: { height: "100%", position: "relative" },
  progressGradient: { height: "100%", width: "100%" },
  progressDot: {
    position: "absolute", right: -5, top: "50%", marginTop: -5,
    width: 10, height: 10, borderRadius: tokens.radius.full, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  infoFooter: { fontSize: 12, lineHeight: 17 },
});

// ── Estilos modal ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
  },
  headerGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 100,
    borderRadius: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 16, right: 16,
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Badge row
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    marginTop: 4,
  },
  badgeFrame: {
    borderRadius: 14,
    padding: 2,
  },
  badgeInner: {
    width: 68, height: 68,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeImage: { width: 58, height: 58 },
  badgeMeta: { flex: 1, gap: 4 },
  levelPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00E85A",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  xpBig: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  xpUnit: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Texto
  textBlock: { gap: 8, marginBottom: 20 },
  iconTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBubble: {
    width: 30, height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTitle: { fontSize: 15, fontWeight: "800", letterSpacing: 0.1, flex: 1 },
  feedbackMsg: { fontSize: 13, lineHeight: 20 },

  // Stats
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 16,
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "500", textAlign: "center" },
  statDivider: { width: 1, marginVertical: 2 },

  // Mini barra
  barWrap: { gap: 6 },
  barTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabelText: { fontSize: 10, fontWeight: "600" },
});