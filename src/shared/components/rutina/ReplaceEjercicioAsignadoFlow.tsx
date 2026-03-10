// src/shared/components/rutina/ReplaceEjercicioAsignadoFlow.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import BuscadorEjercicio from "@/shared/components/ui/BuscadorEjercicio";
import { replaceEjercicioAsignado } from "@/features/api/rutinas.api";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";

type Props = {
    rutinaId: number;
    diaRutinaId: number;
    asignadoId: number;

    // opcional (para UI / logs)
    tituloBuscar?: string;
    descripcionBuscar?: string;

    // Render-prop: te deja decidir cómo dispararlo (botón, swipe action, etc.)
    children: (api: { open: () => void; loading: boolean; disabled?: boolean }) => React.ReactNode;

    // si quieres bloquearlo (por ejemplo en compuestos)
    disabled?: boolean;

    // callback opcional tras reemplazar
    onReplaced?: () => void;
};

function toNumberOrNull(v: string): number | null {
    const t = (v ?? "").trim();
    if (!t) return null;
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

export default function ReplaceEjercicioAsignadoFlow({
    rutinaId,
    diaRutinaId,
    asignadoId,
    tituloBuscar = "Reemplazar ejercicio",
    descripcionBuscar = "Selecciona el nuevo ejercicio para reemplazar este.",
    children,
    disabled,
    onReplaced,
}: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const bumpRoutineRev = useSyncStore((s) => s.bumpRoutineRev);
    const clearRutinaCache = useRutinaCache((s) => s.clear);

    const [showBuscador, setShowBuscador] = useState(false);
    const [showDetalles, setShowDetalles] = useState(false);

    const [nuevoEjercicioId, setNuevoEjercicioId] = useState<number | null>(null);
    const [nuevoEjercicioNombre, setNuevoEjercicioNombre] = useState<string>("");

    const [series, setSeries] = useState<string>("");
    const [reps, setReps] = useState<string>("");
    const [peso, setPeso] = useState<string>("");
    const [descanso, setDescanso] = useState<string>("");

    const [loading, setLoading] = useState(false);

    // ✅ Botón habilitado solo cuando todos los campos tienen valor numérico válido
    const canSubmit = useMemo(() => {
        return (
            !!nuevoEjercicioId &&
            toNumberOrNull(series) !== null &&
            toNumberOrNull(reps) !== null &&
            toNumberOrNull(peso) !== null &&
            toNumberOrNull(descanso) !== null
        );
    }, [nuevoEjercicioId, series, reps, peso, descanso]);

    const theme = useMemo(() => {
        const bg = isDark ? "#0b1220" : "#ffffff";
        const surface = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
        const line = isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb";
        const text = isDark ? "#e5e7eb" : "#0f172a";
        const muted = isDark ? "#94a3b8" : "#64748b";
        return { bg, surface, line, text, muted };
    }, [isDark]);

    const reset = useCallback(() => {
        setNuevoEjercicioId(null);
        setNuevoEjercicioNombre("");
        setSeries("");
        setReps("");
        setPeso("");
        setDescanso("");
        setShowBuscador(false);
        setShowDetalles(false);
        setLoading(false);
    }, []);

    const open = useCallback(() => {
        if (disabled) return;
        if (!Number.isFinite(rutinaId) || !Number.isFinite(diaRutinaId) || !Number.isFinite(asignadoId)) {
            Toast.show({ type: "error", text1: "Faltan ids para reemplazar" });
            return;
        }
        setShowBuscador(true);
    }, [disabled, rutinaId, diaRutinaId, asignadoId]);

    const onSelectEjercicio = useCallback((id: number, ejercicio?: any) => {
        setNuevoEjercicioId(id);
        setNuevoEjercicioNombre(ejercicio?.nombre ?? "");
        setShowBuscador(false);
        setShowDetalles(true);
    }, []);

    const submitReplace = useCallback(async () => {
        if (!nuevoEjercicioId) {
            Toast.show({ type: "error", text1: "Selecciona un ejercicio" });
            return;
        }

        const payload = {
            nuevoEjercicioId,
            seriesSugeridas: toNumberOrNull(series) ?? undefined,
            repeticionesSugeridas: toNumberOrNull(reps) ?? undefined,
            pesoSugerido: toNumberOrNull(peso) ?? undefined,
            descansoSeg: toNumberOrNull(descanso) ?? undefined,
        };

        try {
            setLoading(true);

            await replaceEjercicioAsignado(rutinaId, diaRutinaId, asignadoId, payload);

            clearRutinaCache();
            bumpRoutineRev();

            Toast.show({ type: "success", text1: "Ejercicio reemplazado" });
            setShowDetalles(false);
            onReplaced?.();
        } catch (e: any) {
            Toast.show({
                type: "error",
                text1: "No se pudo reemplazar",
                text2: e?.message ? String(e.message) : undefined,
            });
        } finally {
            setLoading(false);
        }
    }, [
        nuevoEjercicioId,
        series,
        reps,
        peso,
        descanso,
        rutinaId,
        diaRutinaId,
        asignadoId,
        clearRutinaCache,
        bumpRoutineRev,
        onReplaced,
    ]);

    return (
        <>
            {children({ open, loading, disabled })}

            {/* 1) Buscador (tu modal existente) */}
            {showBuscador && (
                <BuscadorEjercicio
                    onClose={() => setShowBuscador(false)}
                    onSelect={onSelectEjercicio}
                    titulo={tituloBuscar}
                    descripcion={descripcionBuscar}
                />
            )}

            {/* 2) Modal inputs — igual que antes, solo añadimos KeyboardAvoidingView */}
            <Modal
                visible={showDetalles}
                transparent
                animationType="fade"
                onRequestClose={() => (loading ? null : setShowDetalles(false))}
            >
                {/*
                    KeyboardAvoidingView empuja el bottom sheet hacia arriba
                    cuando el teclado aparece, sin tocar el diseño del sheet.
                    En iOS usamos "padding"; en Android "height" funciona mejor.
                */}
                <KeyboardAvoidingView
                    style={{ flex: 1, justifyContent: "flex-end" }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    {/* Overlay oscuro — toca fuera para cerrar */}
                    <Pressable
                        style={{
                            ...StyleSheet_absoluteFill,
                            backgroundColor: "rgba(0,0,0,0.55)",
                        }}
                        onPress={() => (loading ? null : setShowDetalles(false))}
                    />

                    {/* Sheet — idéntico al original */}
                    <View
                        style={{
                            backgroundColor: theme.bg,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            borderWidth: 1,
                            borderColor: theme.line,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>
                            Ajustes del reemplazo
                        </Text>
                        <Text style={{ color: theme.muted, marginTop: 6, fontSize: 12 }}>
                            {nuevoEjercicioNombre
                                ? `Nuevo ejercicio: ${nuevoEjercicioNombre}`
                                : "Nuevo ejercicio seleccionado"}
                        </Text>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                            <Field label="Series" value={series} onChangeText={setSeries} isDark={isDark} />
                            <Field label="Reps" value={reps} onChangeText={setReps} isDark={isDark} />
                        </View>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                            <Field label="Peso" value={peso} onChangeText={setPeso} isDark={isDark} />
                            <Field label="Descanso (s)" value={descanso} onChangeText={setDescanso} isDark={isDark} />
                        </View>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                            <Pressable
                                disabled={loading}
                                onPress={() => setShowDetalles(false)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: theme.line,
                                    backgroundColor: theme.surface,
                                    opacity: loading ? 0.7 : 1,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: theme.text, fontWeight: "800" }}>Cancelar</Text>
                            </Pressable>

                            {/* ✅ disabled hasta que canSubmit sea true */}
                            <Pressable
                                disabled={loading || !canSubmit}
                                onPress={submitReplace}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: theme.line,
                                    backgroundColor: isDark ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.12)",
                                    opacity: loading || !canSubmit ? 0.35 : 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    gap: 8,
                                }}
                            >
                                {loading ? <ActivityIndicator /> : null}
                                <Text style={{ color: theme.text, fontWeight: "900" }}>Reemplazar</Text>
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={reset}
                            disabled={loading}
                            style={{ marginTop: 10, alignSelf: "center", padding: 8, opacity: loading ? 0.6 : 1 }}
                        >
                            <Text style={{ color: theme.muted, fontWeight: "700", fontSize: 12 }}>
                                Reiniciar
                            </Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

// Helper para el overlay absoluto sin importar StyleSheet
const StyleSheet_absoluteFill = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

function Field({
    label,
    value,
    onChangeText,
    isDark,
}: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    isDark: boolean;
}) {
    const line = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
    const bg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
    const text = isDark ? "#e5e7eb" : "#0f172a";
    const muted = isDark ? "#94a3b8" : "#64748b";

    return (
        <View style={{ flex: 1 }}>
            <Text style={{ color: muted, fontSize: 11, fontWeight: "800", marginBottom: 6 }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={muted}
                style={{
                    height: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: line,
                    backgroundColor: bg,
                    paddingHorizontal: 12,
                    color: text,
                    fontWeight: "800",
                }}
            />
        </View>
    );
}