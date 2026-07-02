// src/shared/components/ui/AlertaConfirmacion.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

interface AlertaConfirmacionProps {
  visible: boolean;
  titulo?: string;
  mensaje: string;
  onCancelar: () => void;
  onConfirmar: () => void;
  loading?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
}

const AlertaConfirmacion: React.FC<AlertaConfirmacionProps> = ({
  visible,
  titulo = "¿Estás seguro?",
  mensaje,
  onCancelar,
  onConfirmar,
  loading = false,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onCancelar}>
        <View
          style={styles.overlay}
          accessibilityViewIsModal
          accessibilityLabel="Diálogo de confirmación"
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                  borderColor: t.border,
                },
              ]}
            >
              <View style={styles.content}>
                <Text style={[styles.title, { color: t.textPrimary }]}>
                  {titulo}
                </Text>

                <Text style={[styles.message, { color: t.textSecondary }]}>
                  {mensaje}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={onCancelar}
                    disabled={loading}
                    role="button"
                    accessibilityLabel="Cancelar"
                    style={({ pressed }) => [
                      styles.btnCancel,
                      {
                        backgroundColor: isDark ? t.border : t.surface,
                        borderColor: t.border,
                        opacity: pressed || loading ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.btnCancelText, { color: t.textPrimary }]}>
                      {textoCancelar}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={onConfirmar}
                    disabled={loading}
                    role="button"
                    accessibilityLabel="Confirmar"
                    style={({ pressed }) => [
                      styles.btnConfirm,
                      {
                        backgroundColor: Colors.accent,
                        opacity: pressed || loading ? 0.85 : 1,
                      },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.primary} />
                    ) : (
                      <Text style={styles.btnConfirmText}>{textoConfirmar}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AlertaConfirmacion;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.dark.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    maxWidth: 480,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    ...TextStyle.h3,
    fontFamily: Font.title.semiBold,
    textAlign: "center",
  },
  message: {
    ...TextStyle.body,
    fontFamily: Font.body.regular,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  btnCancelText: {
    ...TextStyle.body,
    fontFamily: Font.body.semiBold,
  },
  btnConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  btnConfirmText: {
    ...TextStyle.body,
    fontFamily: Font.body.bold,
    color: Colors.primary,
  },
});
