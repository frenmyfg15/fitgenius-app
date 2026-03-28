// src/shared/components/rutinas-manuales/EditarCompuestoSheet.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    Platform,
    ScrollView,
} from "react-native";
import { useColorScheme } from "nativewind";
import { X, Trash2, Pencil, Plus, CheckCircle2 } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "@/shared/components/ui/Toast";

import type {
    DiaSemana,
    EjercicioAsignadoInput,
    EjercicioVisualInfo,
    TipoCompuesto,
} from "@/features/type/crearRutina";
import FormularioEjercicio from "@/shared/components/rutinas-manuales/FormularioEjercicio";
import BuscadorEjercicio from "@/shared/components/ui/BuscadorEjercicio";

const TIPOS: TipoCompuesto[] = ["SUPERSET", "DROPSET", "CIRCUITO"];

const MIN_HIJOS = 2;

type HijoEditable = EjercicioAsignadoInput & {
    ejercicioInfo: EjercicioVisualInfo;
    ejercicioId: number;
};

type Props = {
    visible: boolean;
    diaSemana: DiaSemana;
    compuestoId: number;
    nombreInicial: string;
    tipoInicial: TipoCompuesto;
    descansoInicial: number;
    ejerciciosIniciales: EjercicioAsignadoInput[];
    onCancel: () => void;
    onConfirm: (payload: {
        diaSemana: DiaSemana;
        compuestoId: number;
        nombre: string;
        tipo: TipoCompuesto;
        descansoSeg: number;
        ejercicios: EjercicioAsignadoInput[];
    }) => void;
};

export default function EditarCompuestoSheet({
    visible,
    diaSemana,
    compuestoId,
    nombreInicial,
    tipoInicial,
    descansoInicial,
    ejerciciosIniciales,
    onCancel,
    onConfirm,
}: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const insets = useSafeAreaInsets();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    // Distingue cierre por confirmación vs cancelación
    const confirmedRef = useRef(false);
    const snapPoints = useMemo(() => ["100%"], []);
    const topInset = Math.max(insets.top, 12);

    // ─── Estado local ─────────────────────────────────────────────────────────────
    const [nombre, setNombre] = useState(nombreInicial);
    const [tipo, setTipo] = useState<TipoCompuesto>(tipoInicial);
    const [descanso, setDescanso] = useState(descansoInicial);
    const [hijos, setHijos] = useState<HijoEditable[]>([]);

    // Hijo que se está editando
    const [hijoEditando, setHijoEditando] = useState<HijoEditable | null>(null);

    // Mostrar buscador para añadir nuevo hijo
    const [mostrarBuscador, setMostrarBuscador] = useState(false);

    // Ejercicio nuevo seleccionado del buscador, pendiente de pasar por FormularioEjercicio
    const [nuevoEjercicio, setNuevoEjercicio] = useState<{
        id: number;
        info: EjercicioVisualInfo;
    } | null>(null);

    // ─── Sincronizar estado cuando se abre ───────────────────────────────────────
    useEffect(() => {
        if (!visible) return;
        setNombre(nombreInicial);
        setTipo(tipoInicial);
        setDescanso(descansoInicial);
        setHijos(
            (ejerciciosIniciales ?? []).map((e) => ({
                ...e,
                ejercicioId: e.ejercicioId!,
                ejercicioInfo: e.ejercicioInfo!,
            }))
        );
        setHijoEditando(null);
        setNuevoEjercicio(null);
        setMostrarBuscador(false);
    }, [visible]);

    // ─── Bottom sheet ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (visible) {
            confirmedRef.current = false;
            const id = requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
            return () => cancelAnimationFrame(id);
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    // onDismiss distingue confirmación vs cancelación
    const handleDismiss = useCallback(() => {
        if (confirmedRef.current) {
            confirmedRef.current = false;
            return; // fue confirmación — el padre ya gestiona el cierre
        }
        onCancel();
    }, [onCancel]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.4}
                pressBehavior="close"
            />
        ),
        []
    );

    // ─── Colores ──────────────────────────────────────────────────────────────────
    const cardBg = isDark ? "#0f172a" : "#ffffff";
    const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
    const textSecondary = isDark ? "#94a3b8" : "#64748b";
    const accentColor = isDark ? "#10b981" : "#059669";
    const surface = isDark ? "#1e293b" : "#f1f5f9";
    const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const placeholderColor = isDark ? "#64748b" : "#94a3b8";

    // ─── Acciones sobre hijos ─────────────────────────────────────────────────────

    const handleEliminarHijo = (ejercicioId: number) => {
        if (hijos.length <= MIN_HIJOS) {
            Toast.show({
                type: "error",
                text1: "Mínimo requerido",
                text2: `Un compuesto debe tener al menos ${MIN_HIJOS} ejercicios.`,
            });
            return;
        }
        setHijos((prev) => prev.filter((h) => h.ejercicioId !== ejercicioId));
    };

    const handleConfirmarEdicionHijo = (data: any) => {
        if (!hijoEditando) return;
        setHijos((prev) =>
            prev.map((h) =>
                h.ejercicioId === hijoEditando.ejercicioId
                    ? {
                        ...h,
                        seriesSugeridas: data.seriesSugeridas,
                        repeticionesSugeridas: data.repeticionesSugeridas,
                        pesoSugerido: data.pesoSugerido,
                        descansoSeg: data.descansoSeg,
                        notaIA: data.notaIA,
                    }
                    : h
            )
        );
        setHijoEditando(null);
    };

    const handleConfirmarNuevoHijo = (data: any) => {
        if (!nuevoEjercicio) return;
        const nuevoHijo: HijoEditable = {
            ejercicioId: nuevoEjercicio.id,
            ejercicioInfo: nuevoEjercicio.info,
            orden: hijos.length + 1,
            seriesSugeridas: data.seriesSugeridas,
            repeticionesSugeridas: data.repeticionesSugeridas,
            pesoSugerido: data.pesoSugerido,
            descansoSeg: 0,
            notaIA: data.notaIA,
            ejercicioCompuestoId: compuestoId,
        };
        setHijos((prev) => [...prev, nuevoHijo]);
        setNuevoEjercicio(null);
    };

    // ─── Confirmar edición completa ───────────────────────────────────────────────

    const handleConfirmar = () => {
        if (!nombre.trim()) {
            Toast.show({
                type: "error",
                text1: "Nombre requerido",
                text2: "El compuesto debe tener un nombre.",
            });
            return;
        }

        if (hijos.length < MIN_HIJOS) {
            Toast.show({
                type: "error",
                text1: "Mínimo requerido",
                text2: `Un compuesto debe tener al menos ${MIN_HIJOS} ejercicios.`,
            });
            return;
        }

        // Marca confirmación ANTES de dismiss para que handleDismiss no llame onCancel
        confirmedRef.current = true;
        bottomSheetModalRef.current?.dismiss();
        onConfirm({
            diaSemana,
            compuestoId,
            nombre: nombre.trim(),
            tipo,
            descansoSeg: descanso,
            ejercicios: hijos.map((h, i) => ({ ...h, orden: i + 1 })),
        });
    };

    // ─── Render ───────────────────────────────────────────────────────────────────

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                onDismiss={handleDismiss}
                enablePanDownToClose
                enableContentPanningGesture={false}
                enableOverDrag={false}
                overDragResistanceFactor={0}
                topInset={topInset}
                style={{
                    zIndex: 9999,
                    ...(Platform.OS === "android" ? { elevation: 9999 } : null),
                }}
                containerStyle={{
                    zIndex: 9999,
                    ...(Platform.OS === "android" ? { elevation: 9999 } : null),
                }}
                handleIndicatorStyle={{
                    backgroundColor: isDark ? "#334155" : "#e2e8f0",
                    width: 40,
                }}
                backgroundStyle={{ backgroundColor: cardBg }}
            >
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: 32 + insets.bottom,
                        paddingTop: 8,
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <View>
                            <Text
                                style={{ fontSize: 18, fontWeight: "800", color: textPrimary }}
                            >
                                Editar compuesto
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: "800",
                                    color: textSecondary,
                                    letterSpacing: 1,
                                    marginTop: 2,
                                }}
                            >
                                CONFIGURACIÓN
                            </Text>
                        </View>
                        <Pressable onPress={onCancel} hitSlop={10}>
                            <X size={20} color={textSecondary} />
                        </Pressable>
                    </View>

                    {/* Nombre */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: textSecondary,
                            marginBottom: 8,
                        }}
                    >
                        Nombre del compuesto
                    </Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ej: Superset Pecho y Tríceps"
                        placeholderTextColor={placeholderColor}
                        style={{
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            backgroundColor: surface,
                            color: textPrimary,
                            fontSize: 14,
                            marginBottom: 16,
                        }}
                    />

                    {/* Tipo */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: textSecondary,
                            marginBottom: 8,
                        }}
                    >
                        Tipo de compuesto
                    </Text>
                    <View
                        style={{
                            borderRadius: 16,
                            backgroundColor: surface,
                            overflow: "hidden",
                            marginBottom: 16,
                        }}
                    >
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(v) => setTipo(v as TipoCompuesto)}
                            dropdownIconColor={textSecondary}
                            style={{ height: 54, color: textPrimary }}
                        >
                            {TIPOS.map((t) => (
                                <Picker.Item key={t} label={t} value={t} color={textPrimary} />
                            ))}
                        </Picker>
                    </View>

                    {/* Descanso */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: textSecondary,
                            marginBottom: 8,
                        }}
                    >
                        Descanso entre bloques (segundos)
                    </Text>
                    <TextInput
                        value={String(descanso)}
                        onChangeText={(t) => {
                            const n = Number(t.replace(/[^\d]/g, ""));
                            setDescanso(Number.isFinite(n) ? n : 0);
                        }}
                        placeholder="60"
                        keyboardType="numeric"
                        placeholderTextColor={placeholderColor}
                        style={{
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            backgroundColor: surface,
                            color: textPrimary,
                            fontSize: 14,
                            marginBottom: 24,
                        }}
                    />

                    {/* Ejercicios hijos */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "800",
                                color: textSecondary,
                                letterSpacing: 1,
                            }}
                        >
                            EJERCICIOS ({hijos.length})
                        </Text>
                        <Pressable
                            onPress={() => setMostrarBuscador(true)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: accentColor,
                            }}
                        >
                            <Plus size={14} color="#fff" />
                            <Text
                                style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}
                            >
                                Añadir
                            </Text>
                        </Pressable>
                    </View>

                    <View style={{ gap: 10, marginBottom: 24 }}>
                        {hijos.map((hijo, index) => (
                            <View
                                key={`${hijo.ejercicioId}-${index}`}
                                style={{
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: cardBorder,
                                    backgroundColor: surface,
                                    padding: 12,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                {/* GIF */}
                                <View
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        backgroundColor: isDark ? "#020617" : "#e2e8f0",
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${hijo.ejercicioInfo?.idGif ?? ""
                                                }.gif`,
                                        }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "700",
                                            color: textPrimary,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {hijo.ejercicioInfo?.nombre ?? "Ejercicio"}
                                    </Text>
                                    <Text
                                        style={{ fontSize: 11, color: textSecondary }}
                                    >
                                        {hijo.seriesSugeridas ?? "-"} series ·{" "}
                                        {hijo.repeticionesSugeridas ?? "-"} reps ·{" "}
                                        {hijo.pesoSugerido != null ? `${hijo.pesoSugerido} kg` : "-"}
                                    </Text>
                                </View>

                                {/* Acciones */}
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    <Pressable
                                        onPress={() => setHijoEditando(hijo)}
                                        hitSlop={8}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: isDark
                                                ? "rgba(255,255,255,0.06)"
                                                : "#e2e8f0",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Pencil size={16} color={textSecondary} />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleEliminarHijo(hijo.ejercicioId)}
                                        hitSlop={8}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: isDark
                                                ? "rgba(239,68,68,0.12)"
                                                : "#fee2e2",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Botón confirmar */}
                    <Pressable
                        onPress={handleConfirmar}
                        style={{
                            borderRadius: 999,
                            paddingVertical: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 8,
                            backgroundColor: accentColor,
                        }}
                    >
                        <CheckCircle2 size={20} color="#fff" />
                        <Text style={{ fontSize: 14, fontWeight: "800", color: "#ffffff" }}>
                            Guardar cambios
                        </Text>
                    </Pressable>
                </BottomSheetScrollView>
            </BottomSheetModal>

            {/* Editar hijo existente */}
            {hijoEditando && (
                <FormularioEjercicio
                    visible={!!hijoEditando}
                    ejercicioId={hijoEditando.ejercicioId}
                    orden={hijoEditando.orden}
                    esParteDeCompuesto
                    esCardio={hijoEditando.ejercicioInfo?.grupoMuscular === "CARDIO"}
                    initialValues={{
                        seriesSugeridas: hijoEditando.seriesSugeridas,
                        repeticionesSugeridas: hijoEditando.repeticionesSugeridas,
                        pesoSugerido: hijoEditando.pesoSugerido,
                        descansoSeg: hijoEditando.descansoSeg,
                        notaIA: hijoEditando.notaIA,
                    }}
                    onClose={() => setHijoEditando(null)}
                    onConfirm={handleConfirmarEdicionHijo}
                />
            )}

            {/* Nuevo hijo — formulario de detalles */}
            {nuevoEjercicio && (
                <FormularioEjercicio
                    visible={!!nuevoEjercicio}
                    ejercicioId={nuevoEjercicio.id}
                    esParteDeCompuesto
                    esCardio={nuevoEjercicio.info?.grupoMuscular === "CARDIO"}
                    onClose={() => setNuevoEjercicio(null)}
                    onConfirm={handleConfirmarNuevoHijo}
                />
            )}

            {/* Buscador para añadir nuevo hijo */}
            {mostrarBuscador && (
                <View
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 99999,
                        ...(Platform.OS === "android" ? { elevation: 99999 } : null),
                    }}
                >
                    <BuscadorEjercicio
                        onClose={() => setMostrarBuscador(false)}
                        onSelect={(id, ejercicio) => {
                            if (!ejercicio) return;

                            // Evitar duplicados
                            const yaExiste = hijos.some((h) => h.ejercicioId === id);
                            if (yaExiste) {
                                Toast.show({
                                    type: "info",
                                    text1: "Ejercicio duplicado",
                                    text2: "Este ejercicio ya está en el compuesto.",
                                });
                                setMostrarBuscador(false);
                                return;
                            }

                            setNuevoEjercicio({
                                id,
                                info: {
                                    idGif: ejercicio.idGif,
                                    nombre: ejercicio.nombre,
                                    grupoMuscular: ejercicio.grupoMuscular,
                                    tipoEjercicio: ejercicio.tipoEjercicio,
                                },
                            });
                            setMostrarBuscador(false);
                        }}
                    />
                </View>
            )}
        </>
    );
}