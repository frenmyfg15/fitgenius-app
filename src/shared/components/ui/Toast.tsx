// src/shared/components/ui/Toast.tsx
//
// Drop-in reemplazo de react-native-toast-message.
// API idéntica: Toast.show({ type, text1, text2 }) / Toast.hide()
// Montar <ToastProvider /> en el root (encima de todo).
//
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react-native";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning" | "neutral";

export interface ToastOptions {
    type?: ToastType;
    text1: string;
    text2?: string;
    /** ms antes de ocultarse automáticamente. Default: 3500 */
    duration?: number;
}

// ── Tokens (misma familia que Perfil.tsx) ─────────────────────────────────────

const TOKENS = {
    light: {
        cardBg: "#FFFFFF",
        cardBorder: "rgba(0,0,0,0.06)",
        shadow: "rgba(0,0,0,0.10)",
        textPrimary: "#0F172A",
        textSecondary: "#64748B",
        closeBg: "transparent",
        closeHoverBg: "#F1F5F9",
        closeIcon: "#94A3B8",
        types: {
            success: { iconBg: "#DCFCE7", iconColor: "#16A34A", border: "#BBF7D0" },
            error: { iconBg: "#FEE2E2", iconColor: "#DC2626", border: "#FECACA" },
            info: { iconBg: "#DBEAFE", iconColor: "#2563EB", border: "#BFDBFE" },
            warning: { iconBg: "#FEF9C3", iconColor: "#CA8A04", border: "#FDE68A" },
            neutral: { iconBg: "#F1F5F9", iconColor: "#64748B", border: "rgba(0,0,0,0.06)" },
        },
    },
    dark: {
        cardBg: "rgba(15,24,41,0.92)",
        cardBorder: "rgba(255,255,255,0.08)",
        shadow: "rgba(0,0,0,0.40)",
        textPrimary: "#F1F5F9",
        textSecondary: "#64748B",
        closeBg: "transparent",
        closeHoverBg: "rgba(255,255,255,0.06)",
        closeIcon: "#475569",
        types: {
            success: { iconBg: "rgba(22,163,74,0.15)", iconColor: "#4ADE80", border: "rgba(22,163,74,0.30)" },
            error: { iconBg: "rgba(220,38,38,0.15)", iconColor: "#F87171", border: "rgba(220,38,38,0.30)" },
            info: { iconBg: "rgba(37,99,235,0.15)", iconColor: "#60A5FA", border: "rgba(37,99,235,0.30)" },
            warning: { iconBg: "rgba(202,138,4,0.15)", iconColor: "#FACC15", border: "rgba(202,138,4,0.30)" },
            neutral: { iconBg: "rgba(255,255,255,0.06)", iconColor: "#94A3B8", border: "rgba(255,255,255,0.08)" },
        },
    },
} as const;

// ── Iconos por tipo ───────────────────────────────────────────────────────────

const ICON_SIZE = 16;

function ToastIcon({ type, color }: { type: ToastType; color: string }) {
    const props = { size: ICON_SIZE, color, strokeWidth: 2 };
    switch (type) {
        case "success": return <CheckCircle2 {...props} />;
        case "error": return <AlertCircle  {...props} />;
        case "info": return <Info         {...props} />;
        case "warning": return <AlertTriangle {...props} />;
        default: return <Bell         {...props} />;
    }
}

// ── Context + API estática ────────────────────────────────────────────────────

interface ToastContextValue {
    show: (opts: ToastOptions) => void;
    hide: () => void;
}

const ToastContext = createContext<ToastContextValue>({
    show: () => { },
    hide: () => { },
});

// Referencia global para usar Toast.show() desde fuera de React
let _globalShow: ((opts: ToastOptions) => void) | null = null;
let _globalHide: (() => void) | null = null;

export const Toast = {
    show: (opts: ToastOptions) => _globalShow?.(opts),
    hide: () => _globalHide?.(),
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const [visible, setVisible] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const insets = useSafeAreaInsets();

    const t = isDark ? TOKENS.dark : TOKENS.light;

    const hide = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => setVisible(false));
    }, [anim]);

    const show = useCallback(
        (opts: ToastOptions) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            setToast(opts);
            setVisible(true);

            anim.setValue(0);
            Animated.spring(anim, {
                toValue: 1,
                damping: 18,
                stiffness: 220,
                useNativeDriver: true,
            }).start();

            const duration = opts.duration ?? 3500;
            timerRef.current = setTimeout(hide, duration);
        },
        [anim, hide]
    );

    // Exponer globalmente
    useEffect(() => {
        _globalShow = show;
        _globalHide = hide;
        return () => {
            _globalShow = null;
            _globalHide = null;
        };
    }, [show, hide]);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 0],
    });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const type: ToastType = toast?.type ?? "neutral";
    const typeTokens = t.types[type];

    return (
        <ToastContext.Provider value={{ show, hide }}>
            {children}

            {visible && toast && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.container,
                        { top: insets.top + 12 },
                        { opacity, transform: [{ translateY }] },
                    ]}
                >
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: t.cardBg,
                                borderColor: t.cardBorder,
                                shadowColor: t.shadow,
                            },
                        ]}
                    >
                        {/* Icono */}
                        <View
                            style={[
                                styles.iconWrap,
                                {
                                    backgroundColor: typeTokens.iconBg,
                                    borderColor: typeTokens.border,
                                },
                            ]}
                        >
                            <ToastIcon type={type} color={typeTokens.iconColor} />
                        </View>

                        {/* Texto */}
                        <View style={styles.body}>
                            <Text
                                numberOfLines={1}
                                style={[styles.title, { color: t.textPrimary }]}
                            >
                                {toast.text1}
                            </Text>
                            {toast.text2 ? (
                                <Text
                                    numberOfLines={2}
                                    style={[styles.subtitle, { color: t.textSecondary }]}
                                >
                                    {toast.text2}
                                </Text>
                            ) : null}
                        </View>

                        {/* Cerrar */}
                        <TouchableOpacity
                            onPress={hide}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={[styles.closeBtn, { backgroundColor: t.closeBg }]}
                            activeOpacity={0.7}
                        >
                            <X size={12} color={t.closeIcon} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

// ── Hook (opcional, para uso dentro de componentes) ───────────────────────────

export function useToast() {
    return useContext(ToastContext);
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: "center",
    },
    card: {
        width: "100%",
        maxWidth: 400,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 8,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    body: {
        flex: 1,
        minWidth: 0,
        gap: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    subtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    closeBtn: {
        width: 22,
        height: 22,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
});