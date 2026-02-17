// src/features/premium/PremiumPaymentScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  useColorScheme,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";

import {
  createPremiumSubscription,
  CreatePremiumSubscriptionResponse,
} from "@/features/api/stripe.api";

import { useNavigation } from "@react-navigation/native";
import { X, XCircle, Check, Sparkles, Zap, TrendingUp } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useUsuarioStore,
  UsuarioLogin,
} from "@/features/store/useUsuarioStore";

import { LinearGradient } from "expo-linear-gradient";

const PRICE = "4,99 €";

// 🎨 Tema premium adaptable
const getPremiumTheme = (isDark: boolean) => ({
  background: isDark ? "#020617" : "#F8FAFC",

  cardBg: isDark ? "rgba(15,23,42,0.96)" : "#FFFFFF",
  cardSoftBg: isDark ? "rgba(15,23,42,0.86)" : "#FFFFFF",
  cardBorder: isDark ? "rgba(148,163,184,0.28)" : "rgba(15,23,42,0.06)",

  textPrimary: isDark ? "#F9FAFB" : "#0F172A",
  textSecondary: isDark ? "#9CA3AF" : "#475569",
  textSoft: isDark ? "#6B7280" : "#94A3B8",

  iconMuted: isDark ? "#6B7280" : "#94A3B8",
  iconPremium: isDark ? "#A855F7" : "#9333EA",

  badgeMutedBg: isDark ? "rgba(71,85,105,0.2)" : "rgba(226,232,240,0.6)",
  badgeMutedText: isDark ? "#9CA3AF" : "#64748B",
  badgeFreeBg: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
  badgeFreeText: isDark ? "#60A5FA" : "#2563EB",
  badgePremiumBg: isDark ? "rgba(168,85,247,0.20)" : "rgba(168,85,247,0.12)",
  badgePremiumText: isDark ? "#C084FC" : "#9333EA",

  heroLabel: isDark ? "#A5B4FC" : "#6366F1",

  gradientPrimary: ["#22C55E", "#A855F7"],
  gradientHero: ["#22C55E", "#A855F7", "#FACC15"],
});

export default function PremiumPaymentScreen() {
  const { confirmPayment } = useStripe();
  const navigation = useNavigation<any>();

  const isDark = useColorScheme() === "dark";
  const theme = getPremiumTheme(isDark);

  const { usuario, setUsuario } = useUsuarioStore();

  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  /* ========= PAGO ========= */

  const handlePay = async () => {
    if (!cardComplete) {
      const msg = "Completa los datos de la tarjeta antes de continuar.";
      setErrorMsg(msg);
      Toast.show({
        type: "error",
        text1: "Tarjeta incompleta",
        text2: msg,
      });
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data: CreatePremiumSubscriptionResponse =
        await createPremiumSubscription();

      const { clientSecret } = data;

      if (!clientSecret) {
        const msg = "Error: no se recibió clientSecret del servidor.";
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Error del servidor",
          text2: msg,
        });
        return;
      }

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        const msg = error.message ?? "Error con la tarjeta.";
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Pago fallido",
          text2: msg,
        });
        return;
      }

      const status = paymentIntent?.status?.toLowerCase();
      if (!["succeeded", "processing"].includes(status as string)) {
        const msg = `Pago no completado (estado: ${status}).`;
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Pago pendiente",
          text2: msg,
        });
        return;
      }

      // Actualizar usuario
      if (usuario) {
        const u: UsuarioLogin = {
          ...usuario,
          planActual: "PREMIUM",
          haPagado: true,
        };
        setUsuario(u);
      }

      Toast.show({
        type: "success",
        text1: "¡Bienvenido a Premium!",
        text2: "Tu suscripción se ha activado correctamente.",
      });

      setShowPayModal(false);
      navigation.goBack();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Error inesperado. Inténtalo de nuevo.";
      setErrorMsg(msg);
      Toast.show({
        type: "error",
        text1: "Error al procesar",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ========= UI ========= */

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.logoWrap,
                {
                  borderColor: isDark
                    ? "rgba(148,163,184,0.5)"
                    : "rgba(148,163,184,0.3)",
                },
              ]}
            >
              <Image
                source={require("../../../../../assets/logo.png")}
                style={styles.logo}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.appName,
                  { color: theme.textPrimary },
                ]}
              >
                fitgenius
              </Text>
              <Text
                style={[
                  styles.appTagline,
                  { color: theme.textSecondary },
                ]}
              >
                Desbloquea todo el potencial
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HERO - PRECIO PREMIUM */}
        <LinearGradient
          colors={theme.gradientHero as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View>
                <Text
                  style={[
                    styles.heroLabel,
                    { color: theme.heroLabel },
                  ]}
                >
                  FITGENIUS PREMIUM
                </Text>
                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.price,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {PRICE}
                  </Text>
                  <Text
                    style={[
                      styles.priceUnit,
                      { color: theme.textSoft },
                    ]}
                  >
                    / mes
                  </Text>
                </View>
              </View>

              <Sparkles size={32} color={theme.iconPremium} strokeWidth={1.5} />
            </View>

            <Text
              style={[
                styles.billingHint,
                { color: theme.textSoft },
              ]}
            >
              Sin permanencia · Cancela cuando quieras
            </Text>
          </View>
        </LinearGradient>

        {/* BENEFICIOS DESTACADOS */}
        <View
          style={[
            styles.benefitsCard,
            {
              backgroundColor: theme.cardSoftBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textPrimary },
            ]}
          >
            Lo que obtienes con Premium
          </Text>

          <BenefitItem
            icon={<Sparkles size={18} color={theme.iconPremium} />}
            title="Rutinas IA ilimitadas"
            description="Genera todas las rutinas personalizadas que necesites"
          />

          <BenefitItem
            icon={<Zap size={18} color={theme.iconPremium} />}
            title="Coach inteligente"
            description="Análisis y feedback personalizado de cada sesión"
          />

          <BenefitItem
            icon={<TrendingUp size={18} color={theme.iconPremium} />}
            title="Informes avanzados"
            description="Todos los informes de progreso sin límites"
          />

          <BenefitItem
            icon={<Check size={18} color={theme.iconPremium} />}
            title="Preguntas con IA"
            description="Consulta ejercicios y técnicas ilimitadamente"
          />
        </View>

        {/* COMPARATIVA DETALLADA */}
        <View
          style={[
            styles.compareCard,
            {
              backgroundColor: theme.cardSoftBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.compareHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.textPrimary, flex: 1 },
              ]}
            >
              Características
            </Text>
            <Text
              style={[
                styles.planLabel,
                { color: theme.badgeFreeText },
              ]}
            >
              Free
            </Text>
            <Text
              style={[
                styles.planLabel,
                { color: theme.badgePremiumText },
              ]}
            >
              Premium
            </Text>
          </View>

          <CompareRow
            label="Registrar sesiones"
            free="unlimited"
            premium="unlimited"
          />

          <CompareRow
            label="Crear rutinas manuales"
            free="unlimited"
            premium="unlimited"
          />

          <CompareRow
            label="Buscar ejercicios"
            free="unlimited"
            premium="unlimited"
          />

          <CompareRow
            label="Estadísticas básicas"
            free="unlimited"
            premium="unlimited"
          />

          <View style={styles.divider} />

          <CompareRow
            label="Rutinas con IA"
            free="limited"
            premium="unlimited"
          />

          <CompareRow
            label="Coach inteligente"
            free="none"
            premium="unlimited"
          />

          <CompareRow
            label="Preguntas sobre ejercicios"
            free="none"
            premium="unlimited"
          />

          <CompareRow
            label="Informes de progreso"
            free="limited"
            premium="unlimited"
          />
        </View>

        {/* CTA */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => setShowPayModal(true)}
            activeOpacity={0.9}
            style={styles.ctaWrapper}
          >
            <LinearGradient
              colors={theme.gradientPrimary as any}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                Activar Premium
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text
            style={[
              styles.securityNote,
              { color: theme.textSoft },
            ]}
          >
            Pago seguro · Sin permanencia · Cancela desde tu perfil
          </Text>
        </View>
      </ScrollView>

      {/* ============ PAYMENT MODAL ============ */}
      <Modal
        visible={showPayModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPayModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.modalHeaderRow}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.textPrimary },
                  ]}
                >
                  Método de pago
                </Text>

                <TouchableOpacity onPress={() => setShowPayModal(false)}>
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.modalSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Suscripción mensual por {PRICE}. Cancela cuando quieras sin compromisos.
              </Text>

              {/* TARJETA */}
              <View style={{ marginTop: 16, marginBottom: 18 }}>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: "1234 1234 1234 1234",
                  }}
                  cardStyle={{
                    backgroundColor: isDark ? "#020617" : "#FFFFFF",
                    textColor: isDark ? "#E5E7EB" : "#0F172A",
                    placeholderColor: theme.textSoft,
                  }}
                  style={{
                    width: "100%",
                    height: 52,
                  }}
                  onCardChange={(d) => {
                    setCardComplete(d.complete);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>

              {/* ERROR */}
              {!!errorMsg && (
                <View style={styles.errorRow}>
                  <XCircle
                    size={14}
                    color={isDark ? "#FCA5A5" : "#B91C1C"}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      { color: isDark ? "#FCA5A5" : "#B91C1C" },
                    ]}
                  >
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* BOTÓN PAGO */}
              <TouchableOpacity
                onPress={handlePay}
                disabled={loading || !cardComplete}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#22C55E", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.ctaGradient,
                    {
                      opacity: loading || !cardComplete ? 0.6 : 1,
                      marginTop: 0,
                    },
                  ]}
                >
                  {loading ? (
                    <View style={styles.buttonRow}>
                      <ActivityIndicator
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                        Procesando…
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                      Confirmar y activar Premium
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.securityBadge}>
                <Check size={12} color={theme.textSoft} />
                <Text
                  style={[
                    styles.securityBadgeText,
                    { color: theme.textSoft },
                  ]}
                >
                  Pago seguro con Stripe · No almacenamos datos bancarios
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ============ Subcomponentes ============ */

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const isDark = useColorScheme() === "dark";
  const theme = getPremiumTheme(isDark);

  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>{icon}</View>
      <View style={styles.benefitText}>
        <Text
          style={[
            styles.benefitTitle,
            { color: theme.textPrimary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.benefitDescription,
            { color: theme.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

function CompareRow({
  label,
  free,
  premium,
}: {
  label: string;
  free: "unlimited" | "limited" | "none";
  premium: "unlimited" | "limited" | "none";
}) {
  const isDark = useColorScheme() === "dark";
  const theme = getPremiumTheme(isDark);

  const renderBadge = (type: "unlimited" | "limited" | "none", isPremium: boolean) => {
    if (type === "unlimited") {
      return (
        <View style={styles.checkIcon}>
          <Check size={14} color={isPremium ? theme.badgePremiumText : theme.badgeFreeText} strokeWidth={3} />
        </View>
      );
    }
    if (type === "limited") {
      return (
        <View style={[styles.limitedBadge, { backgroundColor: theme.badgeMutedBg }]}>
          <Text style={[styles.limitedText, { color: theme.badgeMutedText }]}>1</Text>
        </View>
      );
    }
    return (
      <View style={styles.checkIcon}>
        <X size={14} color={theme.iconMuted} strokeWidth={2} />
      </View>
    );
  };

  return (
    <View style={styles.compareRow}>
      <Text
        style={[
          styles.compareLabel,
          { color: theme.textPrimary },
        ]}
      >
        {label}
      </Text>

      <View style={styles.compareValue}>
        {renderBadge(free, false)}
      </View>

      <View style={styles.compareValue}>
        {renderBadge(premium, true)}
      </View>
    </View>
  );
}

/* ===================== Styles ===================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 10,
  },

  /* Header */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logo: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 12,
    marginTop: 1,
  },

  /* Hero */
  heroGradient: {
    borderRadius: 24,
    padding: 2.5,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "600",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  billingHint: {
    fontSize: 12,
  },

  /* Benefits */
  benefitsCard: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(168,85,247,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    paddingTop: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  /* Compare */
  compareCard: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 8,
    borderWidth: 1,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.15)",
  },
  planLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    width: 60,
    textAlign: "center",
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  compareLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  compareValue: {
    width: 60,
    alignItems: "center",
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  limitedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  limitedText: {
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.15)",
    marginVertical: 8,
  },

  /* CTA */
  ctaWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },
  ctaGradient: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityNote: {
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 16,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.5)",
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 6,
    marginTop: 14,
  },
  securityBadgeText: {
    fontSize: 11,
    textAlign: "center",
  },
});