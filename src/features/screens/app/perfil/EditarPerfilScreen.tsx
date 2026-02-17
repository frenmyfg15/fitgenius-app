// src/features/fit/screens/app/perfil/EditarPerfil.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";

import { equipamiento as opcionesEquipamiento } from "../../../../shared/constants/register/equipamiento";
import { limitaciones as opcionesLimitaciones } from "../../../../shared/constants/register/limitaciones";
import { useEditarPerfil } from "@/shared/hooks/useEditarPerfil";

/* ---------- Tipos locales ---------- */
interface EquipamientoOpcion {
  id: string;
  nombre: string;
  imagen: ImageSourcePropType;
}

interface LimitacionOpcion {
  id: string;
  nombre: string;
}
type OptionsConfigKey =
  | "sexo"
  | "nivel"
  | "actividad"
  | "objetivo"
  | "duracion"
  | "lugar";

const optionsConfig: Record<
  OptionsConfigKey,
  { label: string; values: string[] }
> = {
  sexo: { label: "Sexo", values: ["MASCULINO", "FEMENINO"] },
  nivel: {
    label: "Nivel de experiencia",
    values: ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"],
  },
  actividad: {
    label: "Actividad diaria",
    values: [
      "SEDENTARIO",
      "LIGERAMENTE_ACTIVO",
      "MODERADAMENTE_ACTIVO",
      "MUY_ACTIVO",
    ],
  },
  objetivo: {
    label: "Objetivo principal",
    values: [
      "PERDIDA_GRASA",
      "GANANCIA_MUSCULAR",
      "TONIFICAR_FORMA",
      "MATENER_FORMA",
    ],
  },
  duracion: {
    label: "Duración de sesión",
    values: [
      "TREINTA_MINUTOS",
      "CUARENTA_Y_CINCO_MINUTOS",
      "SESENTA_MINUTOS",
      "NOVENTA_MINUTOS",
      "CIENTO_VEINTE_MINUTOS",
      "CIENTO_CINCUENTA_MINUTOS",
      "CIENTO_OCHENTA_MINUTOS",
    ],
  },
  lugar: {
    label: "Lugar de entrenamiento",
    values: ["CASA", "GIMNASIO"],
  },
};

const daysOptions = [
  { id: "LUNES", name: "Lunes" },
  { id: "MARTES", name: "Martes" },
  { id: "MIERCOLES", name: "Miércoles" },
  { id: "JUEVES", name: "Jueves" },
  { id: "VIERNES", name: "Viernes" },
  { id: "SABADO", name: "Sábado" },
  { id: "DOMINGO", name: "Domingo" },
];

const muscleFocusOptions = [
  { id: "PECHOS", name: "Pecho" },
  { id: "ESPALDA", name: "Espalda" },
  { id: "PIERNAS", name: "Piernas" },
  { id: "CORE", name: "Core" },
  { id: "BRAZOS", name: "Brazos" },
];

/* ---------- Helpers UI ---------- */
function prettyLabel(v: string) {
  if (v === "MASCULINO") return "M";
  if (v === "FEMENINO") return "F";
  return v
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (s) => s.toUpperCase());
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="rounded-2xl p-5"
      style={{
        backgroundColor: isDark ? "#020617" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "rgba(148,163,184,0.35)" : "#e5e7eb",
      }}
    >
      <View className="mb-3">
        <Text
          className="text-base font-semibold"
          style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
        >
          {title}
        </Text>
        {!!description && (
          <Text
            className="mt-1 text-xs"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

/* ---------- Pantalla ---------- */
export default function EditarPerfil() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    formData,
    handleText,
    toggleArrayValue,
    hayCambios,
    saving,
    handleSubmit,
  } = useEditarPerfil();

  return (
    <ScrollView
      className={`flex-1 px-4 pt-4 ${isDark ? "bg-[#020617]" : "bg-[#f9fafb]"
        }`}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 140 : 120 }}
    >
      {/* Header */}
      <View className="mb-5">
        <Text
          className={`text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"
            }`}
        >
          Editar perfil
        </Text>
        <Text
          className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"
            }`}
        >
          Ajusta tus preferencias para que tus planes se adapten mejor a ti.
        </Text>
      </View>

      <View className="gap-5">
        {/* Información General */}
        <Section title="Información general">
          <View className="gap-5">
            {/* Peso objetivo */}
            <View>
              <Text
                className="text-xs font-medium mb-1"
                style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
              >
                Peso objetivo (kg)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(formData.pesoObjetivo ?? "")}
                onChangeText={(t) =>
                  handleText("pesoObjetivo", t.replace(",", "."))
                }
                placeholder="Ej: 70"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className="rounded-xl px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: isDark ? "#020617" : "#ffffff",
                  color: isDark ? "#e5e7eb" : "#0f172a",
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(148,163,184,0.35)"
                    : "#e5e7eb",
                }}
              />
            </View>

            {/* Selectores (chips) */}
            <View className="gap-5">
              {Object.entries(optionsConfig).map(([key, cfg]) => {
                const k = key as OptionsConfigKey;
                const value = formData[k] as string;
                return (
                  <View key={k} className="gap-2">
                    <Text
                      className="text-xs font-medium"
                      style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
                    >
                      {cfg.label}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {cfg.values.map((v) => {
                        const active = value === v;
                        return (
                          <Pressable
                            key={v}
                            onPress={() => handleText(k, v)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            className="px-3 py-1.5 rounded-full"
                            style={{
                              borderWidth: 1,
                              borderColor: active
                                ? "#22c55e"
                                : isDark
                                  ? "rgba(148,163,184,0.35)"
                                  : "#e5e7eb",
                              backgroundColor: active
                                ? isDark
                                  ? "rgba(34,197,94,0.15)"
                                  : "#dcfce7"
                                : isDark
                                  ? "#020617"
                                  : "#ffffff",
                            }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{
                                color: active
                                  ? isDark
                                    ? "#bbf7d0"
                                    : "#166534"
                                  : isDark
                                    ? "#e5e7eb"
                                    : "#0f172a",
                              }}
                            >
                              {prettyLabel(v)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Section>

        {/* Enfoques musculares */}
        <Section
          title="Enfoques musculares"
          description="Elige las zonas que quieres priorizar."
        >
          <View className="flex-row flex-wrap gap-2">
            {muscleFocusOptions.map((opt) => {
              const active = (formData.enfoque || []).includes(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => toggleArrayValue("enfoque", opt.id)}
                  accessibilityRole="button"
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    borderWidth: 1,
                    borderColor: active
                      ? "#22c55e"
                      : isDark
                        ? "rgba(148,163,184,0.35)"
                        : "#e5e7eb",
                    backgroundColor: active
                      ? isDark
                        ? "rgba(34,197,94,0.15)"
                        : "#dcfce7"
                      : isDark
                        ? "#020617"
                        : "#ffffff",
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
                  >
                    {opt.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Días disponibles */}
        <Section
          title="Días disponibles"
          description="Selecciona los días en los que puedes entrenar."
        >
          <View className="flex-row flex-wrap gap-2">
            {daysOptions.map((d) => {
              const active = (formData.dias || []).includes(d.id);
              return (
                <Pressable
                  key={d.id}
                  onPress={() => toggleArrayValue("dias", d.id)}
                  accessibilityRole="button"
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    borderWidth: 1,
                    borderColor: active
                      ? "#22c55e"
                      : isDark
                        ? "rgba(148,163,184,0.35)"
                        : "#e5e7eb",
                    backgroundColor: active
                      ? isDark
                        ? "#22c55e33"
                        : "#16a34a"
                      : isDark
                        ? "#020617"
                        : "#ffffff",
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{
                      color: active
                        ? "#ffffff"
                        : isDark
                          ? "#e5e7eb"
                          : "#0f172a",
                    }}
                  >
                    {d.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Equipamiento (solo si CASA) */}
        {formData.lugar === "CASA" && (
          <Section
            title="Equipamiento en casa"
            description="Indica qué material tienes disponible."
          >
            <View className="flex-row flex-wrap gap-3">
              {opcionesEquipamiento.map((item: EquipamientoOpcion) => {
                const active = (formData.equipamiento || []).includes(
                  item.id
                );
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      toggleArrayValue("equipamiento", item.id)
                    }
                    accessibilityRole="button"
                    className="items-center p-3 rounded-xl"
                    style={{
                      width: 108,
                      borderWidth: 1,
                      borderColor: active
                        ? "#a855f7"
                        : isDark
                          ? "rgba(148,163,184,0.35)"
                          : "#e5e7eb",
                      backgroundColor: isDark ? "#020617" : "#ffffff",
                    }}
                  >
                    <View
                      className="items-center justify-center mb-2 rounded-lg overflow-hidden"
                      style={{
                        width: 56,
                        height: 56,
                        borderWidth: 1,
                        borderColor: isDark
                          ? "rgba(148,163,184,0.35)"
                          : "#e5e7eb",
                        backgroundColor: isDark
                          ? "#020617"
                          : "#f9fafb",
                      }}
                    >
                      <Image
                        source={item.imagen}
                        resizeMode="contain"
                        style={{ width: 50, height: 50 }}
                      />

                    </View>
                    <Text
                      className="text-[11px] font-medium text-center"
                      style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
                    >
                      {item.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>
        )}

        {/* Limitaciones físicas */}
        <Section
          title="Limitaciones físicas"
          description="Marca cualquier limitación relevante."
        >
          <View className="flex-row flex-wrap gap-2">
            {opcionesLimitaciones.map((item: LimitacionOpcion) => {
              const active = (formData.limitaciones || []).includes(
                item.id
              );
              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    toggleArrayValue("limitaciones", item.id)
                  }
                  accessibilityRole="button"
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    borderWidth: 1,
                    borderColor: active
                      ? "#22c55e"
                      : isDark
                        ? "rgba(148,163,184,0.35)"
                        : "#e5e7eb",
                    backgroundColor: active
                      ? isDark
                        ? "rgba(34,197,94,0.15)"
                        : "#dcfce7"
                      : isDark
                        ? "#020617"
                        : "#ffffff",
                  }}
                >
                  <Text
                    className="text-xs font-medium text-center"
                    style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
                  >
                    {item.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>
      </View>

      {/* CTA Guardar */}
      <View className="mt-6 items-center">
        <Pressable
          onPress={handleSubmit}
          disabled={!hayCambios || saving}
          className="px-8 py-2.5 rounded-full items-center justify-center"
          accessibilityRole="button"
          accessibilityState={{ disabled: !hayCambios || saving }}
          style={{
            backgroundColor: !hayCambios || saving ? "#6b7280" : "#22c55e",
          }}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-sm font-semibold text-white">
              Guardar cambios
            </Text>
          )}
        </Pressable>

        {hayCambios && (
          <Text
            className="mt-2 text-xs"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Tienes cambios sin guardar.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
