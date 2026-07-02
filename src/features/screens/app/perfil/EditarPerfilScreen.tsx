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
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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

// paleta semántica del formulario — colores de estado intencionales
const FORM = {
  green: "#22C55E",
  greenTrans: "rgba(34,197,94,0.08)",
  greenBorder: "rgba(34,197,94,0.35)",
  greenText: "#16A34A",
  greenTextDark: "#4ADE80",
  equipBorder: "rgba(99,102,241,0.50)",
  equipBg: "rgba(99,102,241,0.07)",
  ningunoText: "#D97706",
  ninguno: "rgba(245,158,11,0.07)",
  ningunoBorder: "rgba(245,158,11,0.45)",
} as const;

const PAGE_BG_DARK = "#030712";

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
  const t = scheme(isDark);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
          borderColor: t.border,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>
          {title}
        </Text>
        {!!description && (
          <Text style={[styles.sectionDesc, { color: t.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <View style={[styles.sectionDivider, { backgroundColor: t.border }]} />
      {children}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  const t = scheme(isDark);

  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (active) {
    bgColor = FORM.greenTrans;
    borderColor = FORM.greenBorder;
    textColor = isDark ? FORM.greenTextDark : FORM.greenText;
  } else {
    bgColor = isDark ? t.border : t.surface;
    borderColor = t.border;
    textColor = t.textPrimary;
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
  const t = scheme(isDark);
  const isNinguno = item.id === "NINGUNO";

  const borderColor = active
    ? isNinguno
      ? FORM.ningunoBorder
      : FORM.equipBorder
    : t.border;

  const bgColor = active
    ? isNinguno
      ? FORM.ninguno
      : FORM.equipBg
    : isDark
      ? t.border
      : t.surface;

  const labelColor = active
    ? isNinguno
      ? FORM.ningunoText
      : isDark
        ? "#818CF8"
        : "#4F46E5"
    : t.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.equipCard, { borderColor, backgroundColor: bgColor }]}
    >
      <View style={[styles.equipIconBox, { borderColor: t.border }]}>
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
  const t = scheme(isDark);

  const {
    formData,
    handleText,
    toggleArrayValue,
    hayCambios,
    saving,
    handleSubmit,
  } = useEditarPerfil();

  const handleEquipamientoToggle = (id: string) => {
    const current: string[] = formData.equipamiento || [];

    if (id === "NINGUNO") {
      const yaActivo = current.includes("NINGUNO");
      handleText("equipamiento", yaActivo ? [] : ["NINGUNO"]);
      return;
    }

    const sinNinguno = current.filter((x) => x !== "NINGUNO");
    const yaActivo = sinNinguno.includes(id);
    const siguiente = yaActivo
      ? sinNinguno.filter((x) => x !== id)
      : [...sinNinguno, id];

    handleText("equipamiento", siguiente);
  };

  return (
    <ScrollView
      style={[
        styles.page,
        { backgroundColor: isDark ? PAGE_BG_DARK : "#F8FAFC" },
      ]}
      contentContainerStyle={[
        styles.pageContent,
        { paddingBottom: Platform.OS === "ios" ? 140 : 130 },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: t.textPrimary }]}>
          Editar perfil
        </Text>
        <Text style={[styles.pageSubtitle, { color: t.textSecondary }]}>
          Ajusta tus preferencias para que tus planes se adapten mejor a ti.
        </Text>
      </View>

      <View style={styles.stack}>
        <Section title="Información general">
          <View style={styles.innerStack}>
            <View>
              <Text style={[styles.fieldLabel, { color: t.textSecondary }]}>
                Peso objetivo (kg)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(formData.pesoObjetivo ?? "")}
                onChangeText={(v) =>
                  handleText("pesoObjetivo", v.replace(",", "."))
                }
                placeholder="Ej: 70"
                placeholderTextColor={t.textTertiary}
                style={[
                  styles.input,
                  {
                    color: t.textPrimary,
                    backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface,
                    borderColor: t.border,
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
                    <Text style={[styles.fieldLabel, { color: t.textSecondary }]}>
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
                  ? "rgba(148,163,184,0.15)"
                  : FORM.green,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Guardar cambios</Text>
          )}
        </Pressable>

        {hayCambios && (
          <Text style={[styles.ctaHint, { color: t.textSecondary }]}>
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: { marginBottom: 20 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Font.title.bold,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: Font.body.regular,
    lineHeight: 19,
  },

  stack: { gap: 12 },

  section: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
  },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: -0.2,
  },
  sectionDesc: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: Font.body.regular,
    lineHeight: 17,
  },
  sectionDivider: {
    height: 1,
    marginBottom: 12,
  },

  innerStack: { gap: 16 },
  selectorsStack: { gap: 16 },
  selectorBlock: { gap: 6 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: Font.body.regular,
    borderWidth: 1,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },

  equipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  equipCard: {
    width: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
  },
  equipIconBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  equipImage: { width: 46, height: 46 },
  equipLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textAlign: "center",
    letterSpacing: 0.1,
  },

  ctaWrap: { marginTop: 20, alignItems: "center" },
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
    fontFamily: Font.body.bold,
    color: "#fff",
    letterSpacing: 0.2,
  },
  ctaHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Font.body.regular,
  },
});
