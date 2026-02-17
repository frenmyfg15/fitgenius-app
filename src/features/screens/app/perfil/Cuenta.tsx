// File: src/features/cuenta/Cuenta.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import {
  LogOut,
  Settings,
  Lock,
  UserX,
  XOctagon,
  RefreshCcw,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import PremiumMiniCTACard from "@/shared/components/ui/PremiumCTA";
import Experiencia from "@/shared/components/cuenta/Experiencia";
import Perfil from "@/shared/components/cuenta/Perfil";
import IMCVisual from "@/shared/components/ui/IMCVisual";
import GastoCalorico from "@/shared/components/ui/GastoCalorico";
import PesoIdeal from "@/shared/components/ui/PesoIdeal";
import TasaMetabolicaBasal from "@/shared/components/ui/TasaMetabolicaBasal";
import PesoObjetivoProgreso from "@/shared/components/ui/PesoObjetivoProgreso";
import { useCuenta } from "@/shared/hooks/useCuenta";
import {
  cancelPremiumSubscription,
  reactivatePremiumSubscription,
} from "@/features/api/stripe.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { getMe } from "@/features/api/usuario.api";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",

    // Card de suscripción
    subCardBgDark: "rgba(15,24,41,0.60)",
    subCardBgLight: "rgba(248,250,252,0.95)",
    subCardBorderDark: "rgba(255,255,255,0.08)",
    subCardBorderLight: "rgba(0,0,0,0.07)",

    // Botón "Actualizar estado" dentro del card
    refreshBgDark: "rgba(255,255,255,0.06)",
    refreshBgLight: "rgba(15,23,42,0.04)",
    refreshBorderDark: "rgba(255,255,255,0.09)",
    refreshBorderLight: "rgba(0,0,0,0.07)",

    // Botones de acción
    actionBgDark: "rgba(15,24,41,0.60)",
    actionBgLight: "#FFFFFF",
    actionBorderDark: "rgba(255,255,255,0.08)",
    actionBorderLight: "rgba(0,0,0,0.08)",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "rgba(241,245,249,0.70)",
    textSecondaryLight: "rgba(15,23,42,0.70)",

    // Iconos
    iconDark: "#CBD5E1",
    iconLight: "#475569",

    // Danger
    danger: "#DC2626",
    dangerBorder: "rgba(220,38,38,0.30)",

    // Trial (verde)
    trialDark: "#86EFAC",
    trialLight: "#166534",
  },
  radius: { lg: 14, md: 12 },
  spacing: { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 80 },
} as const;

// ── Utils — sin cambios ───────────────────────────────────────────────────────
function formatDateMaybe(raw: any) {
  if (!raw) return null;
  const d = raw instanceof Date ? raw
    : typeof raw === "number" ? new Date(raw)
      : new Date(String(raw));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Cuenta() {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { isDark, isPremium, haPagado, closing, go, cerrarSesion, usuario } = useCuenta();
  const setUsuario = useUsuarioStore((s) => s.setUsuario);

  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [refreshingMe, setRefreshingMe] = useState(false);

  const yaCancelado = usuario?.stripeCancelAtPeriodEnd === true;
  const periodEndText = useMemo(() => formatDateMaybe((usuario as any)?.stripeCurrentPeriodEnd), [usuario]);
  const trialEndText = useMemo(() => formatDateMaybe((usuario as any)?.stripeTrialEndsAt), [usuario]);

  const refreshMe = async () => {
    if (refreshingMe) return null;
    try {
      setRefreshingMe(true);
      const me = await getMe();
      if (me?.id) setUsuario(me as any);
      return me;
    } catch (e: any) {
      console.log("[Cuenta] getMe failed:", e?.response?.data ?? e?.message ?? e);
      Toast.show({ type: "error", text1: "No se pudo actualizar", text2: "Inténtalo de nuevo en unos minutos." });
      return null;
    } finally {
      setRefreshingMe(false);
    }
  };

  const applyStripePatch = (patch: Partial<any>) => {
    if (!usuario?.id) return;
    setUsuario({ ...(usuario as any), ...patch });
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancelar suscripción",
      "¿Seguro que quieres cancelar tu suscripción Premium? Seguirás teniendo acceso hasta el final del periodo actual.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              const res = await cancelPremiumSubscription();
              console.log("[Cuenta] Suscripción cancelada:", res);
              applyStripePatch({
                stripeCancelAtPeriodEnd: true,
                stripeCurrentPeriodEnd: res.currentPeriodEnd ?? (usuario as any)?.stripeCurrentPeriodEnd,
                stripeStatus: (usuario as any)?.stripeStatus ?? "ACTIVE",
              });
              await refreshMe();
              Toast.show({ type: "success", text1: "Suscripción cancelada", text2: "Seguirás teniendo acceso hasta el final del periodo actual." });
            } catch (e: any) {
              console.warn("[Cuenta] Error al cancelar suscripción", e);
              Toast.show({ type: "error", text1: "No se pudo cancelar", text2: e?.message || "Inténtalo de nuevo en unos minutos." });
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = () => {
    Alert.alert(
      "Reactivar suscripción",
      "Tu suscripción está programada para cancelarse. ¿Quieres reactivarla y mantener Premium activo?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, reactivar",
          style: "default",
          onPress: async () => {
            try {
              setReactivating(true);
              const res = await reactivatePremiumSubscription();
              console.log("[Cuenta] Suscripción reactivada:", res);
              applyStripePatch({
                stripeCancelAtPeriodEnd: false,
                stripeCurrentPeriodEnd: res.currentPeriodEnd ?? (usuario as any)?.stripeCurrentPeriodEnd,
                stripeStatus: (usuario as any)?.stripeStatus ?? "ACTIVE",
              });
              const me = await refreshMe();
              if (me?.id && (me as any)?.stripeCancelAtPeriodEnd === true) {
                setTimeout(() => refreshMe(), 1200);
              }
              Toast.show({ type: "success", text1: "Suscripción reactivada", text2: "Tu Premium seguirá activo y no se cancelará al final del periodo." });
            } catch (e: any) {
              console.warn("[Cuenta] Error al reactivar suscripción", e);
              Toast.show({ type: "error", text1: "No se pudo reactivar", text2: e?.message || "Inténtalo de nuevo en unos minutos." });
            } finally {
              setReactivating(false);
            }
          },
        },
      ]
    );
  };

  const showRenewal = isPremium && haPagado && !yaCancelado &&
    (usuario as any)?.stripeStatus &&
    ["ACTIVE", "TRIALING", "PAST_DUE", "UNPAID"].includes(String((usuario as any)?.stripeStatus));

  const showCancelInfo = isPremium && haPagado && yaCancelado;
  const showTrial = isPremium && haPagado && String((usuario as any)?.stripeStatus) === "TRIALING" && !!trialEndText;
  const showSubscriptionCard = showCancelInfo || showRenewal || showTrial;
  // ── Fin lógica original ───────────────────────────────────────────────────

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: bg }]}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: bg, paddingBottom: Platform.OS === "ios" ? 150 : 130 }]}
    >
      {/* CTA Premium (solo para usuarios free) */}
      {!isPremium && !haPagado && <PremiumMiniCTACard />}

      {/* Widgets de cuenta */}
      <Experiencia />
      <Perfil />
      <IMCVisual peso={usuario?.peso} altura={usuario?.altura} />
      <GastoCalorico
        peso={usuario?.peso}
        altura={usuario?.altura}
        edad={usuario?.edad}
        sexo={usuario?.sexo}
        actividadInicial={(usuario as any)?.actividadDiaria}
      />
      <PesoIdeal
        peso={usuario?.peso}
        altura={usuario?.altura}
        medidaPeso={usuario?.medidaPeso as "KG" | "LB"}
        medidaAltura={usuario?.medidaAltura as "CM" | "FT"}
      />
      <TasaMetabolicaBasal
        peso={usuario?.peso}
        altura={usuario?.altura}
        edad={usuario?.edad}
        sexo={usuario?.sexo}
        medidaPeso={usuario?.medidaPeso as "KG" | "LB"}
        medidaAltura={usuario?.medidaAltura as "CM" | "FT"}
      />

      <PesoObjetivoProgreso
        peso={usuario?.peso}
        objetivo={usuario?.pesoObjetivo}
        medidaPeso={usuario?.medidaPeso as "KG" | "LB"}
      />

      {/* Card de suscripción (si aplica) */}
      {showSubscriptionCard && (
        <View
          style={[
            styles.subCard,
            {
              backgroundColor: isDark ? tokens.color.subCardBgDark : tokens.color.subCardBgLight,
              borderColor: isDark ? tokens.color.subCardBorderDark : tokens.color.subCardBorderLight,
            },
          ]}
        >
          {showCancelInfo && (
            <>
              <Text style={[styles.subTitle, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
                Suscripción programada para cancelarse
              </Text>
              <Text style={[styles.subBody, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                {periodEndText ? `Se cancelará el ${periodEndText}.` : "Se cancelará al final del periodo actual."}{" "}
                Puedes reactivarla antes de esa fecha.
              </Text>
            </>
          )}

          {showRenewal && (
            <>
              <Text style={[styles.subTitle, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
                Premium activo
              </Text>
              <Text style={[styles.subBody, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                {periodEndText ? `Próxima renovación: ${periodEndText}.` : "Próxima renovación: al final del periodo actual."}
              </Text>
            </>
          )}

          {showTrial && (
            <Text style={[styles.subTrial, { color: isDark ? tokens.color.trialDark : tokens.color.trialLight }]}>
              Tu prueba termina el {trialEndText}
            </Text>
          )}
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionsWrapper}>
        <ActionButton onPress={() => go("EditarPerfil")} isDark={isDark}>
          <Settings size={17} color={isDark ? tokens.color.iconDark : tokens.color.iconLight} strokeWidth={2} />
          <Text style={[styles.actionText, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
            Configuración
          </Text>
        </ActionButton>

        <ActionButton onPress={() => go("CambiarContrasena")} isDark={isDark}>
          <Lock size={17} color={isDark ? tokens.color.iconDark : tokens.color.iconLight} strokeWidth={2} />
          <Text style={[styles.actionText, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
            Cambiar contraseña
          </Text>
        </ActionButton>

        {isPremium && haPagado && yaCancelado && (
          <ActionButton onPress={handleReactivateSubscription} isDark={isDark} loading={reactivating}>
            <RefreshCcw size={17} color={isDark ? tokens.color.iconDark : tokens.color.iconLight} strokeWidth={2} />
            <Text style={[styles.actionText, styles.actionTextBold, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
              {reactivating ? "Reactivando…" : "Reactivar suscripción"}
            </Text>
          </ActionButton>
        )}

        {isPremium && haPagado && !yaCancelado && (
          <ActionButton onPress={handleCancelSubscription} isDark={isDark} variant="danger" loading={canceling}>
            <XOctagon size={17} color={tokens.color.danger} strokeWidth={2} />
            <Text style={[styles.actionText, styles.actionTextBold, { color: tokens.color.danger }]}>
              {canceling ? "Cancelando…" : "Cancelar suscripción"}
            </Text>
          </ActionButton>
        )}

        <ActionButton onPress={() => go("EliminarCuenta")} isDark={isDark} variant="danger">
          <UserX size={17} color={tokens.color.danger} strokeWidth={2} />
          <Text style={[styles.actionText, styles.actionTextBold, { color: tokens.color.danger }]}>
            Dar de baja mi cuenta
          </Text>
        </ActionButton>

        <ActionButton onPress={cerrarSesion} isDark={isDark} loading={closing}>
          {closing
            ? <ActivityIndicator size="small" color={isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight} />
            : <LogOut size={17} color={isDark ? tokens.color.iconDark : tokens.color.iconLight} strokeWidth={2} />
          }
          <Text style={[styles.actionText, styles.actionTextBold, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
            Cerrar sesión
          </Text>
        </ActionButton>
      </View>
    </ScrollView>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({
  children, onPress, isDark, variant = "default", loading = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  isDark: boolean;
  variant?: "default" | "danger";
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
      style={[
        styles.actionBtn,
        {
          backgroundColor: isDark ? tokens.color.actionBgDark : tokens.color.actionBgLight,
          borderColor: variant === "danger" ? tokens.color.dangerBorder : isDark ? tokens.color.actionBorderDark : tokens.color.actionBorderLight,
          opacity: loading ? 0.65 : 1,
        },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing["2xl"],
    gap: tokens.spacing.xl,
  },

  // Card de suscripción
  subCard: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    gap: tokens.spacing.sm,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  subBody: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  subTrial: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Botón refresh dentro del card
  refreshBtn: {
    marginTop: 6,
    borderRadius: tokens.radius.md,
    paddingVertical: 10,
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Wrapper de acciones
  actionsWrapper: {
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },

  // Botón de acción
  actionBtn: {
    borderRadius: tokens.radius.lg,
    paddingVertical: 13,
    paddingHorizontal: tokens.spacing.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionTextBold: {
    fontWeight: "800",
  },
});