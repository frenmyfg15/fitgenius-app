// File: src/shared/components/estadistica/ProgresoMuscularCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";

// ── Tokens ────────────────────────────────────────────────────────────────────
const tokens = {
    color: {
        gradientStart: "rgb(0,255,64)",
        gradientMid: "rgb(94,230,157)",
        gradientEnd: "rgb(178,0,255)",

        cardBgDark: "rgba(15,24,41,1)",
        cardBgLight: "#FFFFFF",
        cardBorderDark: "rgba(255,255,255,0.08)",
        cardBorderLight: "rgba(0,0,0,0.06)",

        emptyIconBgDark: "rgba(255,255,255,0.08)",
        emptyIconBgLight: "#F1F5F9",

        kpiBgDark: "rgba(255,255,255,0.05)",
        kpiBgLight: "rgba(255,255,255,0.80)",
        kpiBorderDark: "rgba(255,255,255,0.09)",
        kpiBorderLight: "#E2E8F0",

        rowBorderDark: "rgba(255,255,255,0.06)",
        rowBorderLight: "rgba(0,0,0,0.05)",

        textPrimaryDark: "#F1F5F9",
        textPrimaryLight: "#0F172A",
        textSecondaryDark: "#64748B",
        textSecondaryLight: "#64748B",
        textMutedDark: "#94A3B8",
        textMutedLight: "#475569",

        subiendo: "#22C55E",
        bajando: "#EF4444",
        estable: "#94A3B8",

        barBgDark: "rgba(255,255,255,0.07)",
        barBgLight: "rgba(0,0,0,0.06)",
    },
    radius: { lg: 16, md: 12, sm: 8, full: 999 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
    tokens.color.gradientStart,
    tokens.color.gradientMid,
    tokens.color.gradientEnd,
] as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type ProgresoGrupo = {
    grupoMuscular: string;
    volumenSemana1: number;
    volumenSemana2: number;
    cambio: number;
    tendencia: "SUBIENDO" | "BAJANDO" | "ESTABLE" | "SIN_DATOS";
};

type Props = {
    grupos?: ProgresoGrupo[];
    grupoMasProgresado?: string | null;
    grupoMasEstancado?: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const NOMBRES: Record<string, string> = {
    PECHOS: "Pecho",
    ESPALDA: "Espalda",
    HOMBROS: "Hombros",
    BRAZOS: "Brazos",
    PIERNAS: "Piernas",
    CORE: "Core",
    CARDIO: "Cardio",
    OTROS: "Otros",
};

function nombreGrupo(g: string): string {
    return NOMBRES[g] ?? g.charAt(0) + g.slice(1).toLowerCase();
}

function colorTendencia(t: ProgresoGrupo["tendencia"]): string {
    if (t === "SUBIENDO") return tokens.color.subiendo;
    if (t === "BAJANDO") return tokens.color.bajando;
    return tokens.color.estable;
}

function barWidth(cambio: number): number {
    // Normaliza el cambio a un porcentaje de barra entre 0 y 100
    const abs = Math.min(Math.abs(cambio), 100);
    return abs;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProgresoMuscularCard({
    grupos = [],
    grupoMasProgresado,
    grupoMasEstancado,
}: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const conDatos = grupos.filter((g) => g.tendencia !== "SIN_DATOS");
    const noData = conDatos.length === 0;

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.frame}
            >
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                            borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
                        },
                    ]}
                >
                    {noData ? (
                        <EmptyState isDark={isDark} />
                    ) : (
                        <CardBody
                            isDark={isDark}
                            grupos={conDatos}
                            grupoMasProgresado={grupoMasProgresado}
                            grupoMasEstancado={grupoMasEstancado}
                        />
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
    isDark,
    grupos,
    grupoMasProgresado,
    grupoMasEstancado,
}: {
    isDark: boolean;
    grupos: ProgresoGrupo[];
    grupoMasProgresado?: string | null;
    grupoMasEstancado?: string | null;
}) {
    const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
    const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

    return (
        <View style={styles.cardBody}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>
                        Progreso muscular
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
                        Esta semana vs semana anterior
                    </Text>
                </View>
            </View>

            {/* Lista de grupos */}
            <View style={styles.lista}>
                {grupos.map((g, i) => (
                    <GrupoFila
                        key={g.grupoMuscular}
                        grupo={g}
                        isDark={isDark}
                        isLast={i === grupos.length - 1}
                    />
                ))}
            </View>

            {/* KPIs — mejor y peor grupo */}
            {(grupoMasProgresado || grupoMasEstancado) && (
                <View style={styles.footer}>
                    {grupoMasProgresado && (
                        <Kpi
                            label="Más progresado"
                            value={nombreGrupo(grupoMasProgresado)}
                            color={tokens.color.subiendo}
                            isDark={isDark}
                        />
                    )}
                    {grupoMasEstancado && grupoMasEstancado !== grupoMasProgresado && (
                        <Kpi
                            label="Más estancado"
                            value={nombreGrupo(grupoMasEstancado)}
                            color={tokens.color.bajando}
                            isDark={isDark}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

// ── GrupoFila ─────────────────────────────────────────────────────────────────
function GrupoFila({
    grupo,
    isDark,
    isLast,
}: {
    grupo: ProgresoGrupo;
    isDark: boolean;
    isLast: boolean;
}) {
    const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
    const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;
    const color = colorTendencia(grupo.tendencia);
    const bw = barWidth(grupo.cambio);
    const esBajando = grupo.tendencia === "BAJANDO";

    return (
        <View
            style={[
                styles.fila,
                !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark
                        ? tokens.color.rowBorderDark
                        : tokens.color.rowBorderLight,
                },
            ]}
        >
            {/* Nombre + barra */}
            <View style={styles.filaIzq}>
                <Text style={[styles.filaGrupo, { color: textPrimary }]}>
                    {nombreGrupo(grupo.grupoMuscular)}
                </Text>
                <View style={[styles.barBg, { backgroundColor: isDark ? tokens.color.barBgDark : tokens.color.barBgLight }]}>
                    <View
                        style={[
                            styles.barFill,
                            {
                                width: `${bw}%`,
                                backgroundColor: color,
                                opacity: 0.75,
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Cambio + icono */}
            <View style={styles.filaDer}>
                <TendenciaIcon tendencia={grupo.tendencia} color={color} />
                <Text style={[styles.filaCambio, { color }]}>
                    {grupo.cambio > 0 ? "+" : ""}
                    {grupo.cambio}%
                </Text>
            </View>
        </View>
    );
}

// ── TendenciaIcon ─────────────────────────────────────────────────────────────
function TendenciaIcon({
    tendencia,
    color,
}: {
    tendencia: ProgresoGrupo["tendencia"];
    color: string;
}) {
    if (tendencia === "SUBIENDO") return <TrendingUp size={13} color={color} strokeWidth={2.2} />;
    if (tendencia === "BAJANDO") return <TrendingDown size={13} color={color} strokeWidth={2.2} />;
    return <Minus size={13} color={color} strokeWidth={2.2} />;
}

// ── Kpi ───────────────────────────────────────────────────────────────────────
function Kpi({
    label,
    value,
    color,
    isDark,
}: {
    label: string;
    value: string;
    color: string;
    isDark: boolean;
}) {
    const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

    return (
        <View
            style={[
                styles.kpi,
                {
                    backgroundColor: isDark ? tokens.color.kpiBgDark : tokens.color.kpiBgLight,
                    borderColor: isDark ? tokens.color.kpiBorderDark : tokens.color.kpiBorderLight,
                },
            ]}
        >
            <Text style={[styles.kpiLabel, { color: textMuted }]}>{label}</Text>
            <Text style={[styles.kpiValue, { color }]}>{value}</Text>
        </View>
    );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
    const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textMutedLight;
    const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

    return (
        <View style={styles.emptyState}>
            <View
                style={[
                    styles.emptyIcon,
                    {
                        backgroundColor: isDark
                            ? tokens.color.emptyIconBgDark
                            : tokens.color.emptyIconBgLight,
                    },
                ]}
            >
                <Text style={styles.emptyIconText}>💪</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                Sin datos suficientes
            </Text>
            <Text style={[styles.emptySubtitle, { color: textMuted }]}>
                Registra sesiones dos semanas seguidas para ver tu evolución por grupo muscular.
            </Text>
        </View>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { width: "100%", maxWidth: 520 },

    frame: {
        borderRadius: tokens.radius.lg,
        padding: 1.5,
        overflow: "hidden",
    },

    card: {
        borderRadius: tokens.radius.lg - 1,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    cardBody: {
        borderRadius: tokens.radius.lg - 1,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: tokens.spacing.lg,
        paddingTop: tokens.spacing.xl,
        paddingBottom: tokens.spacing.md,
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },

    lista: {
        paddingHorizontal: tokens.spacing.lg,
        paddingBottom: tokens.spacing.sm,
    },

    fila: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: tokens.spacing.sm + 2,
        gap: tokens.spacing.md,
    },

    filaIzq: {
        flex: 1,
        gap: tokens.spacing.xs,
    },

    filaGrupo: {
        fontSize: 13,
        fontWeight: "600",
    },

    barBg: {
        height: 4,
        borderRadius: tokens.radius.full,
        overflow: "hidden",
    },

    barFill: {
        height: 4,
        borderRadius: tokens.radius.full,
    },

    filaDer: {
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacing.xs,
        minWidth: 52,
        justifyContent: "flex-end",
    },

    filaCambio: {
        fontSize: 13,
        fontWeight: "700",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: tokens.spacing.xl,
        paddingBottom: tokens.spacing.lg,
        paddingTop: tokens.spacing.sm,
        gap: tokens.spacing.md,
    },

    kpi: {
        flex: 1,
        borderRadius: tokens.radius.md,
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: tokens.spacing.sm,
        borderWidth: 1,
    },
    kpiLabel: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        textAlign: "center",
    },
    kpiValue: {
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 2,
    },

    emptyState: {
        borderRadius: tokens.radius.lg - 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: tokens.spacing.xl + tokens.spacing.lg,
        paddingHorizontal: tokens.spacing.xl,
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: tokens.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: tokens.spacing.lg,
    },
    emptyIconText: { fontSize: 28 },
    emptyTitle: { fontSize: 14, fontWeight: "600" },
    emptySubtitle: {
        fontSize: 12,
        marginTop: tokens.spacing.xs,
        textAlign: "center",
        lineHeight: 18,
    },
});