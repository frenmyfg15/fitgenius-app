import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import { useUsuarioStore, type PerfilFormData } from "@/features/store/useUsuarioStore";
import { equipamiento as opcionesEquipamiento } from "../../../../shared/constants/register/equipamiento";
import { limitaciones as opcionesLimitaciones } from "../../../../shared/constants/register/limitaciones";
import { actualizarPerfil } from "@/features/api/usuario.api";

/* ---------- Tokens visuales (mismos que el resto) ---------- */
const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

/* ---------- Tipos locales ---------- */
interface EquipamientoOpcion { id: string; nombre: string; imagen: string }
interface LimitacionOpcion { id: string; nombre: string }
type OptionsConfigKey = "sexo" | "nivel" | "actividad" | "objetivo" | "duracion" | "lugar";

const optionsConfig: Record<OptionsConfigKey, { label: string; values: string[] }> = {
    sexo: { label: "Sexo", values: ["MASCULINO", "FEMENINO"] },
    nivel: { label: "Nivel de experiencia", values: ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"] },
    actividad: { label: "Actividad diaria", values: ["SEDENTARIO", "LIGERAMENTE_ACTIVO", "MODERADAMENTE_ACTIVO", "MUY_ACTIVO"] },
    objetivo: { label: "Objetivo principal", values: ["PERDIDA_GRASA", "GANANCIA_MUSCULAR", "TONIFICAR_FORMA", "MATENER_FORMA"] },
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

/* ---------- Helpers UI ---------- */
function prettyLabel(v: string) {
    if (v === "MASCULINO") return "M";
    if (v === "FEMENINO") return "F";
    return v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (s) => s.toUpperCase());
}

function FrameCard({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <LinearGradient
      colors={marcoGradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
    >
      {isDark ? (
        <LinearGradient
          colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, borderWidth: 1, borderColor: cardBorderDark, overflow: "hidden" }}
        >
          <View className="rounded-2xl p-6">
            {children}
          </View>
        </LinearGradient>
      ) : (
        <View
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", overflow: "hidden" }}
        >
          {children}
        </View>
      )}
    </LinearGradient>
  );
}


function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    return (
        <FrameCard>
            <View className="mb-4">
                <Text className="text-lg font-semibold tracking-tight" style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>{title}</Text>
                {!!description && (
                    <Text className="mt-1 text-sm" style={{ color: isDark ? textSecondaryDark : "#64748b" }}>{description}</Text>
                )}
            </View>
            {children}
        </FrameCard>
    );
}

/* ---------- Pantalla ---------- */
export default function EditarPerfil() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const { usuario, updatePerfil } = useUsuarioStore();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<PerfilFormData>(() => ({
        pesoObjetivo: usuario?.pesoObjetivo || 0,
        sexo: usuario?.sexo || "",
        nivel: usuario?.nivelExperiencia || "",
        actividad: usuario?.actividadDiaria || "",
        objetivo: usuario?.objetivoPrincipal || "",
        duracion: usuario?.duracionSesion || "",
        lugar: usuario?.lugarEntrenamiento || "",
        enfoque: usuario?.enfoquesMusculares || [],
        limitaciones: usuario?.limitaciones || [],
        dias: usuario?.dias || [],
        equipamiento: usuario?.equipamiento || [],
    }));

    useEffect(() => {
        if (!usuario) return;
        setFormData({
            pesoObjetivo: usuario.pesoObjetivo || 0,
            sexo: usuario.sexo || "",
            nivel: usuario.nivelExperiencia || "",
            actividad: usuario.actividadDiaria || "",
            objetivo: usuario.objetivoPrincipal || "",
            duracion: usuario.duracionSesion || "",
            lugar: usuario.lugarEntrenamiento || "",
            enfoque: usuario.enfoquesMusculares || [],
            limitaciones: usuario.limitaciones || [],
            dias: usuario.dias || [],
            equipamiento: usuario.equipamiento || [],
        });
    }, [usuario]);

    const handleText = (name: keyof PerfilFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value } as PerfilFormData));
    };

    const toggleArrayValue = (field: "enfoque" | "limitaciones" | "dias" | "equipamiento", value: string) => {
        setFormData((prev) => {
            const arr = (prev[field] as string[]) || [];
            const next = arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value];
            return { ...prev, [field]: next } as PerfilFormData;
        });
    };

    const isEqualArray = (a: string[], b: string[]) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

    const hayCambios = useMemo(() => {
        if (!usuario) return false;
        return (
            formData.pesoObjetivo !== usuario.pesoObjetivo ||
            formData.sexo !== usuario.sexo ||
            formData.nivel !== usuario.nivelExperiencia ||
            formData.actividad !== usuario.actividadDiaria ||
            formData.objetivo !== usuario.objetivoPrincipal ||
            formData.duracion !== usuario.duracionSesion ||
            formData.lugar !== usuario.lugarEntrenamiento ||
            !isEqualArray(formData.enfoque, usuario.enfoquesMusculares || []) ||
            !isEqualArray(formData.dias, usuario.dias || []) ||
            !isEqualArray(formData.equipamiento, usuario.equipamiento || []) ||
            !isEqualArray(formData.limitaciones, usuario.limitaciones || [])
        );
    }, [formData, usuario]);

    const handleSubmit = useCallback(async () => {
        if (!hayCambios) {
            Toast.show({ type: "info", text1: "No hay cambios para guardar." });
            return;
        }
        try {
            setSaving(true);
            Toast.show({ type: "info", text1: "Guardando cambios..." });
            await actualizarPerfil(formData as any);
            updatePerfil(formData);
            Toast.show({ type: "success", text1: "¡Perfil actualizado con éxito!" });
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Ocurrió un error al actualizar el perfil.";
            Toast.show({ type: "error", text1: "Error", text2: msg });
        } finally {
            setSaving(false);
        }
    }, [formData, hayCambios, updatePerfil]);

    return (
        <ScrollView className={`flex-1 p-4 pb-16 ${isDark ? 'bg-[#0b1220]' : 'bg-white'}`} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Header */}
            <View className="mb-6 items-center">
                <Text className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                    Ajusta tu perfil de entrenamiento
                </Text>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-center`}>
                    Personaliza tus preferencias para obtener planes más precisos
                </Text>
            </View>

            {/* Tarjetas separadas */}
            <View className="mt-6 gap-6">
                {/* Información General */}
                <Section title="Información general">
                    <View className="gap-6">
                        {/* Peso objetivo */}
                        <View>
                            <Text className="text-sm font-medium mb-1" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>Peso objetivo (kg)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={String(formData.pesoObjetivo ?? '')}
                                onChangeText={(t) => handleText('pesoObjetivo', t.replace(',', '.'))}
                                placeholder="Ej: 70"
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                className="rounded-xl px-3 py-3"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', color: isDark ? textPrimaryDark : '#0f172a', borderWidth: 1, borderColor: isDark ? cardBorderDark : 'rgba(0,0,0,0.06)' }}
                                accessibilityLabel="Peso objetivo en kilogramos"
                            />
                        </View>

                        {/* Selectores (chips) */}
                        <View className="gap-6">
                            {Object.entries(optionsConfig).map(([key, cfg]) => {
                                const k = key as OptionsConfigKey;
                                const value = formData[k] as string;
                                return (
                                    <View key={k} className="gap-2">
                                        <Text className="text-sm font-medium" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>{cfg.label}</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {cfg.values.map((v) => {
                                                const active = value === v;
                                                return (
                                                    <Pressable
                                                        key={v}
                                                        onPress={() => handleText(k, v)}
                                                        accessibilityRole="button"
                                                        accessibilityState={{ selected: active }}
                                                        className="rounded-xl px-3 py-2"
                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor: active ? '#22c55e' : isDark ? cardBorderDark : 'rgba(0,0,0,0.06)',
                                                            backgroundColor: active ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(57,255,20,0.20)') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff'),
                                                        }}
                                                    >
                                                        <Text className="text-sm font-medium" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>{prettyLabel(v)}</Text>
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
                <Section title="Enfoques musculares" description="Selecciona las áreas en las que te quieres enfocar.">
                    <View className="flex-row flex-wrap gap-3">
                        {muscleFocusOptions.map((opt) => {
                            const active = (formData.enfoque || []).includes(opt.id);
                            return (
                                <Pressable
                                    key={opt.id}
                                    onPress={() => toggleArrayValue('enfoque', opt.id)}
                                    accessibilityRole="button"
                                    className="rounded-xl px-3 py-2"
                                    style={{ borderWidth: 1, borderColor: active ? '#22c55e' : isDark ? cardBorderDark : 'rgba(0,0,0,0.06)', backgroundColor: active ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(57,255,20,0.20)') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff') }}
                                >
                                    <Text className="text-sm font-medium" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>{opt.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Section>

                {/* Días disponibles */}
                <Section title="Días disponibles" description="¿Qué días de la semana puedes entrenar?">
                    <View className="flex-row flex-wrap gap-3">
                        {daysOptions.map((d) => {
                            const active = (formData.dias || []).includes(d.id);
                            return (
                                <Pressable
                                    key={d.id}
                                    onPress={() => toggleArrayValue('dias', d.id)}
                                    accessibilityRole="button"
                                    className="rounded-xl px-3 py-2"
                                    style={{ borderWidth: 1, borderColor: active ? '#22c55e' : isDark ? cardBorderDark : 'rgba(0,0,0,0.06)', backgroundColor: active ? (isDark ? 'rgba(34,197,94,0.15)' : '#22c55e') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff') }}
                                >
                                    <Text className="text-sm font-medium" style={{ color: active ? (isDark ? textPrimaryDark : '#ffffff') : (isDark ? textPrimaryDark : '#0f172a') }}>{d.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Section>

                {/* Equipamiento (solo si CASA) */}
                {formData.lugar === 'CASA' && (
                    <Section title="Equipamiento en casa" description="Selecciona el equipamiento que tienes disponible.">
                        <View className="flex-row flex-wrap gap-4">
                            {opcionesEquipamiento.map((item: EquipamientoOpcion) => {
                                const active = (formData.equipamiento || []).includes(item.id);
                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => toggleArrayValue('equipamiento', item.id)}
                                        accessibilityRole="button"
                                        className="items-center rounded-xl p-3"
                                        style={{ width: 110, borderWidth: 1, borderColor: active ? '#a855f7' : (isDark ? cardBorderDark : 'rgba(0,0,0,0.06)'), backgroundColor: active ? (isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.12)') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff') }}
                                    >
                                        <View className="items-center justify-center mb-2 rounded-xl overflow-hidden" style={{ width: 56, height: 56, borderWidth: 1, borderColor: isDark ? cardBorderDark : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa' }}>
                                            <Image source={{ uri: item.imagen }} resizeMode="contain" style={{ width: 52, height: 52 }} />
                                        </View>
                                        <Text className="text-xs font-medium text-center" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>{item.nombre}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Section>
                )}

                {/* Limitaciones físicas */}
                <Section title="Limitaciones físicas" description="Indica si tienes alguna limitación para adaptar el entrenamiento.">
                    <View className="flex-row flex-wrap gap-3">
                        {opcionesLimitaciones.map((item: LimitacionOpcion) => {
                            const active = (formData.limitaciones || []).includes(item.id);
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => toggleArrayValue('limitaciones', item.id)}
                                    accessibilityRole="button"
                                    className="rounded-xl px-3 py-2"
                                    style={{ borderWidth: 1, borderColor: active ? '#22c55e' : isDark ? cardBorderDark : 'rgba(0,0,0,0.06)', backgroundColor: active ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(57,255,20,0.20)') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff') }}
                                >
                                    <Text className="text-sm font-medium text-center" style={{ color: isDark ? textPrimaryDark : '#0f172a' }}>{item.nombre}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Section>
            </View>

            {/* CTA Guardar */}
            <View className="pt-6 items-center">
                <LinearGradient colors={marcoGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-full p-[1px]" style={{borderRadius: 15}}>
                    {isDark ? (
                        <LinearGradient colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 15, borderWidth: 1, borderColor: cardBorderDark, overflow: 'hidden' }}>
                            <Pressable onPress={handleSubmit} disabled={!hayCambios || saving} className="rounded-full px-8 py-2.5 items-center justify-center" accessibilityRole="button" accessibilityState={{ disabled: !hayCambios || saving }} style={{ opacity: !hayCambios || saving ? 0.6 : 1 }}>
                                {saving ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text className="text-sm font-semibold" style={{ color: textPrimaryDark }}>Guardar cambios</Text>
                                )}
                            </Pressable>
                        </LinearGradient>
                    ) : (
                        <View className="rounded-full" style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden', }}>
                            <Pressable onPress={handleSubmit} disabled={!hayCambios || saving} className="rounded-full px-8 py-2.5 items-center justify-center" accessibilityRole="button" accessibilityState={{ disabled: !hayCambios || saving }} style={{ opacity: !hayCambios || saving ? 0.6 : 1 }}>
                                {saving ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text className="text-sm font-semibold" style={{ color: '#0f172a' }}>Guardar cambios</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </LinearGradient>
                {hayCambios && (
                    <Text className="mt-2 text-xs" style={{ color: isDark ? textSecondaryDark : '#64748b' }}>Se detectaron modificaciones en tu perfil.</Text>
                )}
            </View>
        </ScrollView>
    );
}
