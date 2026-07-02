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
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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
    const confirmedRef = useRef(false);
    const snapPoints = useMemo(() => ["100%"], []);
    const topInset = Math.max(insets.top, 12);

    const [nombre, setNombre] = useState(nombreInicial);
    const [tipo, setTipo] = useState<TipoCompuesto>(tipoInicial);
    const [descanso, setDescanso] = useState(descansoInicial);
    const [hijos, setHijos] = useState<HijoEditable[]>([]);

    const [hijoEditando, setHijoEditando] = useState<HijoEditable | null>(null);
    const [mostrarBuscador, setMostrarBuscador] = useState(false);
    const [nuevoEjercicio, setNuevoEjercicio] = useState<{
        id: number;
        info: EjercicioVisualInfo;
    } | null>(null);

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

    const handleDismiss = useCallback(() => {
        if (confirmedRef.current) {
            confirmedRef.current = false;
            return;
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

    const t = scheme(isDark);
    const cardBg = isDark ? Colors.dark.surface : Colors.secondary;
    const surface = isDark ? Colors.dark.surfaceAlt : t.surface;
    const ACTION_GREEN = isDark ? "#10B981" : "#059669";

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
                    backgroundColor: t.border,
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
                                style={{ fontSize: 18, fontWeight: "800", fontFamily: Font.body.bold, color: t.textPrimary }}
                            >
                                Editar compuesto
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: "800",
                                    fontFamily: Font.body.bold,
                                    color: t.textSecondary,
                                    letterSpacing: 1,
                                    marginTop: 2,
                                }}
                            >
                                CONFIGURACIÓN
                            </Text>
                        </View>
                        <Pressable onPress={onCancel} hitSlop={10}>
                            <X size={20} color={t.textSecondary} />
                        </Pressable>
                    </View>

                    {/* Nombre */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            fontFamily: Font.body.bold,
                            color: t.textSecondary,
                            marginBottom: 8,
                        }}
                    >
                        Nombre del compuesto
                    </Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ej: Superset Pecho y Tríceps"
                        placeholderTextColor={t.textTertiary}
                        style={{
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            backgroundColor: surface,
                            color: t.textPrimary,
                            fontSize: 14,
                            marginBottom: 16,
                        }}
                    />

                    {/* Tipo */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            fontFamily: Font.body.bold,
                            color: t.textSecondary,
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
                            dropdownIconColor={t.textSecondary}
                            style={{ height: 54, color: t.textPrimary }}
                        >
                            {TIPOS.map((tp) => (
                                <Picker.Item key={tp} label={tp} value={tp} color={t.textPrimary} />
                            ))}
                        </Picker>
                    </View>

                    {/* Descanso */}
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            fontFamily: Font.body.bold,
                            color: t.textSecondary,
                            marginBottom: 8,
                        }}
                    >
                        Descanso entre bloques (segundos)
                    </Text>
                    <TextInput
                        value={String(descanso)}
                        onChangeText={(v) => {
                            const n = Number(v.replace(/[^\d]/g, ""));
                            setDescanso(Number.isFinite(n) ? n : 0);
                        }}
                        placeholder="60"
                        keyboardType="numeric"
                        placeholderTextColor={t.textTertiary}
                        style={{
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            backgroundColor: surface,
                            color: t.textPrimary,
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
                                fontFamily: Font.body.bold,
                                color: t.textSecondary,
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
                                backgroundColor: ACTION_GREEN,
                            }}
                        >
                            <Plus size={14} color="#fff" />
                            <Text
                                style={{ fontSize: 12, fontWeight: "700", fontFamily: Font.body.bold, color: "#ffffff" }}
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
                                    borderColor: t.border,
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
                                        backgroundColor: isDark ? Colors.primary : t.surface,
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
                                            fontFamily: Font.body.bold,
                                            color: t.textPrimary,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {hijo.ejercicioInfo?.nombre ?? "Ejercicio"}
                                    </Text>
                                    <Text
                                        style={{ fontSize: 11, color: t.textSecondary }}
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
                                            backgroundColor: isDark ? t.border : t.surface,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Pencil size={16} color={t.textSecondary} />
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
                            backgroundColor: ACTION_GREEN,
                        }}
                    >
                        <CheckCircle2 size={20} color="#fff" />
                        <Text style={{ fontSize: 14, fontWeight: "800", fontFamily: Font.body.bold, color: "#ffffff" }}>
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
