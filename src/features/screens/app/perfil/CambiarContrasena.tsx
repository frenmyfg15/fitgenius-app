// src/features/fit/screens/CambiarContrasenaScreen.tsx
import React, { useState, useCallback } from "react";
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
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react-native";
import { cambiarContrasena } from "@/features/api/usuario.api";

/* ---------------- Validación ---------------- */

const schema = z
  .object({
    contrasenaActual: z.string().min(1, "La contraseña actual es requerida"),
    nuevaContrasena: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmar: z.string(),
  })
  .refine((d) => d.nuevaContrasena === d.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden",
  });

/* ---------------- Tokens ---------------- */

const tokens = {
  color: {
    pageBgDark: "#0b1220",
    pageBgLight: "#ffffff",

    frameGradient: ["#00E85A", "#A855F7"] as string[],

    cardBgDark: "#0f172a",
    cardBgLight: "#ffffff",

    cardBorderDark: "rgba(255,255,255,0.10)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    inputBgDark: "rgba(255,255,255,0.03)",
    inputBgLight: "#ffffff",

    inputBorderDark: "rgba(255,255,255,0.15)",
    inputBorderLight: "#e5e7eb",

    textPrimaryDark: "#e5e7eb",
    textPrimaryLight: "#0f172a",

    textSecondaryDark: "#94a3b8",
    textSecondaryLight: "#64748b",
  },
  radius: {
    lg: 16,
    pill: 999,
  },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 120,
  },
} as const;

/* ---------------- Screen ---------------- */

export default function CambiarContrasenaScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;

  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;

  const onSubmit = useCallback(async () => {
    const parsed = schema.safeParse({
      contrasenaActual: actual,
      nuevaContrasena: nueva,
      confirmar,
    });

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Datos inválidos";
      Toast.show({ type: "error", text1: "Error", text2: msg });
      return;
    }

    try {
      setCargando(true);
      await cambiarContrasena(actual, nueva);

      Toast.show({
        type: "success",
        text1: "Contraseña actualizada exitosamente",
      });

      setActual("");
      setNueva("");
      setConfirmar("");

      setTimeout(() => nav.navigate("Cuenta"), 400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al cambiar la contraseña";

      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setCargando(false);
    }
  }, [actual, nueva, confirmar, nav]);

  const Field = ({
    label,
    value,
    onChangeText,
    visible,
    toggle,
  }: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    visible: boolean;
    toggle: () => void;
  }) => (
    <View style={{ marginBottom: tokens.spacing.lg }}>
      <Text
        style={[
          styles.label,
          { color: textPrimary, marginBottom: 6 },
        ]}
      >
        {label}
      </Text>

      <View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          placeholderTextColor={textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: isDark
                ? tokens.color.inputBgDark
                : tokens.color.inputBgLight,
              borderColor: isDark
                ? tokens.color.inputBorderDark
                : tokens.color.inputBorderLight,
              color: textPrimary,
            },
          ]}
        />

        <Pressable
          onPress={toggle}
          style={styles.eye}
          accessibilityRole="button"
        >
          {visible ? (
            <EyeOff size={18} color={textSecondary} />
          ) : (
            <Eye size={18} color={textSecondary} />
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: isDark
            ? tokens.color.pageBgDark
            : tokens.color.pageBgLight,
        }}
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.md,
          paddingTop: tokens.spacing.xl,
          paddingBottom: tokens.spacing.tabBarSafe,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text style={[styles.title, { color: textPrimary }]}>
            Cambiar contraseña
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Actualiza tus credenciales de forma segura.
          </Text>
        </View>

        {/* Card */}
        <View style={{ maxWidth: 520, alignSelf: "center", width: "100%" }}>
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
                  backgroundColor: isDark
                    ? tokens.color.cardBgDark
                    : tokens.color.cardBgLight,
                  borderColor: isDark
                    ? tokens.color.cardBorderDark
                    : tokens.color.cardBorderLight,
                },
              ]}
            >
              <Field
                label="Contraseña actual"
                value={actual}
                onChangeText={setActual}
                visible={showActual}
                toggle={() => setShowActual((v) => !v)}
              />

              <Field
                label="Nueva contraseña"
                value={nueva}
                onChangeText={setNueva}
                visible={showNueva}
                toggle={() => setShowNueva((v) => !v)}
              />

              <Field
                label="Confirmar nueva contraseña"
                value={confirmar}
                onChangeText={setConfirmar}
                visible={showConfirmar}
                toggle={() => setShowConfirmar((v) => !v)}
              />

              <LinearGradient
                colors={tokens.color.frameGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 1, borderRadius: tokens.radius.pill }}
              >
                <Pressable
                  onPress={onSubmit}
                  disabled={cargando}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isDark
                        ? "#0f172a"
                        : "#ffffff",
                      opacity: cargando ? 0.6 : 1,
                    },
                  ]}
                >
                  {cargando ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{ color: textPrimary, fontWeight: "600" }}>
                      Cambiar contraseña
                    </Text>
                  )}
                </Pressable>
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  frame: {
    borderRadius: 16,
    padding: 1,
    overflow: "hidden",
  },
  card: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 44,
    fontSize: 14,
  },
  eye: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  button: {
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 14,
  },
});
