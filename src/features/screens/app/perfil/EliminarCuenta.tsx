// src/features/fit/screens/EliminarCuentaScreen.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";
import { ShieldAlert, Trash2 } from "lucide-react-native";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { eliminarCuentaUsuario } from "@/features/api/usuario.api";

const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    pageBgDark: "#0B1220",
    pageBgLight: "#FFFFFF",

    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "rgba(255,255,255,0.98)",
    cardBorderDark: "rgba(255,255,255,0.10)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    textPrimaryDark: "#E5E7EB",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#64748B",

    inputBgDark: "rgba(255,255,255,0.03)",
    inputBgLight: "#FFFFFF",
    inputBorderDark: "rgba(255,255,255,0.15)",
    inputBorderLight: "#E5E7EB",
    placeholderDark: "#64748B",
    placeholderLight: "#94A3B8",

    dangerIconBgDark: "rgba(239,68,68,0.14)",
    dangerIconBgLight: "#FEE2E2",

    dangerBgDark: "rgba(239,68,68,0.12)",
    dangerBgLight: "#FEF2F2",
    dangerBorderDark: "rgba(239,68,68,0.35)",
    dangerBorderLight: "#FECACA",
    dangerTextDark: "#FCA5A5",
    dangerTextLight: "#B91C1C",

    redSolid: "#DC2626",

    linkDark: "#CBD5E1",
    linkLight: "#334155",
  },
  radius: { lg: 16, md: 12, pill: 999 },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
} as const;

export default function EliminarCuenta() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();
  const { setUsuario } = useUsuarioStore();

  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);

  const matchText = "eliminar mi cuenta";
  const canSubmit = confirmacion.trim().toLowerCase() === matchText;

  const ui = useMemo(
    () => ({
      pageBg: isDark ? tokens.color.pageBgDark : tokens.color.pageBgLight,
      textPrimary: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight,
      textSecondary: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight,
      cardBg: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
      cardBorder: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
      inputBg: isDark ? tokens.color.inputBgDark : tokens.color.inputBgLight,
      inputBorder: isDark ? tokens.color.inputBorderDark : tokens.color.inputBorderLight,
      placeholder: isDark ? tokens.color.placeholderDark : tokens.color.placeholderLight,
      dangerIconBg: isDark ? tokens.color.dangerIconBgDark : tokens.color.dangerIconBgLight,
      dangerBg: isDark ? tokens.color.dangerBgDark : tokens.color.dangerBgLight,
      dangerBorder: isDark ? tokens.color.dangerBorderDark : tokens.color.dangerBorderLight,
      dangerText: isDark ? tokens.color.dangerTextDark : tokens.color.dangerTextLight,
      link: isDark ? tokens.color.linkDark : tokens.color.linkLight,
    }),
    [isDark]
  );

  const handleEliminar = useCallback(async () => {
    if (!canSubmit) {
      Toast.show({
        type: "error",
        text1: 'Escribe exactamente: "Eliminar mi cuenta".',
      });
      return;
    }

    try {
      setCargando(true);
      Toast.show({ type: "info", text1: "Eliminando tu cuenta…" });

      await eliminarCuentaUsuario();

      Toast.show({
        type: "success",
        text1: "Cuenta eliminada correctamente.",
      });

      setUsuario(null);
      nav.reset({
        index: 0,
        routes: [{ name: "Inicio" }],
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar la cuenta. Inténtalo de nuevo.";
      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setCargando(false);
    }
  }, [canSubmit, nav, setUsuario]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView
        style={[styles.page, { backgroundColor: ui.pageBg }]}
        contentContainerStyle={[
          styles.pageContent,
          { paddingBottom: tokens.spacing.tabBarSafe },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrap}>
          <LinearGradient
            colors={tokens.color.frameGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.frame}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: ui.cardBg,
                  borderColor: ui.cardBorder,
                },
              ]}
            >
              <View style={styles.hero}>
                <View
                  style={[
                    styles.heroIcon,
                    { backgroundColor: ui.dangerIconBg, borderColor: ui.dangerBorder },
                  ]}
                >
                  <ShieldAlert size={28} color={ui.dangerText} />
                </View>

                <Text style={[styles.heroTitle, { color: ui.textPrimary }]}>
                  Eliminar tu cuenta
                </Text>

                <Text style={[styles.heroSubtitle, { color: ui.textSecondary }]}>
                  Esta acción es <Text style={{ fontWeight: "700" }}>irreversible</Text>. Se
                  eliminarán tus datos, progreso y configuración de forma permanente.
                </Text>
              </View>

              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[
                  styles.alert,
                  {
                    backgroundColor: ui.dangerBg,
                    borderColor: ui.dangerBorder,
                  },
                ]}
              >
                <ShieldAlert size={20} color={ui.dangerText} />
                <Text style={[styles.alertText, { color: ui.dangerText }]}>
                  <Text style={{ fontWeight: "800" }}>Advertencia crítica:</Text> confirma que
                  comprendes las consecuencias antes de continuar.
                </Text>
              </View>

              <View style={styles.form}>
                <View>
                  <Text style={[styles.label, { color: ui.textPrimary }]}>
                    Para confirmar, escribe{" "}
                    <Text style={{ color: ui.dangerText, fontWeight: "800" }}>
                      Eliminar mi cuenta
                    </Text>
                  </Text>

                  <TextInput
                    value={confirmacion}
                    onChangeText={setConfirmacion}
                    placeholder="Eliminar mi cuenta"
                    placeholderTextColor={ui.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        backgroundColor: ui.inputBg,
                        borderColor: ui.inputBorder,
                        color: ui.textPrimary,
                      },
                    ]}
                    accessibilityLabel="Confirmación de eliminación"
                    accessibilityHint='Escribe: "Eliminar mi cuenta"'
                  />

                  <Text style={[styles.help, { color: ui.textSecondary }]}>
                    Debe coincidir exactamente (mayúsculas/minúsculas no importan).
                  </Text>
                </View>

                <Pressable
                  onPress={handleEliminar}
                  disabled={cargando}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: cargando }}
                  style={[
                    styles.dangerBtn,
                    { backgroundColor: tokens.color.redSolid, opacity: cargando ? 0.75 : 1 },
                  ]}
                >
                  <Trash2 size={18} color="#fff" />
                  {cargando ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.dangerBtnText}>Eliminando…</Text>
                    </>
                  ) : (
                    <Text style={styles.dangerBtnText}>Eliminar cuenta permanentemente</Text>
                  )}
                </Pressable>

                <Text style={[styles.footerNote, { color: ui.textSecondary }]}>
                  Si tienes dudas, puedes{" "}
                  <Text
                    onPress={() => nav.navigate("Configuracion")}
                    style={{ textDecorationLine: "underline", color: ui.link }}
                  >
                    revisar tu configuración
                  </Text>{" "}
                  antes de eliminar.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  page: { flex: 1 },
  pageContent: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.xl,
    flexGrow: 1,
  },

  centerWrap: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1,
    overflow: "hidden",
  },

  card: {
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },

  hero: { alignItems: "center" },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  alert: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  alertText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  form: { gap: 14 },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  help: { marginTop: 6, fontSize: 11 },

  dangerBtn: {
    marginTop: 4,
    borderRadius: tokens.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  dangerBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  footerNote: {
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
