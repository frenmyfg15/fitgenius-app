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
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react-native";
import { cambiarContrasena } from "@/features/api/usuario.api";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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

const TAB_BAR_SAFE = Platform.OS === "ios" ? 140 : 120;

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

  const t = scheme(isDark);
  const bg = isDark ? Colors.primary : Colors.secondary;

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
    onChangeText: (v: string) => void;
    visible: boolean;
    toggle: () => void;
  }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={[styles.label, { color: t.textPrimary, marginBottom: 6 }]}>
        {label}
      </Text>

      <View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          placeholderTextColor={t.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
              borderColor: isDark ? t.borderStrong : t.border,
              color: t.textPrimary,
            },
          ]}
        />

        <Pressable onPress={toggle} style={styles.eye} accessibilityRole="button">
          {visible ? (
            <EyeOff size={18} color={t.textSecondary} />
          ) : (
            <Eye size={18} color={t.textSecondary} />
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: bg }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 32,
            paddingBottom: TAB_BAR_SAFE,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.title, { color: t.textPrimary }]}>
              Cambiar contraseña
            </Text>
            <Text style={[styles.subtitle, { color: t.textSecondary }]}>
              Actualiza tus credenciales de forma segura.
            </Text>
          </View>

          {/* Card */}
          <View style={{ maxWidth: 520, alignSelf: "center", width: "100%" }}>
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
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

              <Pressable
                onPress={onSubmit}
                disabled={cargando}
                style={[
                  styles.button,
                  {
                    backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
                    opacity: cargando ? 0.6 : 1,
                  },
                ]}
              >
                {cargando ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={[styles.buttonText, { color: t.textPrimary }]}>
                    Cambiar contraseña
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 24,
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: Font.title.bold,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Font.body.regular,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 44,
    fontSize: 14,
    fontFamily: Font.body.regular,
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
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: "center",
    paddingVertical: 14,
  },
  buttonText: {
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
});
