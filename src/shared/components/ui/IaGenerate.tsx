// File: src/shared/components/ui/IaGenerate.tsx
import React from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Asterisk, Sparkles, Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import CargaRutina from "./CargaRutina";
import { useIaGenerate } from "@/shared/hooks/useIaGenerate";
import NoAdsModal from "@/shared/components/ads/NoAdsModal";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const CARD_BG_DARK = ["rgba(15,24,41,0.92)", "rgba(8,13,23,0.96)", "rgba(15,24,41,0.92)"] as const;

const HELPERS = {
  lugarCasa: ["casa", "hogar", "home", "en casa"],
};
const esCasa = (lugar?: string) =>
  !!lugar && HELPERS.lugarCasa.some((l) => lugar.toLowerCase().includes(l));

type Props = { onCreate?: () => void };

export default function IaGenerate({ onCreate }: Props) {
  const navigation = useNavigation<any>();
  const usuario = useUsuarioStore((s) => s.usuario);

  const {
    loading, showModal, nombre, instruccion,
    maxNombre, maxInstr, nombreLen, instrLen,
    isDark, lockedByPlan,
    abrirModal, cerrarModal, crear,
    handleChangeNombre, handleChangeInstruccion,
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

  const t = scheme(isDark);

  return (
    <>
      {/* Botón trigger */}
      {isDark ? (
        <LinearGradient
          colors={CARD_BG_DARK as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.triggerShell, { borderColor: Colors.accentBorder }]}
        >
          <TriggerContent loading={loading} lockedByPlan={lockedByPlan} isDark={isDark} onPress={handlePressMain} />
        </LinearGradient>
      ) : (
        <View style={[styles.triggerShell, { backgroundColor: Colors.secondary, borderColor: Colors.accentBorder }]}>
          <TriggerContent loading={loading} lockedByPlan={lockedByPlan} isDark={isDark} onPress={handlePressMain} />
        </View>
      )}

      {/* Modal configuración */}
      <Modal visible={showModal} animationType="fade" transparent onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex1}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={cerrarModal}
            style={[styles.modalBackdrop, { backgroundColor: t.overlay }]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.modalContainer}>
              {isDark ? (
                <LinearGradient
                  colors={CARD_BG_DARK as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.modalShell, { borderColor: Colors.accentBorder }]}
                >
                  <ModalInner
                    isDark={isDark}
                    nombre={nombre} nombreLen={nombreLen} maxNombre={maxNombre}
                    instruccion={instruccion} instrLen={instrLen} maxInstr={maxInstr}
                    lugarEntrenamiento={usuario?.lugarEntrenamiento}
                    crear={crear} cerrarModal={cerrarModal} loading={loading}
                    handleChangeNombre={handleChangeNombre}
                    handleChangeInstruccion={handleChangeInstruccion}
                  />
                </LinearGradient>
              ) : (
                <View style={[styles.modalShell, { backgroundColor: Colors.secondary, borderColor: Colors.accentBorder }]}>
                  <ModalInner
                    isDark={isDark}
                    nombre={nombre} nombreLen={nombreLen} maxNombre={maxNombre}
                    instruccion={instruccion} instrLen={instrLen} maxInstr={maxInstr}
                    lugarEntrenamiento={usuario?.lugarEntrenamiento}
                    crear={crear} cerrarModal={cerrarModal} loading={loading}
                    handleChangeNombre={handleChangeNombre}
                    handleChangeInstruccion={handleChangeInstruccion}
                  />
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Spinner generación */}
      {loading && (
        <Modal visible={loading} transparent animationType="fade">
          <CargaRutina />
        </Modal>
      )}

      {/* Modal sin anuncios */}
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

function TriggerContent({
  loading, lockedByPlan, isDark, onPress,
}: {
  loading: boolean;
  lockedByPlan: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const t = scheme(isDark);
  const lockColor = isDark ? "#FACC15" : "#D97706";

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
      {lockedByPlan && <Lock size={14} color={lockColor} strokeWidth={2.2} />}
      <Sparkles size={14} color={isDark ? "#fff" : t.textPrimary} strokeWidth={2} />
      <Text style={[styles.triggerText, { color: t.textPrimary }]}>
        {lockedByPlan ? "Desbloquear IA" : "Generar con IA"}
      </Text>
    </TouchableOpacity>
  );
}

type ModalInnerProps = {
  isDark: boolean;
  nombre: string;
  nombreLen: number;
  maxNombre: number;
  instruccion: string;
  instrLen: number;
  maxInstr: number;
  lugarEntrenamiento?: string;
  crear: () => Promise<void> | void;
  cerrarModal: () => void;
  loading: boolean;
  handleChangeNombre: (t: string) => void;
  handleChangeInstruccion: (t: string) => void;
};

function ModalInner({
  isDark, nombre, nombreLen, maxNombre,
  instruccion, instrLen, maxInstr,
  lugarEntrenamiento,
  crear, cerrarModal, loading,
  handleChangeNombre, handleChangeInstruccion,
}: ModalInnerProps) {
  const t = scheme(isDark);
  const inputBg = isDark ? Colors.dark.surfaceAlt : t.surface;
  const canSubmit = !!nombre.trim();

  return (
    <View style={styles.modalContent}>

      {/* Header */}
      <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
        <View style={styles.modalHeaderText}>
          <Text style={[styles.modalTitle, { color: t.textPrimary }]} accessibilityRole="header">
            Configura tu rutina con IA
          </Text>
          <Text style={[styles.modalSubtitle, { color: t.textSecondary }]}>
            Dale un nombre e instrucciones opcionales.
          </Text>
          <Text style={[styles.infoText, { color: t.textSecondary, marginTop: 6 }]}>
            Se priorizarán ejercicios de {esCasa(lugarEntrenamiento) ? "casa" : "gym"} · Cámbialo en tu perfil
          </Text>
        </View>

        <TouchableOpacity
          onPress={cerrarModal}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={[
            styles.closeBtn,
            { backgroundColor: isDark ? t.border : t.surface, borderColor: t.border },
          ]}
        >
          <Text style={[styles.closeBtnText, { color: t.textPrimary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.modalBody}
        contentContainerStyle={styles.modalBodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: t.textPrimary }]}>Nombre de la rutina</Text>
            <Asterisk size={10} color="#EF4444" strokeWidth={2.5} accessibilityLabel="Obligatorio" />
          </View>
          <TextInput
            value={nombre}
            onChangeText={handleChangeNombre}
            placeholder="Ej: Push/Pull/Legs"
            placeholderTextColor={t.textTertiary}
            editable={!loading}
            maxLength={maxNombre}
            accessibilityLabel="Nombre de la rutina"
            style={[styles.input, { backgroundColor: inputBg, borderColor: t.border, color: t.textPrimary }]}
          />
          <Text style={[styles.counter, { color: t.textSecondary, textAlign: "right" }]}>
            {nombreLen}/{maxNombre}
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: t.textPrimary }]}>
            Instrucciones{" "}
            <Text style={{ color: t.textSecondary, fontWeight: "400" }}>(opcional)</Text>
          </Text>
          <TextInput
            value={instruccion}
            onChangeText={handleChangeInstruccion}
            placeholder="Días, material, objetivos…"
            placeholderTextColor={t.textTertiary}
            multiline
            textAlignVertical="top"
            editable={!loading}
            maxLength={maxInstr}
            accessibilityLabel="Instrucciones para la IA"
            style={[styles.inputMultiline, { backgroundColor: inputBg, borderColor: t.border, color: t.textPrimary }]}
          />
          <Text style={[styles.counter, { color: t.textSecondary, textAlign: "right" }]}>
            {instrLen}/{maxInstr}
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.modalFooter, { borderTopColor: t.border }]}>
        <View style={styles.footerActions}>
          <TouchableOpacity
            onPress={cerrarModal}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            style={[
              styles.cancelBtn,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
                opacity: loading ? 0.55 : 1,
              },
            ]}
          >
            <Text style={[styles.cancelBtnText, { color: t.textPrimary }]}>Cancelar</Text>
          </TouchableOpacity>

          {canSubmit ? (
            <TouchableOpacity
              onPress={crear}
              disabled={loading}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={loading ? "Generando rutina" : "Confirmar y generar"}
              accessibilityState={{ disabled: loading, busy: loading }}
              style={[styles.submitWrap, { opacity: loading ? 0.82 : 1 }]}
            >
              <LinearGradient
                colors={GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Sparkles size={14} color="#fff" strokeWidth={2.2} />
                <Text style={styles.submitText}>
                  {loading ? "Generando…" : "Confirmar y generar"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.submitDisabled,
                {
                  backgroundColor: isDark ? t.border : t.surface,
                  borderColor: t.border,
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Sparkles size={14} color={t.textDisabled} strokeWidth={2.2} />
              <Text style={[styles.submitText, { color: t.textDisabled }]}>
                Confirmar y generar
              </Text>
            </View>
          )}
        </View>

        {!canSubmit && (
          <Text style={[styles.footerHint, { color: t.textSecondary }]}>
            Pon un nombre para habilitar el botón.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  triggerShell: {
    borderRadius: 999,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  triggerText: { fontSize: 13, fontWeight: "700", fontFamily: Font.body.bold, letterSpacing: 0.1 },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: { width: "100%", maxWidth: 640, flexShrink: 1 },
  modalShell: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    flexShrink: 1,
  },
  modalContent: { overflow: "hidden", flexShrink: 1 },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalHeaderText: { flex: 1, marginRight: 16, gap: 2 },
  modalTitle: { fontSize: 16, fontWeight: "800", fontFamily: Font.body.bold, letterSpacing: -0.3 },
  modalSubtitle: { fontSize: 12, fontFamily: Font.body.regular, lineHeight: 17 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 13, fontWeight: "600", fontFamily: Font.body.semiBold },

  modalBody: { flexShrink: 1 },
  modalBodyContent: { paddingHorizontal: 24, paddingVertical: 16, gap: 16 },

  fieldGroup: { gap: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontSize: 12, fontWeight: "600", fontFamily: Font.body.semiBold },
  infoText: { fontSize: 11, fontFamily: Font.body.regular, lineHeight: 16 },
  input: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13,
    fontFamily: Font.body.regular,
  },
  inputMultiline: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13,
    fontFamily: Font.body.regular,
    minHeight: 100,
  },
  counter: { fontSize: 11, fontFamily: Font.body.regular },

  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600", fontFamily: Font.body.semiBold },

  submitWrap: { borderRadius: 12, overflow: "hidden" },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  submitText: { fontSize: 13, fontWeight: "800", fontFamily: Font.body.bold, color: "#fff", letterSpacing: 0.1 },
  submitDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerHint: { fontSize: 11, fontFamily: Font.body.regular, textAlign: "right" },
});
