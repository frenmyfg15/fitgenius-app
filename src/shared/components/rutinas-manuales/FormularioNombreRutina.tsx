// src/shared/components/rutina/FormularioNombreRutina.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { z } from "zod";

type Props = {
  onCancel: () => void;
  onConfirm: (nombre: string, descripcion?: string) => void;
  nombreInicial?: string;
  descripcionInicial?: string;
  /** ⬇️ actualizaciones en tiempo real (opcionales) */
  onNombreInput?: (v: string) => void;
  onDescripcionInput?: (v: string) => void;
};

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

export default function FormularioNombreRutina({
  onCancel,
  onConfirm,
  nombreInicial = "",
  descripcionInicial = "",
  onNombreInput,
  onDescripcionInput,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // UI tokens (coherentes con tus cards)
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "rgba(20,28,44,0.85)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb";

  const [nombre, setNombre] = useState(nombreInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [errors, setErrors] = useState<{ nombre?: string; descripcion?: string }>({});

  useEffect(() => {
    setNombre(nombreInicial);
    setDescripcion(descripcionInicial);
  }, [nombreInicial, descripcionInicial]);

  const confirmar = () => {
    const parsed = schema.safeParse({ nombre, descripcion });
    if (!parsed.success) {
      const fieldErrs: { nombre?: string; descripcion?: string } = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as "nombre" | "descripcion";
        if (!fieldErrs[k]) fieldErrs[k] = i.message;
      });
      setErrors(fieldErrs);
      return;
    }
    setErrors({});
    onConfirm(parsed.data.nombre.trim(), parsed.data.descripcion?.trim() || undefined);
  };

  const nombreHasError = !!errors.nombre;
  const descripcionHasError = !!errors.descripcion;

  return (
    <View
      style={{
        position: "absolute",
        inset: 0 as any,
        backgroundColor: "rgba(0,0,0,0.40)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 40
      }}
      accessibilityViewIsModal
      accessibilityLabel="Guardar rutina"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Marco degradado */}
        <LinearGradient
          colors={marcoGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 1 }}
        >
          {/* Panel interior */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
              padding: 18,
              position: "relative",
            }}
          >
            {/* Cerrar */}
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                height: 32,
                width: 32,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(148,163,184,0.18)" : "#f1f5f9",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
              }}
            >
              <X size={18} color={textSecondary} />
            </Pressable>

            {/* Título */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "800",
                color: textPrimary,
                marginBottom: 14,
              }}
            >
              Guardar Rutina
            </Text>

            <View style={{ gap: 14 }}>
              {/* Nombre */}
              <View>
                <Text
                  style={{ color: textPrimary, fontWeight: "600", fontSize: 14, marginBottom: 6 }}
                >
                  Nombre de la rutina
                </Text>
                <TextInput
                  value={nombre}
                  onChangeText={(v) => {
                    setNombre(v);
                    onNombreInput?.(v);
                    if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
                  }}
                  placeholder="Ej. Push/Pull Legs"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    borderWidth: 1,
                    borderColor: nombreHasError ? "#ef4444" : inputBorder,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Nombre de la rutina"
                />
                {nombreHasError ? (
                  <Text style={{ marginTop: 4, fontSize: 11, color: "#ef4444" }}>
                    {errors.nombre}
                  </Text>
                ) : null}
              </View>

              {/* Descripción */}
              <View>
                <Text
                  style={{ color: textPrimary, fontWeight: "600", fontSize: 14, marginBottom: 6 }}
                >
                  Descripción (opcional)
                </Text>
                <TextInput
                  value={descripcion}
                  onChangeText={(v) => {
                    setDescripcion(v);
                    onDescripcionInput?.(v);
                    if (errors.descripcion) setErrors((p) => ({ ...p, descripcion: undefined }));
                  }}
                  placeholder="Describe brevemente el objetivo de esta rutina..."
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    borderWidth: 1,
                    borderColor: descripcionHasError ? "#ef4444" : inputBorder,
                    fontSize: 14,
                    minHeight: 90,
                    textAlignVertical: "top",
                  }}
                  accessibilityLabel="Descripción de la rutina"
                />
                {descripcionHasError ? (
                  <Text style={{ marginTop: 4, fontSize: 11, color: "#ef4444" }}>
                    {errors.descripcion}
                  </Text>
                ) : null}
              </View>

              {/* Botones */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <Pressable
                  onPress={onCancel}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: isDark ? "rgba(148,163,184,0.15)" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                  }}
                >
                  <Text style={{ color: textSecondary, fontWeight: "700" }}>Cancelar</Text>
                </Pressable>

                <LinearGradient
                  colors={marcoGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 999, padding: 1 }}
                >
                  <Pressable
                    onPress={confirmar}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    }}
                  >
                    <Text style={{ color: textPrimary, fontWeight: "800" }}>Confirmar</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
}
