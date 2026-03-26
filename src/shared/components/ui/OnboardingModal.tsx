// File: src/shared/components/ui/OnboardingModal.tsx
import React, { useRef, useState, useCallback } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    CalendarDays,
    Dumbbell,
    CheckCircle,
    BarChart2,
    Sparkles,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { marcarOnboardingVisto } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const { width: SCREEN_W } = Dimensions.get("window");

const SLIDES = [
    {
        icon: Sparkles,
        iconColor: "#22c55e",
        title: "¡Tu rutina está lista!",
        description:
            "Nuestra IA ha creado una rutina personalizada basada en tu perfil, objetivo y equipamiento. Ya puedes empezar a entrenar.",
    },
    {
        icon: CalendarDays,
        iconColor: "#3b82f6",
        title: "Tu semana de un vistazo",
        description:
            "En Home verás el calendario semanal. También tendrás el ejercicio a realizar destacado y podrás abrir el listado completo del día para ver el resto.",
    },
    {
        icon: Dumbbell,
        iconColor: "#a855f7",
        title: "Registra cada ejercicio",
        description:
            "Al tocar un ejercicio verás el GIF con la técnica correcta. Ingresa tus series, repeticiones y peso. En el ejercicio principal puedes deslizar para reemplazarlo y en la lista encontrarás el botón de cambiar cuando esté disponible.",
    },
    {
        icon: CheckCircle,
        iconColor: "#f59e0b",
        title: "Gestiona tus rutinas",
        description:
            "En Rutinas puedes crear nuevas con IA, diseñarlas manualmente, editarlas, copiar días enteros y elegir cuál usar como activa.",
    },
    {
        icon: BarChart2,
        iconColor: "#ec4899",
        title: "Sigue tu progreso",
        description:
            "En Estadísticas verás tu evolución. En Perfil ajusta tu objetivo, peso, días de entreno y gestiona tu suscripción.",
    },
];

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function OnboardingModal({ visible, onClose }: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const usuario = useUsuarioStore((s) => s.usuario);
    const setUsuario = useUsuarioStore((s) => s.setUsuario);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const translateX = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    const isLast = currentIndex === SLIDES.length - 1;

    const animateToNext = useCallback(
        (nextIndex: number, direction: "left" | "right") => {
            if (saving) return;

            const toValue = direction === "left" ? -SCREEN_W : SCREEN_W;

            Animated.sequence([
                Animated.timing(iconScale, {
                    toValue: 0.7,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                    toValue: 1.1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.timing(translateX, {
                toValue,
                duration: 220,
                useNativeDriver: true,
            }).start(() => {
                setCurrentIndex(nextIndex);
                translateX.setValue(-toValue);
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }).start();
            });
        },
        [translateX, iconScale, saving]
    );

    const handleClose = useCallback(async () => {
        if (saving) return;

        try {
            setSaving(true);
            await marcarOnboardingVisto();

            if (usuario) {
                setUsuario({
                    ...usuario,
                    haVistoOnboarding: true,
                });
            }

            onClose();
        } catch (error) {
            console.log("[OnboardingModal] Error marcando onboarding visto", error);
        } finally {
            setSaving(false);
        }
    }, [saving, usuario, setUsuario, onClose]);

    const handleNext = useCallback(() => {
        if (saving) return;

        if (isLast) {
            handleClose();
            return;
        }

        animateToNext(currentIndex + 1, "left");
    }, [saving, isLast, currentIndex, animateToNext, handleClose]);

    const handleDot = useCallback(
        (index: number) => {
            if (saving || index === currentIndex) return;
            animateToNext(index, index > currentIndex ? "left" : "right");
        },
        [saving, currentIndex, animateToNext]
    );

    const cardBg = isDark ? "#0f1829" : "#ffffff";
    const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
    const textSecondary = isDark ? "#94a3b8" : "#475569";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

    const slide = SLIDES[currentIndex];
    const Icon = slide.icon;

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.backdrop}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.skipBtn}
                            disabled={saving}
                        >
                            <Text style={[styles.skipText, { color: textSecondary }]}>
                                {saving ? "Guardando..." : "Saltar"}
                            </Text>
                        </TouchableOpacity>

                        <Animated.View style={[styles.slideContent, { transform: [{ translateX }] }]}>
                            <Animated.View
                                style={[
                                    styles.iconWrap,
                                    {
                                        backgroundColor: isDark
                                            ? "rgba(255,255,255,0.05)"
                                            : "rgba(0,0,0,0.04)",
                                        transform: [{ scale: iconScale }],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={[slide.iconColor + "33", slide.iconColor + "11"]}
                                    style={styles.iconGradient}
                                >
                                    <Icon size={48} color={slide.iconColor} strokeWidth={1.5} />
                                </LinearGradient>
                            </Animated.View>

                            <Text style={[styles.title, { color: textPrimary }]}>{slide.title}</Text>
                            <Text style={[styles.description, { color: textSecondary }]}>
                                {slide.description}
                            </Text>
                        </Animated.View>

                        <View style={styles.dotsRow}>
                            {SLIDES.map((_, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => handleDot(i)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    disabled={saving}
                                >
                                    <View
                                        style={[
                                            styles.dot,
                                            {
                                                width: i === currentIndex ? 20 : 8,
                                                backgroundColor:
                                                    i === currentIndex
                                                        ? "#22c55e"
                                                        : isDark
                                                            ? "rgba(255,255,255,0.2)"
                                                            : "rgba(0,0,0,0.15)",
                                            },
                                        ]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleNext} activeOpacity={0.88} disabled={saving}>
                            <LinearGradient
                                colors={["#22c55e", "#16a34a"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextBtn}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.nextText}>
                                        {isLast ? "¡Empezar a entrenar! 💪" : "Siguiente"}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    safeArea: {
        width: "100%",
        maxWidth: 420,
    },
    card: {
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 24,
        overflow: "hidden",
    },
    skipBtn: {
        alignSelf: "flex-end",
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    skipText: {
        fontSize: 13,
        fontWeight: "500",
    },
    slideContent: {
        alignItems: "center",
        paddingVertical: 16,
        minHeight: 280,
        justifyContent: "center",
    },
    iconWrap: {
        borderRadius: 999,
        marginBottom: 28,
        overflow: "hidden",
    },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 14,
        letterSpacing: -0.3,
        paddingHorizontal: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
        paddingHorizontal: 8,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 24,
        marginBottom: 20,
    },
    dot: {
        height: 8,
        borderRadius: 999,
    },
    nextBtn: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
    },
    nextText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.1,
    },
});