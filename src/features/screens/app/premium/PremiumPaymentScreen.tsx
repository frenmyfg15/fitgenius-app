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
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import {
  createPremiumSubscription,
  CreatePremiumSubscriptionResponse,
} from "@/features/api/stripe.api";
import { useNavigation } from "@react-navigation/native";
import { ShieldCheck, Star, Lock, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";

const PRICE = "4,99 €/mes";
const BILLING_HINT = "Cancela cuando quieras";

export default function PremiumPaymentScreen() {
  const { confirmPayment } = useStripe();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario, setUsuario } = useUsuarioStore();

  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const background = isDark ? "#020617" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#020617";
  const textSecondary = isDark ? "#9CA3AF" : "#4B5563";
  const subtleText = isDark ? "#6B7280" : "#9CA3AF";

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
      // 1) Pedimos al backend el PaymentIntent para el primer mes
      const data: CreatePremiumSubscriptionResponse =
        await createPremiumSubscription();

      const { clientSecret } = data;

      if (!clientSecret) {
        const msg = "Respuesta incompleta del servidor (falta clientSecret).";
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Error en la respuesta del pago",
          text2: msg,
        });
        return;
      }

      // 2) Confirmamos el pago (PaymentIntent) en el móvil
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        const msg =
          error.message ?? "No se pudo completar el pago con la tarjeta.";
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Error al procesar el pago",
          text2: msg,
        });
        return;
      }

      const status = paymentIntent?.status?.toLowerCase?.();
      const successStatuses = new Set(["succeeded", "processing"]);

      if (!successStatuses.has(status as any)) {
        const msg = `El pago no se ha completado correctamente (estado: ${
          status ?? "desconocido"
        }).`;
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Pago no completado",
          text2: msg,
        });
        return;
      }

      // 3) Pago OK → UX rápida: marcamos Premium en el store local
      if (usuario) {
        const usuarioActualizado: UsuarioLogin = {
          ...usuario,
          planActual: "PREMIUM",
          haPagado: true,
        };
        setUsuario(usuarioActualizado);
      }

      Toast.show({
        type: "success",
        text1: "Pago completado",
        text2: "Tu suscripción Premium se activará en unos instantes.",
      });

      navigation.goBack();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo iniciar el pago. Inténtalo de nuevo.";
      setErrorMsg(msg);
      Toast.show({
        type: "error",
        text1: "Error en el pago",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.appName, { color: textPrimary }]}>
                fitgenius
              </Text>
              <Text style={[styles.appTagline, { color: textSecondary }]}>
                Entrena mejor, progresa de verdad
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={20} color={textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={[styles.heroLabel, { color: textSecondary }]}>
            Premium
          </Text>
          <Text style={[styles.title, { color: textPrimary }]}>
            Desbloquea todo fitgenius
          </Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, { color: textPrimary }]}>{PRICE}</Text>
              <Text style={[styles.billingHint, { color: subtleText }]}>
                {BILLING_HINT} · Sin permanencia
              </Text>
            </View>

            <View style={styles.ratingBlock}>
              <Star size={16} color={isDark ? "#FDE047" : "#F59E0B"} />
              <Text style={[styles.ratingText, { color: textSecondary }]}>
                4,9/5 valoración media
              </Text>
            </View>
          </View>
        </View>

        {/* BENEFICIOS */}
        <View className="mb-6" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Qué incluye Premium
          </Text>
          <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
            Pensado para usuarios que entrenan de forma constante y quieren
            resultados medibles.
          </Text>

          <View style={styles.benefitsList}>
            <BenefitLine
              title="Rutinas ilimitadas"
              desc="Crea y guarda todas las rutinas que necesites."
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
            <BenefitLine
              title="Catálogo completo"
              desc="Acceso a todos los ejercicios y variaciones."
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
            <BenefitLine
              title="IA avanzada"
              desc="Planes generados según tu nivel, tiempo y objetivo."
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
            <BenefitLine
              title="Historial y progreso"
              desc="Evolución de cargas, volumen y marcas personales."
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
          </View>
        </View>

        {/* PAGO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Método de pago
          </Text>
          <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
            Añade tu tarjeta. Cobraremos {PRICE} cada mes y podrás cancelar
            cuando quieras desde tu perfil.
          </Text>

          <View style={{ marginTop: 8, marginBottom: 10 }}>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: "1234 1234 1234 1234",
              }}
              cardStyle={{
                backgroundColor: isDark ? "#020617" : "#FFFFFF",
                textColor: isDark ? "#E5E7EB" : "#111827",
                placeholderColor: "#9CA3AF",
              }}
              style={{
                width: "100%",
                height: 50,
              }}
              onCardChange={(details) => {
                setCardComplete(details.complete);
                if (errorMsg) setErrorMsg(null);
              }}
            />
          </View>

          {!!errorMsg && (
            <Text
              style={[
                styles.errorText,
                { color: isDark ? "#FCA5A5" : "#B91C1C" },
              ]}
            >
              {errorMsg}
            </Text>
          )}

          <TouchableOpacity
            onPress={handlePay}
            disabled={loading || !cardComplete}
            style={[
              styles.button,
              {
                backgroundColor: "#22C55E",
                opacity: loading || !cardComplete ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  color={isDark ? "#020617" : "#F9FAFB"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.buttonText,
                    { color: isDark ? "#020617" : "#0F172A" },
                  ]}
                >
                  Procesando…
                </Text>
              </>
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  { color: isDark ? "#020617" : "#0F172A" },
                ]}
              >
                Guardar tarjeta y activar Premium
              </Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.securityNote, { color: subtleText }]}>
            🔒 fitgenius no almacena los datos completos de tu tarjeta. Los
            pagos se procesan cumpliendo el estándar PCI-DSS.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ====== Subcomponentes ====== */

function BenefitLine({
  title,
  desc,
  textPrimary,
  textSecondary,
}: {
  title: string;
  desc: string;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View style={styles.benefitLine}>
      <View style={styles.benefitBullet} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.benefitTitle, { color: textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.benefitDesc, { color: textSecondary }]}>
          {desc}
        </Text>
      </View>
    </View>
  );
}

function TrustItem({
  icon,
  label,
  textPrimary,
}: {
  icon: React.ReactNode;
  label: string;
  textPrimary: string;
}) {
  return (
    <View style={styles.trustItem}>
      {icon}
      <Text style={[styles.trustText, { color: textPrimary }]}>{label}</Text>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  appTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  hero: {
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
  },
  billingHint: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingBlock: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  benefitsList: {
    rowGap: 10,
  },
  benefitLine: {
    flexDirection: "row",
    columnGap: 10,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 7,
    backgroundColor: "#22C55E",
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  benefitDesc: {
    fontSize: 12,
  },
  trustRow: {
    rowGap: 10,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  trustText: {
    fontSize: 13,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  securityNote: {
    fontSize: 11,
    marginTop: 10,
  },
});
