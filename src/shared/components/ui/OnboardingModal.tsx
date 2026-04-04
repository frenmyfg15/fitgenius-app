// File: src/shared/components/ui/OnboardingModal.tsx
import React, { useRef, useState, useCallback, useEffect, memo } from "react";
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
    BarChart2,
    Sparkles,
    ListOrdered,
    BookOpen,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { marcarOnboardingVisto } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Grip icon (3 líneas horizontales) ─────────────────────────────────────────

function GripLines({ color }: { color: string }) {
    return (
        <View style={{ gap: 3 }}>
            {[0, 1, 2].map((i) => (
                <View
                    key={i}
                    style={{ width: 14, height: 1.5, borderRadius: 1, backgroundColor: color }}
                />
            ))}
        </View>
    );
}

// ── Mockup: Calendario semanal ─────────────────────────────────────────────────

const CalendarMockup = memo(function CalendarMockup({ isDark }: { isDark: boolean }) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.1, duration: 650, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const days = ["L", "M", "X", "J", "V", "S", "D"];
    const todayIdx = 3;
    const doneIdxs = [1, 2];

    const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const muted = isDark ? "#64748B" : "#94A3B8";

    return (
        <View style={{ width: "100%", gap: 10 }}>
            {/* Fila de días */}
            <View style={{ flexDirection: "row", gap: 4, justifyContent: "center" }}>
                {days.map((d, i) => {
                    const isToday = i === todayIdx;
                    const isDone = doneIdxs.includes(i);

                    const pill = (
                        <View
                            key={d}
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 9,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isToday
                                    ? "#22C55E"
                                    : isDone
                                    ? "rgba(34,197,94,0.14)"
                                    : bg,
                                borderWidth: 1,
                                borderColor: isToday
                                    ? "#22C55E"
                                    : isDone
                                    ? "rgba(34,197,94,0.30)"
                                    : border,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: "800",
                                    color: isToday ? "#fff" : isDone ? "#22C55E" : muted,
                                }}
                            >
                                {d}
                            </Text>
                            {isDone && (
                                <View
                                    style={{
                                        position: "absolute",
                                        bottom: 3,
                                        width: 3,
                                        height: 3,
                                        borderRadius: 2,
                                        backgroundColor: "#22C55E",
                                    }}
                                />
                            )}
                        </View>
                    );

                    if (isToday) {
                        return (
                            <Animated.View key={d} style={{ transform: [{ scale: pulse }] }}>
                                {pill}
                            </Animated.View>
                        );
                    }
                    return <View key={d}>{pill}</View>;
                })}
            </View>

            {/* Mini tarjeta de ejercicio */}
            <View
                style={{
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: bg,
                    borderWidth: 1,
                    borderColor: border,
                }}
            >
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: "rgba(34,197,94,0.14)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Dumbbell size={16} color="#22C55E" strokeWidth={2} />
                </View>
                <View style={{ gap: 3 }}>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isDark ? "#F1F5F9" : "#0F172A",
                        }}
                    >
                        Sentadilla
                    </Text>
                    <Text style={{ fontSize: 10, color: muted }}>4 series · 10 reps · 80 kg</Text>
                </View>
            </View>
        </View>
    );
});

// ── Mockup: Desliza para reemplazar ───────────────────────────────────────────

const SwipeMockup = memo(function SwipeMockup({ isDark }: { isDark: boolean }) {
    const slideX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.delay(500),
                Animated.timing(slideX, { toValue: -72, duration: 380, useNativeDriver: true }),
                Animated.delay(1000),
                Animated.timing(slideX, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.delay(400),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const muted = isDark ? "#64748B" : "#94A3B8";

    return (
        <View style={{ width: "100%", gap: 8 }}>
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                    color: muted,
                    textAlign: "center",
                }}
            >
                DESLIZA PARA REEMPLAZAR
            </Text>

            <View style={{ height: 64, overflow: "hidden", borderRadius: 14 }}>
                {/* Botón verde detrás */}
                <View
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 76,
                        backgroundColor: "rgba(34,197,94,0.14)",
                        borderWidth: 1,
                        borderColor: "rgba(34,197,94,0.30)",
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text
                        style={{ fontSize: 9, fontWeight: "800", color: "#22C55E", textAlign: "center" }}
                    >
                        Reemplazar
                    </Text>
                </View>

                {/* Tarjeta que se desliza */}
                <Animated.View
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        transform: [{ translateX: slideX }],
                        borderRadius: 14,
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor: isDark ? "#0F1829" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: border,
                    }}
                >
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "rgba(168,85,247,0.14)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Dumbbell size={16} color="#a855f7" strokeWidth={2} />
                    </View>
                    <View style={{ gap: 3 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: isDark ? "#F1F5F9" : "#0F172A",
                            }}
                        >
                            Press Banca
                        </Text>
                        <Text style={{ fontSize: 10, color: muted }}>3 series · 12 reps · 60 kg</Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
});

// ── Mockup: Reordenar ejercicios (NUEVO) ──────────────────────────────────────

const ReorderMockup = memo(function ReorderMockup({ isDark }: { isDark: boolean }) {
    const moveY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.delay(500),
                Animated.parallel([
                    Animated.timing(scale, { toValue: 1.04, duration: 180, useNativeDriver: true }),
                    Animated.timing(moveY, { toValue: -50, duration: 420, useNativeDriver: true }),
                ]),
                Animated.delay(700),
                Animated.parallel([
                    Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
                    Animated.timing(moveY, { toValue: 0, duration: 340, useNativeDriver: true }),
                ]),
                Animated.delay(500),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const items = ["Sentadilla", "Peso muerto", "Zancadas"];
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const muted = isDark ? "#64748B" : "#94A3B8";

    return (
        <View style={{ width: "100%", gap: 6 }}>
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                    color: muted,
                    textAlign: "center",
                    marginBottom: 2,
                }}
            >
                MANTÉN PULSADO Y ARRASTRA
            </Text>

            {items.map((name, i) => {
                const isMoving = i === 1;
                return (
                    <Animated.View
                        key={name}
                        style={[
                            {
                                borderRadius: 12,
                                padding: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: isMoving
                                    ? isDark
                                        ? "#1a2540"
                                        : "#F0FDF4"
                                    : isDark
                                    ? "#0F1829"
                                    : "#FFFFFF",
                                borderWidth: 1,
                                borderColor: isMoving ? "rgba(34,197,94,0.35)" : border,
                            },
                            isMoving && {
                                transform: [{ translateY: moveY }, { scale }],
                                shadowColor: "#000",
                                shadowOpacity: 0.18,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 6,
                                zIndex: 10,
                            },
                        ]}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: isMoving ? "#22C55E" : muted,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: isMoving
                                        ? "#22C55E"
                                        : isDark
                                        ? "#F1F5F9"
                                        : "#0F172A",
                                }}
                            >
                                {name}
                            </Text>
                        </View>
                        <GripLines color={isMoving ? "#22C55E" : muted} />
                    </Animated.View>
                );
            })}
        </View>
    );
});

// ── Mockup: Gestiona tus rutinas ──────────────────────────────────────────────

const RutinasMockup = memo(function RutinasMockup({ isDark }: { isDark: boolean }) {
    const pulse = useRef(new Animated.Value(0.65)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.65, duration: 550, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const muted = isDark ? "#64748B" : "#94A3B8";
    const dias = [
        { label: "Lunes", count: 4 },
        { label: "Miércoles", count: 5 },
        { label: "Viernes", count: 3 },
    ];

    return (
        <View style={{ width: "100%", gap: 7 }}>
            {dias.map((d) => (
                <View
                    key={d.label}
                    style={{
                        borderRadius: 10,
                        padding: 11,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: bg,
                        borderWidth: 1,
                        borderColor: border,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isDark ? "#F1F5F9" : "#0F172A",
                        }}
                    >
                        {d.label}
                    </Text>
                    <Text style={{ fontSize: 10, color: muted }}>{d.count} ejercicios</Text>
                </View>
            ))}

            {/* Hint tab Rutinas */}
            <Animated.View
                style={{
                    opacity: pulse,
                    marginTop: 2,
                    borderRadius: 10,
                    padding: 10,
                    alignItems: "center",
                    backgroundColor: "rgba(34,197,94,0.10)",
                    borderWidth: 1,
                    borderColor: "rgba(34,197,94,0.28)",
                }}
            >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#22C55E" }}>
                    Rutinas → tu rutina → Editar día
                </Text>
            </Animated.View>
        </View>
    );
});

// ── Mockup: Progreso ──────────────────────────────────────────────────────────

const ProgressMockup = memo(function ProgressMockup({ isDark }: { isDark: boolean }) {
    const anims = useRef([0, 0, 0, 0, 0].map(() => new Animated.Value(0))).current;
    const targetHeights = [0.6, 0.85, 0.45, 0.95, 0.7];
    const colors = ["#3b82f6", "#22C55E", "#f59e0b", "#22C55E", "#a855f7"];
    const days = ["L", "M", "X", "J", "V"];

    useEffect(() => {
        const fill = anims.map((a, i) =>
            Animated.timing(a, {
                toValue: targetHeights[i],
                duration: 550 + i * 80,
                useNativeDriver: false,
            })
        );
        const reset = anims.map((a) =>
            Animated.timing(a, { toValue: 0, duration: 280, useNativeDriver: false })
        );

        const anim = Animated.loop(
            Animated.sequence([
                Animated.stagger(70, fill),
                Animated.delay(1400),
                Animated.parallel(reset),
                Animated.delay(350),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const muted = isDark ? "#64748B" : "#94A3B8";

    return (
        <View
            style={{
                width: "100%",
                borderRadius: 14,
                padding: 14,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: border,
                gap: 10,
            }}
        >
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                    color: muted,
                }}
            >
                VOLUMEN SEMANAL
            </Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 56 }}>
                {anims.map((anim, i) => (
                    <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                        <Animated.View
                            style={{
                                width: "100%",
                                height: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [2, 48],
                                }),
                                backgroundColor: colors[i],
                                borderRadius: 4,
                                opacity: 0.85,
                            }}
                        />
                        <Text style={{ fontSize: 9, fontWeight: "600", color: muted }}>
                            {days[i]}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
});

// ── Slides ────────────────────────────────────────────────────────────────────

type SlideData = {
    icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    iconColor: string;
    title: string;
    description: string;
    Mockup: React.FC<{ isDark: boolean }> | null;
};

const SLIDES: SlideData[] = [
    {
        icon: Sparkles,
        iconColor: "#22c55e",
        title: "¡Tu rutina está lista!",
        description:
            "Nuestra IA ha creado una rutina personalizada basada en tu perfil, objetivo y equipamiento. Ya puedes empezar a entrenar.",
        Mockup: null,
    },
    {
        icon: CalendarDays,
        iconColor: "#3b82f6",
        title: "Tu semana de un vistazo",
        description:
            "El calendario muestra tu semana. Los días completados quedan marcados. Toca cualquier día para ver su entrenamiento.",
        Mockup: CalendarMockup,
    },
    {
        icon: Dumbbell,
        iconColor: "#a855f7",
        title: "Registra y reemplaza",
        description:
            "Toca un ejercicio para registrar tus series. Desliza la tarjeta hacia la izquierda para reemplazarlo por uno similar.",
        Mockup: SwipeMockup,
    },
    {
        icon: ListOrdered,
        iconColor: "#f59e0b",
        title: "Cambia el orden",
        description:
            "¿Quieres reordenar ejercicios? Ve a Rutinas, selecciona tu rutina, entra al día y mantén pulsado un ejercicio para arrastrarlo.",
        Mockup: ReorderMockup,
    },
    {
        icon: BookOpen,
        iconColor: "#22c55e",
        title: "Gestiona tus rutinas",
        description:
            "En Rutinas crea, edita o copia días enteros entre rutinas. Elige qué rutina usar como activa en cualquier momento.",
        Mockup: RutinasMockup,
    },
    {
        icon: BarChart2,
        iconColor: "#ec4899",
        title: "Sigue tu progreso",
        description:
            "En Estadísticas ve tu evolución semana a semana. En Perfil ajusta tu objetivo, peso y gestiona tu suscripción.",
        Mockup: ProgressMockup,
    },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

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
                Animated.timing(iconScale, { toValue: 0.7, duration: 100, useNativeDriver: true }),
                Animated.timing(iconScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
                Animated.timing(iconScale, { toValue: 1, duration: 100, useNativeDriver: true }),
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
            if (usuario) setUsuario({ ...usuario, haVistoOnboarding: true });
            onClose();
        } catch (error) {
            console.log("[OnboardingModal] Error marcando onboarding visto", error);
        } finally {
            setSaving(false);
        }
    }, [saving, usuario, setUsuario, onClose]);

    const handleNext = useCallback(() => {
        if (saving) return;
        if (isLast) { handleClose(); return; }
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
    const MockupComponent = slide.Mockup;

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

                        <Animated.View
                            style={[styles.slideContent, { transform: [{ translateX }] }]}
                        >
                            {/* Icono (solo en slide sin mockup) */}
                            {!MockupComponent && (
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
                            )}

                            {/* Mockup animado */}
                            {MockupComponent && (
                                <View style={styles.mockupWrapper}>
                                    <MockupComponent isDark={isDark} />
                                </View>
                            )}

                            <Text style={[styles.title, { color: textPrimary }]}>
                                {slide.title}
                            </Text>
                            <Text style={[styles.description, { color: textSecondary }]}>
                                {slide.description}
                            </Text>
                        </Animated.View>

                        {/* Dots */}
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

                        <TouchableOpacity
                            onPress={handleNext}
                            activeOpacity={0.88}
                            disabled={saving}
                        >
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

// ── Estilos ───────────────────────────────────────────────────────────────────

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
        paddingVertical: 12,
        minHeight: 300,
        justifyContent: "center",
        gap: 14,
    },
    iconWrap: {
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 4,
    },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    mockupWrapper: {
        width: "100%",
        marginBottom: 4,
    },
    title: {
        fontSize: 21,
        fontWeight: "800",
        textAlign: "center",
        letterSpacing: -0.3,
        paddingHorizontal: 8,
    },
    description: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        paddingHorizontal: 8,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 20,
        marginBottom: 16,
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
