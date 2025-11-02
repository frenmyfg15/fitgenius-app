// src/features/premium/PremiumUpsell.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import * as Linking from "expo-linking";
import { Sparkles, Lock, Check, Star, ShieldCheck, X } from "lucide-react-native";
import { createStripeCheckout } from "@/features/api/stripe.api";

export type Benefit = { icon?: React.ReactNode; title: string; desc?: string };

export type PremiumUpsellProps = {
  isOpen?: boolean;
  mode?: "modal" | "inline";
  price?: string;
  billingHint?: string;
  benefits?: Benefit[];
  ctaLabel?: string;
  onClose?: () => void;

  plan?: "BASICO" | "PREMIUM";
  priceId?: string;
  trialDays?: number;
  successUrl?: string;
  cancelUrl?: string;
};

const defaultBenefits: Benefit[] = [
  { title: "Rutinas ilimitadas", desc: "Crea y guarda todas las que quieras." },
  { title: "Ejercicios premium desbloqueados", desc: "Accede al 100% del catálogo." },
  { title: "IA avanzada", desc: "Generaciones más rápidas y precisas." },
  { title: "Historial y progreso", desc: "Seguimiento completo y exportable." },
];

export default function PremiumUpsell({
  isOpen = false,
  mode = "modal",
  price = "€7,99/mes",
  billingHint = "Cancela cuando quieras",
  benefits = defaultBenefits,
  ctaLabel = "Obtener Premium",
  onClose,
  plan = "PREMIUM",
  priceId,
  trialDays,
  successUrl,
  cancelUrl,
}: PremiumUpsellProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

const handleCheckout = async () => {
  try {
    setSubmitting(true);
    setErrorMsg(null);

    // 👇 genera los deep links que redirigen de vuelta a tu app
    const finalSuccess = Linking.createURL("premium/success", {
      queryParams: { session_id: "{CHECKOUT_SESSION_ID}" },
    });
    const finalCancel = Linking.createURL("premium/cancel");

    // 👇 pide al backend crear la sesión de checkout con esas URLs
    const { url } = await createStripeCheckout({
      plan,
      priceId,
      trialDays,
      successUrl: finalSuccess,
      cancelUrl: finalCancel,
    });

    // 👇 abre Stripe Checkout (navegador externo)
    await Linking.openURL(url);
  } catch (e: any) {
    setErrorMsg(e?.message || "No se pudo iniciar el pago.");
  } finally {
    setSubmitting(false);
  }
};

  if (mode === "inline") {
    return (
      <InlineCard
        price={price}
        billingHint={billingHint}
        benefits={benefits}
        ctaLabel={ctaLabel}
        submitting={submitting}
        errorMsg={errorMsg}
        onCheckout={handleCheckout}
      />
    );
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <Content
        price={price}
        billingHint={billingHint}
        benefits={benefits}
        ctaLabel={ctaLabel}
        submitting={submitting}
        errorMsg={errorMsg}
        onCheckout={handleCheckout}
      />
    </ModalShell>
  );
}

/* ===================== Modal shell (RN) ===================== */
function ModalShell({
  isOpen,
  children,
  onClose,
}: {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, bounciness: 6, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(20);
    }
  }, [isOpen, opacity, translateY]);

  // Marco: vivo en light, discreto en dark
  const frameGradient = isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "rgba(255,255,255,0.96)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", opacity }}>
        {/* Cerrar al tocar el overlay */}
        <Pressable onPress={onClose} style={{ position: "absolute", inset: 0 }} />

        <Animated.View style={{ flex: 1, justifyContent: "flex-start", transform: [{ translateY }] }}>
          <View style={{ paddingHorizontal: 12, marginTop: 64 }}>
            {/*@ts-ignore*/}
            <LinearGradient colors={frameGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 1 }}>
              <View
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                }}
              >
                {/* botón cerrar */}
                <View style={{ position: "absolute", right: 10, top: 10, zIndex: 1 }}>
                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.8}
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    }}
                    accessibilityLabel="Cerrar"
                  >
                    <X size={16} color={isDark ? "#e5e7eb" : "#111827"} />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                  {children}
                </ScrollView>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ===================== Inline card ===================== */
function InlineCard({
  price,
  billingHint,
  benefits,
  ctaLabel,
  submitting,
  errorMsg,
  onCheckout,
}: {
  price: string;
  billingHint: string;
  benefits: Benefit[];
  ctaLabel: string;
  submitting: boolean;
  errorMsg: string | null;
  onCheckout: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const frameGradient = isDark ? ["#111a2b", "#0b1220", "#111a2b"] : ["#39ff14", "#14ff80", "#22c55e"];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "rgba(255,255,255,0.96)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

  return (
    /*@ts-ignore*/
    <LinearGradient colors={frameGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 1, width: "100%", alignSelf: "center" }}>
      <View style={{ borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, padding: 16 }}>
        <Content price={price} billingHint={billingHint} benefits={benefits} ctaLabel={ctaLabel} submitting={submitting} errorMsg={errorMsg} onCheckout={onCheckout} />
      </View>
    </LinearGradient>
  );
}

/* ===================== Core content ===================== */
function Content({
  price,
  billingHint,
  benefits,
  ctaLabel,
  submitting,
  errorMsg,
  onCheckout,
}: {
  price: string;
  billingHint: string;
  benefits: Benefit[];
  ctaLabel: string;
  submitting: boolean;
  errorMsg: string | null;
  onCheckout: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";

  return (
    <View style={{ gap: 14 }}>
      {/* Encabezado */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ height: 32, width: 32, borderRadius: 10, backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#111827", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="#fff" />
          </View>
          <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: "800", color: textPrimary }}>
            Desbloquea Premium
          </Text>
        </View>

        <Text style={{ color: textSecondary }}>
          Accede a todo el catálogo de ejercicios, IA avanzada y seguimiento completo de tu progreso.
        </Text>

        {/* Beneficios */}
        <View style={{ marginTop: 6, gap: 8 }}>
          {benefits.map((b, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ height: 20, width: 20, borderRadius: 6, backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                {b.icon ?? <Check size={14} color={isDark ? "#e5e7eb" : "#111827"} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textPrimary, fontWeight: "600" }}>{b.title}</Text>
                {b.desc ? <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>{b.desc}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Píldoras info */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8, alignItems: "center" }}>
          <Pill icon={<ShieldCheck size={16} color={isDark ? "#a3e635" : "#16a34a"} />}>Cancelación en 1 clic</Pill>
          <Pill icon={<Star size={16} color={isDark ? "#fde047" : "#f59e0b"} />}>4,9/5 valoración media</Pill>
          <Pill icon={<Lock size={16} color={isDark ? "#93c5fd" : "#2563eb"} />}>Pago seguro</Pill>
        </View>
      </View>

      {/* Precio + CTA */}
      <View style={{ marginTop: 4 }}>
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
            backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "rgba(255,255,255,0.85)",
            padding: 14,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, justifyContent: "space-between" }}>
            <Text style={{ fontSize: 26, fontWeight: "900", color: textPrimary }}>{price}</Text>
            <Text style={{ color: textSecondary }}>{billingHint}</Text>
          </View>

          {/* CTA con borde degradado (sobrio) */}
          <LinearGradient colors={["#39ff14", "#14ff80", "#22c55e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 14, padding: 1 }}>
            <TouchableOpacity
              onPress={onCheckout}
              disabled={submitting}
              activeOpacity={0.9}
              style={{
                borderRadius: 13,
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <>
                  <ActivityIndicator size="small" color={isDark ? "#e5e7eb" : "#111827"} />
                  <Text style={{ fontWeight: "700", color: isDark ? "#e5e7eb" : "#111827" }}>Redirigiendo…</Text>
                </>
              ) : (
                <>
                  <Sparkles size={18} color={isDark ? "#e5e7eb" : "#111827"} />
                  <Text style={{ fontWeight: "700", color: isDark ? "#e5e7eb" : "#111827" }}>{ctaLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {!!errorMsg && (
            <Text style={{ textAlign: "center", color: "#ef4444", fontSize: 12, marginTop: 6 }}>
              {errorMsg}
            </Text>
          )}

          <Text style={{ textAlign: "center", color: textSecondary, fontSize: 12, marginTop: 6 }}>
            Sin permanencia. Prueba hoy.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ===================== Pill ===================== */
function Pill({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#f8fafc",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
      }}
    >
      {icon}
      <Text style={{ color: isDark ? "#e5e7eb" : "#0f172a", fontSize: 12, fontWeight: "600" }}>
        {children}
      </Text>
    </View>
  );
}
