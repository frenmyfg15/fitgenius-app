import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Lock } from "lucide-react-native";
import type { AnalisisSeguimientoData } from "@/features/api/progreso.api";

type Props = {
    visible: boolean;
    applying?: boolean;
    lockedByPlan?: boolean;
    data: AnalisisSeguimientoData | null;
    onClose: () => void;
    onConfirm: () => void;
    onGoPremium?: () => void;
};

export default function SeguimientoInteligenteModal({
    visible,
    applying = false,
    lockedByPlan = false,
    data,
    onClose,
    onConfirm,
    onGoPremium,
}: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const colors = {
        overlay: "rgba(15,23,42,0.85)",
        bg: isDark ? "#020617" : "#FFFFFF",
        card: isDark ? "#0F172A" : "#F9FAFB",
        text: isDark ? "#E5E7EB" : "#0F172A",
        subtext: isDark ? "#94A3B8" : "#6B7280",
        primary: "#22C55E",
        primarySoft: "rgba(34,197,94,0.12)",
        primaryText: "#16A34A",
        border: isDark ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.08)",
        neutralPill: isDark ? "rgba(15,23,42,0.9)" : "#F3F4F6",
        lockColor: isDark ? "#FACC15" : "#D97706",
        lockedBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.06)",
        lockedBorder: isDark ? "rgba(255,255,255,0.09)" : "rgba(2,6,23,0.09)",
    };

    const decision = data?.decision ?? "INSIGHT";
    const isReemplazar = decision === "REEMPLAZAR";
    const buttonIsLocked = isReemplazar && lockedByPlan;

    const titulo =
        decision === "MANTENER" ? "Vas en la dirección correcta"
            : decision === "AJUSTAR" ? "Pequeños ajustes, grandes resultados"
                : decision === "REEMPLAZAR" ? "Es momento de una rutina mejor"
                    : "Seguimiento inteligente";

    const subtitulo =
        decision === "MANTENER" ? "Tu consistencia ya está marcando la diferencia."
            : decision === "AJUSTAR" ? "Vamos a alinear tu esfuerzo con lo que realmente te funciona."
                : decision === "REEMPLAZAR" ? "No se trata de empezar de cero, sino de empezar mejor."
                    : "Analizamos tu semana para ayudarte a avanzar con cabeza.";

    const ctaLabel = buttonIsLocked
        ? "Desbloquear IA"
        : decision === "AJUSTAR"
            ? "Ajustar mi rutina"
            : "Reinventar mi rutina";

    const handlePrimary = buttonIsLocked ? onGoPremium : onConfirm;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>

                    {!!data && (
                        <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
                            <Text style={[styles.pillText, { color: colors.primaryText }]}>
                                Seguimiento inteligente activo
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.title, { color: colors.text }]}>{titulo}</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitulo}</Text>
                    <Text style={[styles.message, { color: colors.subtext }]}>
                        {data?.mensaje ?? "Estamos revisando tu progreso para guiar tus próximos pasos."}
                    </Text>

                    {!!data && (
                        <View style={styles.statsBlock}>
                            <Text style={[styles.daysSummary, { color: colors.subtext }]}>
                                {data.diasCompletados}/{data.diasEsperados} días completados esta semana
                            </Text>
                            <View style={styles.statsRow}>
                                <StatBox label="Adherencia" value={`${data.adherencia}%`} colors={colors} />
                                <StatBox label="Estrés" value={String(data.estres)} colors={colors} />
                                <StatBox
                                    label="Progreso"
                                    value={`${data.progreso > 0 ? "+" : ""}${data.progreso}%`}
                                    colors={colors}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Pressable
                            onPress={onClose}
                            disabled={applying}
                            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.neutralPill }]}
                        >
                            <Text style={[styles.secondaryBtnText, { color: colors.subtext }]}>
                                Continuar más tarde
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handlePrimary}
                            disabled={applying}
                            style={[
                                styles.primaryBtn,
                                buttonIsLocked
                                    ? { backgroundColor: colors.lockedBg, borderWidth: 1, borderColor: colors.lockedBorder }
                                    : { backgroundColor: colors.primary, opacity: applying ? 0.85 : 1 },
                            ]}
                        >
                            {applying && !buttonIsLocked ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <View style={styles.primaryBtnContent}>
                                    {buttonIsLocked && (
                                        <Lock size={13} color={colors.lockColor} strokeWidth={2.2} />
                                    )}
                                    <Text style={[
                                        styles.primaryBtnText,
                                        buttonIsLocked && { color: colors.lockColor },
                                    ]}>
                                        {ctaLabel}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function StatBox({ label, value, colors }: { label: string; value: string; colors: any }) {
    return (
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
    container: { width: "100%", maxWidth: 420, borderRadius: 18, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 18, gap: 14 },
    pill: { alignSelf: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 4 },
    pillText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
    title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
    subtitle: { fontSize: 13, textAlign: "center" },
    message: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 4 },
    statsBlock: { marginTop: 6, gap: 8 },
    daysSummary: { fontSize: 12, textAlign: "center" },
    statsRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10 },
    statLabel: { fontSize: 11, marginBottom: 4 },
    statValue: { fontSize: 17, fontWeight: "700" },
    footer: { flexDirection: "row", gap: 10, marginTop: 8 },
    secondaryBtn: { flex: 1, minHeight: 44, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    secondaryBtnText: { fontSize: 13, fontWeight: "600" },
    primaryBtn: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    primaryBtnContent: { flexDirection: "row", alignItems: "center", gap: 6 },
    primaryBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});