// File: src/shared/components/ui/IaGenerate.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Asterisk, Sparkles, Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import CargaRutina from "./CargaRutina";
import { useIaGenerate } from "@/shared/hooks/useIaGenerate";
import NoAdsModal from "@/shared/components/ads/NoAdsModal";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDarkA: "rgba(15,24,41,0.92)",
    cardBgDarkB: "rgba(8,13,23,0.96)",
    borderDark: "rgba(255,255,255,0.07)",
    borderLight: "rgba(0,0,0,0.06)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#475569",

    inputBgDark: "rgba(255,255,255,0.05)",
    inputBgLight: "#F8FAFC",

    chipBgDark: "rgba(255,255,255,0.05)",
    chipBgLight: "#F1F5F9",

    // Botón ghost (Cancelar)
    ghostBgDark: "rgba(255,255,255,0.04)",
    ghostBgLight: "rgba(2,6,23,0.03)",
    ghostBorderDark: "rgba(255,255,255,0.09)",
    ghostBorderLight: "rgba(2,6,23,0.08)",

    // Lock icon
    lockDark: "#FACC15",
    lockLight: "#D97706",

    overlay: "rgba(0,0,0,0.55)",
    errorRed: "#EF4444",
  },
  radius: { md: 12, lg: 16, xl: 20, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Props = { onCreate?: () => void };

// ── Componente principal ─────────────────────────────────────────────────────
export default function IaGenerate({ onCreate }: Props) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const navigation = useNavigation<any>();
  const {
    loading, showModal, nombre, instruccion,
    maxNombre, maxInstr, nombreLen, instrLen,
    suggestionChips, isDark, lockedByPlan,
    abrirModal, cerrarModal, crear,
    handleChangeNombre, handleChangeInstruccion, setInstruccion,
    noAdsModalVisible, setNoAdsModalVisible,
    noAdsRetrying, reintentarAnuncioIa,
  } = useIaGenerate(onCreate);

  const handlePressMain = () => {
    if (lockedByPlan) {
      navigation.navigate("Perfil", { screen: "PremiumPayment" });
      return;
    }
    abrirModal();
  };
  // ── Fin lógica original ───────────────────────────────────────────────────

  return (
    <>
      {/* ── Botón trigger principal ──────────────────────────────────────── */}
      <LinearGradient
        colors={GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.triggerGradient}
      >
        {isDark ? (
          <LinearGradient
            colors={[tokens.color.cardBgDarkA, tokens.color.cardBgDarkB, tokens.color.cardBgDarkA]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.triggerInner, { borderColor: tokens.color.borderDark }]}
          >
            <TriggerContent
              loading={loading}
              lockedByPlan={lockedByPlan}
              isDark={isDark}
              onPress={handlePressMain}
            />
          </LinearGradient>
        ) : (
          <View style={[styles.triggerInner, { backgroundColor: "#ffffff", borderColor: tokens.color.borderLight }]}>
            <TriggerContent
              loading={loading}
              lockedByPlan={lockedByPlan}
              isDark={isDark}
              onPress={handlePressMain}
            />
          </View>
        )}
      </LinearGradient>

      {/* ── Modal configuración IA ───────────────────────────────────────── */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex1}
        >
          {/* Toca fuera para cerrar */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={cerrarModal}
            style={[styles.modalBackdrop, { backgroundColor: tokens.color.overlay }]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContainer}
            >
              <LinearGradient
                colors={GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                {isDark ? (
                  <LinearGradient
                    colors={[tokens.color.cardBgDarkA, tokens.color.cardBgDarkB, tokens.color.cardBgDarkA]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.modalInnerShell, { borderColor: tokens.color.borderDark }]}
                  >
                    <ModalInner {...modalInnerProps({ isDark, nombre, nombreLen, maxNombre, instruccion, instrLen, maxInstr, suggestionChips, crear, cerrarModal, loading, handleChangeNombre, handleChangeInstruccion, setInstruccion })} />
                  </LinearGradient>
                ) : (
                  <View style={[styles.modalInnerShell, { backgroundColor: "#ffffff", borderColor: tokens.color.borderLight }]}>
                    <ModalInner {...modalInnerProps({ isDark, nombre, nombreLen, maxNombre, instruccion, instrLen, maxInstr, suggestionChips, crear, cerrarModal, loading, handleChangeNombre, handleChangeInstruccion, setInstruccion })} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Spinner de generación ─────────────────────────────────────────── */}
      {loading && (
        <Modal visible={loading} transparent animationType="fade">
          <CargaRutina />
        </Modal>
      )}

      {/* ── Modal no hay anuncios ─────────────────────────────────────────── */}
      <NoAdsModal
        visible={noAdsModalVisible}
        loading={noAdsRetrying}
        onRetry={reintentarAnuncioIa}
        onGoPremium={() => {
          setNoAdsModalVisible(false);
          navigation.navigate("Perfil", { screen: "PremiumPayment" });
        }}
        onClose={() => setNoAdsModalVisible(false)}
      />
    </>
  );
}

// ── Helper: evita repetir props en el bloque isDark/!isDark del modal ─────────
function modalInnerProps(p: ModalInnerProps) { return p; }

// ── Sub-componente: contenido del botón trigger ───────────────────────────────
function TriggerContent({
  loading, lockedByPlan, isDark, onPress,
}: {
  loading: boolean;
  lockedByPlan: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const textColor = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const lockColor = isDark ? tokens.color.lockDark : tokens.color.lockLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={lockedByPlan ? "Desbloquear generación con IA" : "Generar rutina con IA"}
      accessibilityState={{ disabled: loading }}
      style={styles.triggerBtn}
    >
      {lockedByPlan && (
        <Lock size={15} color={lockColor} strokeWidth={2.2} />
      )}
      <Sparkles size={15} color={isDark ? "#fff" : tokens.color.textPrimaryLight} strokeWidth={2} />
      <Text style={[styles.triggerText, { color: textColor }]}>
        {lockedByPlan ? "Desbloquear IA" : "Generar con IA"}
      </Text>
    </TouchableOpacity>
  );
}

// ── Sub-componente: interior del modal ───────────────────────────────────────
type ModalInnerProps = {
  isDark: boolean;
  nombre: string;
  nombreLen: number;
  maxNombre: number;
  instruccion: string;
  instrLen: number;
  maxInstr: number;
  suggestionChips: string[];
  crear: () => Promise<void> | void;
  cerrarModal: () => void;
  loading: boolean;
  handleChangeNombre: (t: string) => void;
  handleChangeInstruccion: (t: string) => void;
  setInstruccion: (updater: string | ((prev: string) => string)) => void;
};

function ModalInner({
  isDark, nombre, nombreLen, maxNombre,
  instruccion, instrLen, maxInstr,
  suggestionChips, crear, cerrarModal, loading,
  handleChangeNombre, handleChangeInstruccion, setInstruccion,
}: ModalInnerProps) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const border = isDark ? tokens.color.borderDark : tokens.color.borderLight;
  const inputBg = isDark ? tokens.color.inputBgDark : tokens.color.inputBgLight;
  const canSubmit = !!nombre.trim();

  return (
    <View style={styles.modalContent}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.modalHeader, { borderBottomColor: border }]}>
        <View style={styles.modalHeaderText}>
          <Text style={[styles.modalTitle, { color: textPrimary }]} accessibilityRole="header">
            Configura tu rutina con IA
          </Text>
          <Text style={[styles.modalSubtitle, { color: textSecondary }]}>
            Dale un nombre y añade instrucciones para personalizarla.
          </Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity
          onPress={cerrarModal}
          accessibilityRole="button"
          accessibilityLabel="Cerrar modal"
          style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", borderColor: border }]}
        >
          <Text style={[styles.closeBtnText, { color: textPrimary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.modalBody}
        contentContainerStyle={styles.modalBodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Campo: nombre */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: textPrimary }]}>
              Nombre de la rutina
            </Text>
            <Asterisk
              size={11}
              color={tokens.color.errorRed}
              strokeWidth={2.5}
              accessibilityLabel="Campo obligatorio"
            />
          </View>

          <TextInput
            value={nombre}
            onChangeText={handleChangeNombre}
            placeholder="Ej: Push/Pull/Legs 8 semanas"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            editable={!loading}
            maxLength={maxNombre}
            accessibilityLabel="Nombre de la rutina"
            style={[
              styles.input,
              { backgroundColor: inputBg, borderColor: border, color: textPrimary },
            ]}
          />

          <View style={styles.inputMeta}>
            <Text style={[styles.inputHint, { color: textSecondary }]}>
              Tu rutina se llamará{" "}
              <Text style={{ color: textPrimary, fontWeight: "600" }}>
                {nombre || "—"}
              </Text>
            </Text>
            <Text style={[styles.counter, { color: textSecondary }]}>
              {nombreLen}/{maxNombre}
            </Text>
          </View>
        </View>

        {/* Campo: instrucciones */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: textPrimary }]}>
            Instrucciones para la IA{" "}
            <Text style={{ color: textSecondary, fontWeight: "400" }}>(opcional)</Text>
          </Text>

          <TextInput
            value={instruccion}
            onChangeText={handleChangeInstruccion}
            placeholder="Cuéntanos días, material, objetivos…"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            multiline
            textAlignVertical="top"
            editable={!loading}
            maxLength={maxInstr}
            accessibilityLabel="Instrucciones para la IA"
            style={[
              styles.inputMultiline,
              { backgroundColor: inputBg, borderColor: border, color: textPrimary },
            ]}
          />

          <View style={styles.inputMeta}>
            <Text style={[styles.inputHint, { color: textSecondary, flex: 1, marginRight: tokens.spacing.sm }]}>
              Cuanta más info des (días, material, objetivos), mejor.
            </Text>
            <Text style={[styles.counter, { color: textSecondary }]}>
              {instrLen}/{maxInstr}
            </Text>
          </View>
        </View>

        {/* Chips de sugerencia */}
        <View style={styles.chipsRow}>
          {suggestionChips.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() =>
                setInstruccion((prev) =>
                  prev ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${s}` : s
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Añadir sugerencia: ${s}`}
              style={[
                styles.chip,
                { backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight, borderColor: border },
              ]}
            >
              <Text style={[styles.chipText, { color: textPrimary }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <View style={[styles.modalFooter, { borderTopColor: border }]}>
        <View style={styles.footerActions}>

          {/* Cancelar (ghost) */}
          <TouchableOpacity
            onPress={cerrarModal}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            style={[
              styles.cancelBtn,
              {
                backgroundColor: isDark ? tokens.color.ghostBgDark : tokens.color.ghostBgLight,
                borderColor: isDark ? tokens.color.ghostBorderDark : tokens.color.ghostBorderLight,
                opacity: loading ? 0.55 : 1,
              },
            ]}
          >
            <Text style={[styles.cancelBtnText, { color: textPrimary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          {/* Confirmar y generar (primary) */}
          {canSubmit ? (
            // Habilitado: borde gradiente
            <TouchableOpacity
              onPress={crear}
              disabled={loading}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={loading ? "Generando rutina" : "Confirmar y generar rutina"}
              accessibilityState={{ disabled: loading, busy: loading }}
              style={[styles.submitShadow, { opacity: loading ? 0.82 : 1 }]}
            >
              <LinearGradient
                colors={GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Sparkles size={15} color="#fff" strokeWidth={2.2} />
                <Text style={styles.submitText}>
                  {loading ? "Generando…" : "Confirmar y generar"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            // Deshabilitado: apariencia neutra, sin gradiente
            // FIX original: color tenía typo "3fffrgba(...)" — corregido
            <View
              style={[
                styles.submitDisabled,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.06)",
                  borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(2,6,23,0.09)",
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Sparkles
                size={15}
                color={isDark ? "rgba(241,245,249,0.35)" : "rgba(15,23,42,0.35)"}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.submitText,
                  { color: isDark ? "rgba(241,245,249,0.35)" : "rgba(15,23,42,0.35)" },
                ]}
              >
                Confirmar y generar
              </Text>
            </View>
          )}
        </View>

        {/* Hint: activa el botón poniendo un nombre */}
        {!canSubmit && (
          <Text style={[styles.footerHint, { color: textSecondary }]}>
            Pon un nombre para habilitar el botón.
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Estilos estáticos ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex1: { flex: 1 },

  // Trigger (botón externo)
  triggerGradient: {
    borderRadius: tokens.radius.full,
    padding: 1.5,
    overflow: "hidden",
  },
  triggerInner: {
    borderRadius: tokens.radius.full - 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 11,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Modal backdrop + posicionamiento
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.md,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 640,
  },
  modalGradient: {
    borderRadius: tokens.radius.xl,
    padding: 1.5,
    overflow: "hidden",
  },
  modalInnerShell: {
    borderRadius: tokens.radius.xl - 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  modalContent: {
    overflow: "hidden",
  },

  // Header
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalHeaderText: {
    flex: 1,
    marginRight: tokens.spacing.md,
    gap: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Body scroll
  modalBody: { maxHeight: 420 },
  modalBodyContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.md,
  },

  // Fields
  fieldGroup: { gap: tokens.spacing.xs },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    fontSize: 14,
  },
  inputMultiline: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 120,
  },
  inputMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputHint: { fontSize: 11, flex: 1, marginRight: tokens.spacing.sm },
  counter: { fontSize: 11 },

  // Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "500" },

  // Footer
  modalFooter: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: tokens.spacing.sm,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacing.sm,
  },

  // Cancelar
  cancelBtn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 11,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },

  // Submit habilitado
  submitShadow: {
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 12,
    borderRadius: tokens.radius.md,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.1,
  },

  // Submit deshabilitado
  submitDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 12,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },

  // Hint footer
  footerHint: {
    fontSize: 11,
    textAlign: "right",
  },
});