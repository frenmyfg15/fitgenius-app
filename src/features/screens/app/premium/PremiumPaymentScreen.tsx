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
import { X, XCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useUsuarioStore,
  UsuarioLogin,
} from "@/features/store/useUsuarioStore";

import { LinearGradient } from "expo-linear-gradient";

const PRICE = "4,99 €";
const BILLING_HINT = "Cancela cuando quieras";

// 🎨 Tema premium adaptable
const getPremiumTheme = (isDark: boolean) => ({
  background: isDark ? "#020617" : "#F8FAFC",

  cardBg: isDark ? "rgba(15,23,42,0.96)" : "#FFFFFF",
  cardSoftBg: isDark ? "rgba(15,23,42,0.86)" : "#FFFFFF",
  cardBorder: isDark ? "rgba(148,163,184,0.28)" : "rgba(15,23,42,0.06)",

  textPrimary: isDark ? "#F9FAFB" : "#0F172A",
  textSecondary: isDark ? "#9CA3AF" : "#475569",
  textSoft: isDark ? "#6B7280" : "#94A3B8",

  badgeMutedText: isDark ? "#9CA3AF" : "#64748B",
  badgePositiveBg: isDark
    ? "rgba(34,197,94,0.20)"
    : "rgba(22,163,74,0.12)",
  badgePositiveText: isDark ? "#4ADE80" : "#16A34A",

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
        text1: "Pago completado",
        text2: "Tu suscripción Premium se activará en segundos.",
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
                Plan Premium
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HERO - NUEVO PREMIUM */}
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
            <Text
              style={[
                styles.heroLabel,
                { color: theme.heroLabel },
              ]}
            >
              Suscripción mensual
            </Text>

            <View style={styles.heroBottomRow}>
              <View>
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

                <Text
                  style={[
                    styles.billingHint,
                    { color: theme.textSoft },
                  ]}
                >
                  {BILLING_HINT}. Sin permanencia.
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* COMPARATIVA FREE VS PREMIUM */}
        <View
          style={[
            styles.cardSoft,
            {
              backgroundColor: theme.cardSoftBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitleSmall,
              { color: theme.textPrimary },
            ]}
          >
            Qué incluye cada plan
          </Text>

          {/* Sesiones */}
          <CompareRow
            label="Registrar sesiones"
            free="Sí (con anuncio)"
            premium="Sí, sin anuncios"
          />

          {/* Rutinas manuales */}
          <CompareRow
            label="Crear rutinas manuales"
            free="Sí (con anuncio al guardar)"
            premium="Sí, sin anuncios"
          />

          <CompareRow
            label="Guardar y editar rutinas"
            free="Sí (con anuncio al guardar)"
            premium="Sí, sin anuncios"
          />

          {/* Exploración ejercicios */}
          <CompareRow
            label="Buscar ejercicios y compuestos"
            free="Sí"
            premium="Sí"
          />

          {/* Rutinas IA */}
          <CompareRow
            label="Rutinas con IA"
            free="1 rutina gratis"
            premium="Ilimitadas"
          />

          {/* Coach */}
          <CompareRow
            label="Coach inteligente (revisión de sesión)"
            free="No"
            premium="Sí"
          />

          {/* Preguntas IA */}
          <CompareRow
            label="Preguntas sobre ejercicios con IA"
            free="No"
            premium="Sí"
          />

          {/* Estadísticas */}
          <CompareRow
            label="Estadísticas de entreno"
            free="Todas (con anuncio diario)"
            premium="Todas, sin anuncios"
          />

          {/* Informes */}
          <CompareRow
            label="Informes de progreso"
            free="Algunos básicos"
            premium="Todos los informes avanzados"
          />
        </View>


        {/* CTA */}
        <View style={{ marginTop: 20 }}>
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
              <Text style={[styles.buttonText, { color: "#020617" }]}>
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
            {PRICE}/mes · Cancela cuando quieras desde tu perfil.
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
                  Activar Premium
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
                Cobraremos {PRICE} cada mes. Puedes cancelar en cualquier
                momento.
              </Text>

              {/* TARJETA */}
              <View style={{ marginTop: 14, marginBottom: 16 }}>
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
                  colors={["#22C55E", "#FACC15"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.ctaGradient,
                    {
                      opacity: loading || !cardComplete ? 0.7 : 1,
                      marginTop: 6,
                    },
                  ]}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        color="#020617"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.buttonText, { color: "#020617" }]}>
                        Procesando…
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.buttonText, { color: "#020617" }]}>
                      Guardar tarjeta y activar
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text
                style={[
                  styles.securityNote,
                  { color: theme.textSoft },
                ]}
              >
                Pagos seguros con Stripe. No almacenamos datos de tarjeta.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ============ Subcomponentes ============ */

function CompareRow({
  label,
  free,
  premium,
}: {
  label: string;
  free: string;
  premium: string;
}) {
  const isDark = useColorScheme() === "dark";
  const theme = getPremiumTheme(isDark);

  return (
    <View style={styles.simpleRow}>
      <Text
        style={[
          styles.simpleLabel,
          { color: theme.textPrimary },
        ]}
      >
        {label}
      </Text>

      {/* FREE */}
      <View style={styles.badgeMuted}>
        <Text
          style={[
            styles.badgeMutedText,
            { color: theme.badgeMutedText },
          ]}
        >
          {free}
        </Text>
      </View>

      {/* PREMIUM */}
      <View
        style={[
          styles.badgePositive,
          { backgroundColor: theme.badgePositiveBg },
        ]}
      >
        <Text
          style={[
            styles.badgePositiveText,
            { color: theme.badgePositiveText },
          ]}
        >
          {premium}
        </Text>
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
    paddingBottom: 28,
    paddingTop: 10,
  },

  /* Header */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logo: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },
  appName: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  appTagline: {
    fontSize: 12,
  },

  /* Hero */
  heroGradient: {
    borderRadius: 22,
    padding: 2,
    marginBottom: 18,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heroLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
  },
  priceUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  billingHint: {
    fontSize: 12,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
  },

  /* Comparativa */
  cardSoft: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitleSmall: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  simpleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },
  simpleLabel: {
    flex: 1.4,
    fontSize: 12,
  },
  badgeMuted: {
    flex: 0.9,
    alignItems: "center",
  },
  badgeMutedText: {
    fontSize: 11,
  },
  badgePositive: {
    flex: 0.9,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  badgePositiveText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* CTA */
  ctaWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },
  ctaGradient: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  securityNote: {
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.7)",
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 10,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
  },
});
