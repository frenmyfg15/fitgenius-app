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
  StyleSheet,
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
  lugar: { label: "Lugar de entrenamiento", values: ["CASA", "GIMNASIO"] },
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

/* ---------- Tokens UI minimalistas ---------- */
const tokens = {
  color: {
    pageBgDark: "#020617",
    pageBgLight: "#f9fafb",

    textPrimaryDark: "#e5e7eb",
    textPrimaryLight: "#0f172a",
    textSecondaryDark: "#9ca3af",
    textSecondaryLight: "#6b7280",
    placeholderDark: "#64748b",
    placeholderLight: "#94a3b8",

    inputBorderDark: "rgba(148,163,184,0.16)",
    inputBorderLight: "rgba(15,23,42,0.10)",

    chipBorderDark: "rgba(148,163,184,0.12)",
    chipBorderLight: "rgba(15,23,42,0.08)",

    chipBgDark: "#0f172a12",
    chipBgLight: "#f3f4f6",

    activeBg: "#22c55e",
    activeBgTrans: "#22c55e12",
    activeBorderTrans: "#22c55e40",
    activeText: "#15803d",

    purple: "#a855f7",
    purpleTrans: "#a855f712",
    purpleBorder: "#a855f740",

    cta: "#00ff66",
    ctaDisabled: "rgba(15,23,42,0.3)",
    ctaText: "#ffffff",

    equipIconBorderDark: "rgba(148,163,184,0.12)",
    equipIconBorderLight: "rgba(15,23,42,0.08)",
  },
  radius: { lg: 16, md: 12, sm: 8, xs: 6 } as const,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  } as const,
} as const;

/* ---------- Helpers UI ---------- */
function prettyLabel(v: string) {
  if (v === "MASCULINO") return "M";
  if (v === "FEMENINO") return "F";
  return v
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (s) => s.toUpperCase());
}

/* ---------- UI Components ---------- */
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

  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;

  return (
    <View
      style={[
        styles.section,
        {
          borderColor: isDark
            ? tokens.color.inputBorderDark
            : tokens.color.inputBorderLight,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
          {title}
        </Text>
        {!!description && (
          <Text style={[styles.sectionDesc, { color: textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  isDark,
  variant = "green",
  activeTextColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  variant?: "green" | "days" | "purple";
  activeTextColor?: string;
}) {
  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (active) {
    bgColor =
      variant === "purple"
        ? tokens.color.purpleTrans
        : variant === "days"
          ? tokens.color.activeBgTrans
          : tokens.color.activeBgTrans;
    borderColor =
      variant === "purple"
        ? tokens.color.purpleBorder
        : tokens.color.activeBorderTrans;
    textColor =
      activeTextColor ?? (variant === "days" ? tokens.color.activeText : "#15803d");
  } else {
    bgColor = isDark
      ? tokens.color.chipBgDark
      : tokens.color.chipBgLight;
    borderColor = isDark
      ? tokens.color.chipBorderDark
      : tokens.color.chipBorderLight;
    textColor = isDark
      ? tokens.color.textPrimaryDark
      : tokens.color.textPrimaryLight;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, { borderColor, backgroundColor: bgColor }]}
    >
      <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Pantalla edit-minimalista ---------- */
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

  const pageBg = isDark
    ? tokens.color.pageBgDark
    : tokens.color.pageBgLight;
  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;
  const placeholder = isDark
    ? tokens.color.placeholderDark
    : tokens.color.placeholderLight;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: pageBg }]}
      contentContainerStyle={[
        styles.pageContent,
        {
          paddingBottom:
            Platform.OS === "ios" ? 140 : 130,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: textPrimary }]}>
          Editar perfil
        </Text>
        <Text style={[styles.pageSubtitle, { color: textSecondary }]}>
          Ajusta tus preferencias para que tus planes se adapten mejor a ti.
        </Text>
      </View>

      <View style={styles.stack}>
        <Section title="Información general">
          <View style={styles.innerStack}>
            <View>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>
                Peso objetivo (kg)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(formData.pesoObjetivo ?? "")}
                onChangeText={(t) =>
                  handleText("pesoObjetivo", t.replace(",", "."))
                }
                placeholder="Ej: 70"
                placeholderTextColor={placeholder}
                style={[
                  styles.input,
                  {
                    color: textPrimary,
                    borderColor: isDark
                      ? tokens.color.inputBorderDark
                      : tokens.color.inputBorderLight,
                  },
                ]}
              />
            </View>

            <View style={styles.selectorsStack}>
              {Object.entries(optionsConfig).map(([key, cfg]) => {
                const k = key as OptionsConfigKey;
                const value = formData[k] as string;

                return (
                  <View key={k} style={styles.selectorBlock}>
                    <Text style={[styles.fieldLabel, { color: textPrimary }]}>
                      {cfg.label}
                    </Text>
                    <View style={styles.chipsRow}>
                      {cfg.values.map((v) => {
                        const active = value === v;
                        const variant: "green" | "purple" =
                          k === "objetivo" ? "purple" : "green";

                        return (
                          <Chip
                            key={v}
                            label={prettyLabel(v)}
                            active={active}
                            onPress={() => handleText(k, v)}
                            isDark={isDark}
                            variant={variant}
                            activeTextColor={
                              active
                                ? variant === "purple"
                                  ? textPrimary
                                  : undefined
                                : undefined
                            }
                          />
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Section>

        <Section
          title="Enfoques musculares"
          description="Elige las zonas que quieres priorizar."
        >
          <View style={styles.chipsRow}>
            {muscleFocusOptions.map((opt) => {
              const active = (formData.enfoque || []).includes(opt.id);
              return (
                <Chip
                  key={opt.id}
                  label={opt.name}
                  active={active}
                  onPress={() => toggleArrayValue("enfoque", opt.id)}
                  isDark={isDark}
                />
              );
            })}
          </View>
        </Section>

        <Section
          title="Días disponibles"
          description="Selecciona los días en los que puedes entrenar."
        >
          <View style={styles.chipsRow}>
            {daysOptions.map((d) => {
              const active = (formData.dias || []).includes(d.id);
              return (
                <Chip
                  key={d.id}
                  label={d.name}
                  active={active}
                  onPress={() => toggleArrayValue("dias", d.id)}
                  isDark={isDark}
                  variant="days"
                />
              );
            })}
          </View>
        </Section>

        {formData.lugar === "CASA" && (
          <Section
            title="Equipamiento en casa"
            description="Indica qué material tienes disponible."
          >
            <View style={styles.equipGrid}>
              {opcionesEquipamiento.map((item: EquipamientoOpcion) => {
                const active = (formData.equipamiento || []).includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleArrayValue("equipamiento", item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.equipCard,
                      {
                        borderColor: active
                          ? tokens.color.purpleBorder
                          : isDark
                            ? tokens.color.equipIconBorderDark
                            : tokens.color.equipIconBorderLight,
                        backgroundColor: isDark
                          ? tokens.color.chipBgDark
                          : tokens.color.chipBgLight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.equipIconBox,
                        {
                          borderColor: isDark
                            ? tokens.color.equipIconBorderDark
                            : tokens.color.equipIconBorderLight,
                        },
                      ]}
                    >
                      <Image
                        source={item.imagen}
                        resizeMode="contain"
                        style={styles.equipImage}
                      />
                    </View>
                    <Text style={[styles.equipLabel, { color: textPrimary }]}>
                      {item.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>
        )}

        <Section
          title="Limitaciones físicas"
          description="Marca cualquier limitación relevante."
        >
          <View style={styles.chipsRow}>
            {opcionesLimitaciones.map((item: LimitacionOpcion) => {
              const active = (formData.limitaciones || []).includes(item.id);
              return (
                <Chip
                  key={item.id}
                  label={item.nombre}
                  active={active}
                  onPress={() => toggleArrayValue("limitaciones", item.id)}
                  isDark={isDark}
                />
              );
            })}
          </View>
        </Section>
      </View>

      <View style={styles.ctaWrap}>
        <Pressable
          onPress={handleSubmit}
          disabled={!hayCambios || saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hayCambios || saving }}
          style={[
            styles.cta,
            {
              backgroundColor: !hayCambios || saving
                ? tokens.color.ctaDisabled
                : tokens.color.cta,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator color={tokens.color.ctaText} />
          ) : (
            <Text style={styles.ctaText}>Guardar cambios</Text>
          )}
        </Pressable>

        {hayCambios && (
          <Text style={[styles.ctaHint, { color: textSecondary }]}>
            Tienes cambios sin guardar.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
  },

  header: { marginBottom: tokens.spacing.lg },
  pageTitle: { fontSize: 20, fontWeight: "700" },
  pageSubtitle: { marginTop: 4, fontSize: 14 },

  stack: { gap: tokens.spacing.lg },

  section: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
  },
  sectionHeader: { marginBottom: tokens.spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionDesc: { marginTop: 4, fontSize: 12 },

  innerStack: { gap: tokens.spacing.lg },
  selectorsStack: { gap: tokens.spacing.lg },
  selectorBlock: { gap: tokens.spacing.sm },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },

  equipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  equipCard: {
    width: 108,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
    alignItems: "center",
  },
  equipIconBox: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.sm,
    overflow: "hidden",
  },
  equipImage: { width: 50, height: 50 },
  equipLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  ctaWrap: { marginTop: tokens.spacing.xl, alignItems: "center" },
  cta: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 220,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.ctaText,
  },
  ctaHint: { marginTop: 8, fontSize: 12 },
});
