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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { CheckCircle2, X, Zap, Flame, Trophy, Target } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const BAR_GRADIENT = ["#8BFF62", "#39FF14", "#A855F7"] as const;

type Nivel = { nombre: string; experiencia: number; icono: ImageSourcePropType };

const NIVELES: Nivel[] = [
  { nombre: "Bronce",   experiencia: 0,     icono: require("../../../../assets/fit/cuenta/bronce.webp") },
  { nombre: "Plata",    experiencia: 500,   icono: require("../../../../assets/fit/cuenta/plata.webp") },
  { nombre: "Oro",      experiencia: 1500,  icono: require("../../../../assets/fit/cuenta/oro.webp") },
  { nombre: "Platino",  experiencia: 3000,  icono: require("../../../../assets/fit/cuenta/platino.webp") },
  { nombre: "Diamante", experiencia: 5000,  icono: require("../../../../assets/fit/cuenta/diamante.webp") },
  { nombre: "Maestro",  experiencia: 8000,  icono: require("../../../../assets/fit/cuenta/maestro.webp") },
  { nombre: "Élite",    experiencia: 12000, icono: require("../../../../assets/fit/cuenta/elite.webp") },
];

const XP_POR_EJERCICIO = 1.25;

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

  const t = scheme(isDark);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
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

  const IconComponent =
    feedback.icon === "trophy" ? Trophy :
      feedback.icon === "flame" ? Flame :
        feedback.icon === "zap" ? Zap : Target;

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
                  backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                  borderColor: t.border,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Header gradiente superior decorativo */}
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
                  { backgroundColor: isDark ? t.border : t.surface },
                ]}
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
              >
                <X size={15} color={t.textTertiary} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Insignia + nivel */}
              <View style={modalStyles.badgeRow}>
                <View style={modalStyles.badgeFrame}>
                  <View style={[
                    modalStyles.badgeInner,
                    { backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary },
                  ]}>
                    <Image
                      source={nivelActual.icono}
                      resizeMode="contain"
                      style={modalStyles.badgeImage}
                    />
                  </View>
                </View>

                <View style={modalStyles.badgeMeta}>
                  <View style={[modalStyles.levelPill, { backgroundColor: Colors.accentSubtle }]}>
                    <Text style={modalStyles.levelPillText}>{nivelActual.nombre}</Text>
                  </View>
                  <Text style={[modalStyles.xpBig, { color: t.textPrimary }]}>
                    {experiencia.toLocaleString("es-ES")}
                    <Text style={[modalStyles.xpUnit, { color: t.textSecondary }]}> XP</Text>
                  </Text>
                </View>
              </View>

              {/* Título + mensaje */}
              <View style={modalStyles.textBlock}>
                <View style={modalStyles.iconTitleRow}>
                  <View style={[modalStyles.iconBubble, { backgroundColor: Colors.accentSubtle }]}>
                    <IconComponent size={16} color={Colors.accent} strokeWidth={2.2} />
                  </View>
                  <Text style={[modalStyles.feedbackTitle, { color: t.textPrimary }]}>
                    {feedback.titulo}
                  </Text>
                </View>
                <Text style={[modalStyles.feedbackMsg, { color: t.textSecondary }]}>
                  {feedback.mensaje}
                </Text>
              </View>

              {/* Stats row */}
              <View style={[
                modalStyles.statsRow,
                { borderColor: isDark ? t.border : t.surface },
              ]}>
                <View style={modalStyles.statItem}>
                  <Text style={[modalStyles.statValue, { color: t.textPrimary }]}>
                    {ejercicios}
                  </Text>
                  <Text style={[modalStyles.statLabel, { color: t.textSecondary }]}>
                    ejercicios
                  </Text>
                </View>

                <View style={[modalStyles.statDivider, { backgroundColor: isDark ? t.border : t.surface }]} />

                <View style={modalStyles.statItem}>
                  <Text style={[modalStyles.statValue, { color: t.textPrimary }]}>
                    {pct}%
                  </Text>
                  <Text style={[modalStyles.statLabel, { color: t.textSecondary }]}>
                    progreso
                  </Text>
                </View>

                <View style={[modalStyles.statDivider, { backgroundColor: isDark ? t.border : t.surface }]} />

                <View style={modalStyles.statItem}>
                  {maxLevel ? (
                    <>
                      <CheckCircle2 size={20} color={Colors.accent} strokeWidth={2.2} />
                      <Text style={[modalStyles.statLabel, { color: t.textSecondary }]}>
                        máximo
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[modalStyles.statValue, { color: t.textPrimary }]}>
                        {xpRestante.toLocaleString("es-ES")}
                      </Text>
                      <Text style={[modalStyles.statLabel, { color: t.textSecondary }]}>
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
                  { backgroundColor: isDark ? t.border : t.surface },
                ]}>
                  <View style={[modalStyles.barFill, { width: `${pct}%` as any }]}>
                    <LinearGradient
                      colors={BAR_GRADIENT as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </View>
                </View>
                <View style={modalStyles.barLabels}>
                  <Text style={[modalStyles.barLabelText, { color: t.textSecondary }]}>
                    {nivelActual.nombre}
                  </Text>
                  {!maxLevel && (
                    <Text style={[modalStyles.barLabelText, { color: t.textSecondary }]}>
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

export default function Experiencia() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const t = scheme(isDark);

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
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
              ]}
            >
              {/* Insignia */}
              <View style={styles.badgeWrapper}>
                <View style={styles.badgeFrame}>
                  <View
                    style={[
                      styles.badgeInner,
                      { backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary },
                    ]}
                  >
                    <Image source={nivelActual.icono} resizeMode="contain" style={styles.badgeImage} />
                  </View>
                </View>

                <View
                  style={[
                    styles.levelLabel,
                    {
                      backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Text style={[styles.levelLabelText, { color: t.textPrimary }]}>
                    {nivelActual.nombre}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoTitle, { color: t.textPrimary }]}>
                    Progreso de experiencia
                  </Text>
                  <Text style={[styles.infoPercent, { color: t.textTertiary }]}>{pct}%</Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    {
                      backgroundColor: isDark ? t.border : t.surface,
                      borderColor: isDark ? t.border : "transparent",
                      borderWidth: isDark ? 1 : 0,
                    },
                  ]}
                >
                  <View style={[styles.progressFill, { width: `${pct}%` as any }]}>
                    <LinearGradient
                      colors={BAR_GRADIENT as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressGradient}
                    />
                    <View
                      style={[
                        styles.progressDot,
                        { backgroundColor: "#FFFFFF", borderColor: "rgba(0,0,0,0.12)" },
                      ]}
                    />
                  </View>
                </View>

                <Text style={[styles.infoFooter, { color: t.textSecondary }]}>
                  {maxLevel ? (
                    <Text style={{ color: t.textPrimary, fontWeight: "600", fontFamily: Font.body.semiBold }}>
                      Nivel máximo alcanzado{" "}
                      <CheckCircle2 size={13} color={Colors.accent} strokeWidth={2.5} />
                    </Text>
                  ) : (
                    <>
                      {experiencia}
                      <Text style={{ color: t.textTertiary }}> / </Text>
                      {siguienteNivel.experiencia} exp para{" "}
                      <Text style={{ color: t.textPrimary, fontWeight: "600", fontFamily: Font.body.semiBold }}>
                        {siguienteNivel.nombre}
                      </Text>
                    </>
                  )}
                </Text>
              </View>
            </View>
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

const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 600, alignSelf: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  badgeWrapper: { position: "relative" },
  badgeFrame: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accentBorder,
    padding: 1,
  },
  badgeInner: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeImage: { width: 70, height: 70 },
  levelLabel: {
    position: "absolute",
    right: -6,
    bottom: -6,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
  },
  levelLabelText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.3,
  },
  infoCol: { flex: 1, minWidth: 0, gap: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", fontFamily: Font.body.bold, letterSpacing: 0.1 },
  infoPercent: { fontSize: 11, fontWeight: "700", fontFamily: Font.body.bold },
  progressTrack: { height: 11, width: "100%", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", position: "relative" },
  progressGradient: { height: "100%", width: "100%" },
  progressDot: {
    position: "absolute",
    right: -5,
    top: "50%",
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  infoFooter: { fontSize: 12, fontFamily: Font.body.regular, lineHeight: 17 },
});

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
  },
  headerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderRadius: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    marginTop: 4,
  },
  badgeFrame: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.accentBorder,
    padding: 1,
  },
  badgeInner: {
    width: 68,
    height: 68,
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
    fontFamily: Font.body.bold,
    color: Colors.accent,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  xpBig: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: Font.title.bold,
    letterSpacing: -0.5,
  },
  xpUnit: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  textBlock: { gap: 8, marginBottom: 20 },
  iconTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Font.body.bold,
    letterSpacing: 0.1,
    flex: 1,
  },
  feedbackMsg: { fontSize: 13, fontFamily: Font.body.regular, lineHeight: 20 },
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
  statValue: { fontSize: 18, fontWeight: "800", fontFamily: Font.title.bold },
  statLabel: { fontSize: 10, fontWeight: "500", fontFamily: Font.body.medium, textAlign: "center" },
  statDivider: { width: 1, marginVertical: 2 },
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
  barLabelText: { fontSize: 10, fontWeight: "600", fontFamily: Font.body.semiBold },
});
