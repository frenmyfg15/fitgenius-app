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

/* ---------- Tokens UI ---------- */
const tokens = {
  color: {
    pageBgDark: "#030712",
    pageBgLight: "#f8fafc",

    cardBgDark: "#0c1424",
    cardBgLight: "#ffffff",

    textPrimaryDark: "#e2e8f0",
    textPrimaryLight: "#0f172a",
    textSecondaryDark: "#64748b",
    textSecondaryLight: "#94a3b8",
    placeholderDark: "#475569",
    placeholderLight: "#94a3b8",

    inputBorderDark: "rgba(148,163,184,0.10)",
    inputBorderLight: "rgba(15,23,42,0.08)",
    inputBgDark: "rgba(15,23,42,0.6)",
    inputBgLight: "#f1f5f9",

    chipBorderDark: "rgba(148,163,184,0.10)",
    chipBorderLight: "rgba(15,23,42,0.07)",
    chipBgDark: "rgba(15,23,42,0.5)",
    chipBgLight: "#f1f5f9",

    // Verde — días y selecciones estándar
    activeBg: "#22c55e",
    activeBgTrans: "rgba(34,197,94,0.08)",
    activeBorderTrans: "rgba(34,197,94,0.35)",
    activeText: "#16a34a",
    activeTextDark: "#4ade80",

    // Púrpura — objetivo
    purple: "#a855f7",
    purpleTrans: "rgba(168,85,247,0.08)",
    purpleBorder: "rgba(168,85,247,0.35)",
    purpleText: "#a855f7",

    // Equipamiento seleccionado — azul eléctrico
    equipActiveBorder: "rgba(99,102,241,0.5)",
    equipActiveBg: "rgba(99,102,241,0.07)",

    // NINGUNO seleccionado — ámbar
    ningunoActiveBorder: "rgba(245,158,11,0.45)",
    ningunoActiveBg: "rgba(245,158,11,0.07)",
    ningunoActiveText: "#d97706",

    cta: "#22c55e",
    ctaDisabled: "rgba(148,163,184,0.15)",
    ctaText: "#ffffff",

    dividerDark: "rgba(148,163,184,0.07)",
    dividerLight: "rgba(15,23,42,0.06)",
  },
  radius: { xl: 20, lg: 16, md: 12, sm: 8, xs: 6 } as const,
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const,
} as const;

/* ---------- Helpers ---------- */
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

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: isDark
            ? tokens.color.cardBgDark
            : tokens.color.cardBgLight,
          borderColor: isDark
            ? tokens.color.inputBorderDark
            : tokens.color.inputBorderLight,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark
                ? tokens.color.textPrimaryDark
                : tokens.color.textPrimaryLight,
            },
          ]}
        >
          {title}
        </Text>
        {!!description && (
          <Text
            style={[
              styles.sectionDesc,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.sectionDivider,
          {
            backgroundColor: isDark
              ? tokens.color.dividerDark
              : tokens.color.dividerLight,
          },
        ]}
      />
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
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  variant?: "green" | "days" | "purple";
}) {
  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (active) {
    if (variant === "purple") {
      bgColor = tokens.color.purpleTrans;
      borderColor = tokens.color.purpleBorder;
      textColor = tokens.color.purpleText;
    } else {
      bgColor = tokens.color.activeBgTrans;
      borderColor = tokens.color.activeBorderTrans;
      textColor = isDark
        ? tokens.color.activeTextDark
        : tokens.color.activeText;
    }
  } else {
    bgColor = isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight;
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

/* ---------- EquipCard ---------- */
function EquipCard({
  item,
  active,
  onPress,
  isDark,
}: {
  item: EquipamientoOpcion;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  const isNinguno = item.id === "NINGUNO";

  const borderColor = active
    ? isNinguno
      ? tokens.color.ningunoActiveBorder
      : tokens.color.equipActiveBorder
    : isDark
      ? tokens.color.chipBorderDark
      : tokens.color.chipBorderLight;

  const bgColor = active
    ? isNinguno
      ? tokens.color.ningunoActiveBg
      : tokens.color.equipActiveBg
    : isDark
      ? tokens.color.chipBgDark
      : tokens.color.chipBgLight;

  const labelColor = active
    ? isNinguno
      ? tokens.color.ningunoActiveText
      : isDark
        ? "#818cf8"
        : "#4f46e5"
    : isDark
      ? tokens.color.textPrimaryDark
      : tokens.color.textPrimaryLight;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.equipCard,
        { borderColor, backgroundColor: bgColor },
      ]}
    >
      <View
        style={[
          styles.equipIconBox,
          {
            borderColor: isDark
              ? tokens.color.inputBorderDark
              : tokens.color.inputBorderLight,
          },
        ]}
      >
        <Image
          source={item.imagen}
          resizeMode="contain"
          style={styles.equipImage}
        />
      </View>
      <Text style={[styles.equipLabel, { color: labelColor }]}>
        {item.nombre}
      </Text>
    </Pressable>
  );
}

/* ---------- Pantalla principal ---------- */
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

  const pageBg = isDark ? tokens.color.pageBgDark : tokens.color.pageBgLight;
  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;
  const placeholder = isDark
    ? tokens.color.placeholderDark
    : tokens.color.placeholderLight;

  // ── Lógica NINGUNO exclusivo ─────────────────────────────────────────────
  const handleEquipamientoToggle = (id: string) => {
    const current: string[] = formData.equipamiento || [];

    if (id === "NINGUNO") {
      // Seleccionar NINGUNO → limpiar todo y dejar solo NINGUNO
      // Si ya estaba seleccionado → deseleccionar
      const yaActivo = current.includes("NINGUNO");
      handleText("equipamiento", yaActivo ? [] : ["NINGUNO"]);
      return;
    }

    // Seleccionar otro equipo → quitar NINGUNO si estaba
    const sinNinguno = current.filter((x) => x !== "NINGUNO");
    const yaActivo = sinNinguno.includes(id);
    const siguiente = yaActivo
      ? sinNinguno.filter((x) => x !== id)
      : [...sinNinguno, id];

    handleText("equipamiento", siguiente);
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: pageBg }]}
      contentContainerStyle={[
        styles.pageContent,
        { paddingBottom: Platform.OS === "ios" ? 140 : 130 },
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
              <Text style={[styles.fieldLabel, { color: textSecondary }]}>
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
                    backgroundColor: isDark
                      ? tokens.color.inputBgDark
                      : tokens.color.inputBgLight,
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
                    <Text style={[styles.fieldLabel, { color: textSecondary }]}>
                      {cfg.label}
                    </Text>
                    <View style={styles.chipsRow}>
                      {cfg.values.map((v) => (
                        <Chip
                          key={v}
                          label={prettyLabel(v)}
                          active={value === v}
                          onPress={() => handleText(k, v)}
                          isDark={isDark}
                          variant={k === "objetivo" ? "purple" : "green"}
                        />
                      ))}
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
                  <EquipCard
                    key={item.id}
                    item={item}
                    active={active}
                    onPress={() => handleEquipamientoToggle(item.id)}
                    isDark={isDark}
                  />
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
              backgroundColor:
                !hayCambios || saving
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
    paddingTop: tokens.spacing.xl,
  },

  header: { marginBottom: tokens.spacing.xl },
  pageTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 5, fontSize: 13, lineHeight: 19 },

  stack: { gap: tokens.spacing.md },

  section: {
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
    marginBottom: 0,
    borderWidth: 1,
  },
  sectionHeader: { marginBottom: tokens.spacing.sm },
  sectionTitle: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2 },
  sectionDesc: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  sectionDivider: {
    height: 1,
    marginBottom: tokens.spacing.md,
  },

  innerStack: { gap: tokens.spacing.lg },
  selectorsStack: { gap: tokens.spacing.lg },
  selectorBlock: { gap: 6 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  input: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    borderWidth: 1,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
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
    width: 100,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.sm,
    alignItems: "center",
  },
  equipIconBox: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.sm,
    overflow: "hidden",
  },
  equipImage: { width: 46, height: 46 },
  equipLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.1,
  },

  ctaWrap: { marginTop: tokens.spacing.xl, alignItems: "center" },
  cta: {
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 220,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.color.ctaText,
    letterSpacing: 0.2,
  },
  ctaHint: { marginTop: 8, fontSize: 12 },
});