// src/features/cuenta/Cuenta.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LogOut, Settings, Lock, UserX, XOctagon } from "lucide-react-native";

import PremiumMiniCTACard from "@/shared/components/ui/PremiumCTA";
import Experiencia from "@/shared/components/cuenta/Experiencia";
import Perfil from "@/shared/components/cuenta/Perfil";
import IMCVisual from "@/shared/components/ui/IMCVisual";
import GastoCalorico from "@/shared/components/ui/GastoCalorico";
import PesoIdeal from "@/shared/components/ui/PesoIdeal";
import TasaMetabolicaBasal from "@/shared/components/ui/TasaMetabolicaBasal";
import PesoObjetivoProgreso from "@/shared/components/ui/PesoObjetivoProgreso";
import { useCuenta } from "@/shared/hooks/useCuenta";
import { cancelPremiumSubscription } from "@/features/api/stripe.api";
import Toast from "react-native-toast-message";

export default function Cuenta() {
  const {
    isDark,
    isPremium,
    haPagado,
    closing,
    go,
    cerrarSesion,
    usuario,
  } = useCuenta();

  const [canceling, setCanceling] = useState(false);

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

              Toast.show({
                type: "success",
                text1: "Suscripción cancelada",
                text2:
                  "Tu suscripción seguirá activa hasta el final del periodo actual.",
              });

              // 💡 Si tu `useCuenta` tiene algún método de refresco del usuario,
              // aquí sería buen sitio para llamarlo (ej: refetchUsuario()).
            } catch (e: any) {
              console.warn("[Cuenta] Error al cancelar suscripción", e);
              Toast.show({
                type: "error",
                text1: "No se pudo cancelar",
                text2: e?.message || "Inténtalo de nuevo en unos minutos.",
              });
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 80,
        backgroundColor: isDark ? "#0b1220" : "#ffffff",
        gap: 20,
      }}
    >
      {!isPremium && !haPagado && <PremiumMiniCTACard />}

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

      <PesoIdeal peso={usuario?.peso} altura={usuario?.altura} />

      <TasaMetabolicaBasal
        peso={usuario?.peso}
        altura={usuario?.altura}
        edad={usuario?.edad}
        sexo={usuario?.sexo}
      />

      <PesoObjetivoProgreso
        peso={usuario?.peso}
        objetivo={usuario?.pesoObjetivo}
      />

      {/* Acciones (móvil) */}
      <View
        style={{
          gap: 12,
          paddingTop: 8,
          width: "100%",
          maxWidth: 450,
          alignSelf: "center",
        }}
      >
        {/* Configuración */}
        <ActionButton onPress={() => go("EditarPerfil")} isDark={isDark}>
          <Settings size={18} color={isDark ? "#e5e7eb" : "#334155"} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "700",
              color: isDark ? "#e5e7eb" : "#0f172a",
            }}
          >
            Configuración
          </Text>
        </ActionButton>

        {/* Cambiar contraseña */}
        <ActionButton onPress={() => go("CambiarContrasena")} isDark={isDark}>
          <Lock size={18} color={isDark ? "#e5e7eb" : "#334155"} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "700",
              color: isDark ? "#e5e7eb" : "#0f172a",
            }}
          >
            Cambiar contraseña
          </Text>
        </ActionButton>

        {/* Cancelar suscripción (solo premium pagado) */}
        {isPremium && haPagado && (
          <ActionButton
            onPress={handleCancelSubscription}
            isDark={isDark}
            variant="danger"
            loading={canceling}
          >
            <XOctagon size={18} color={"#dc2626"} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: "800",
                color: "#dc2626",
              }}
            >
              {canceling ? "Cancelando…" : "Cancelar suscripción"}
            </Text>
          </ActionButton>
        )}

        {/* Dar de baja (destructivo) */}
        <ActionButton
          onPress={() => go("EliminarCuenta")}
          isDark={isDark}
          variant="danger"
        >
          <UserX size={18} color={"#dc2626"} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "800",
              color: "#dc2626",
            }}
          >
            Dar de baja mi cuenta
          </Text>
        </ActionButton>

        {/* Cerrar sesión */}
        <ActionButton onPress={cerrarSesion} isDark={isDark} loading={closing}>
          {closing ? (
            <ActivityIndicator color={isDark ? "#e5e7eb" : "#0f172a"} />
          ) : (
            <LogOut size={18} color={isDark ? "#e5e7eb" : "#334155"} />
          )}
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "800",
              color: isDark ? "#e5e7eb" : "#0f172a",
            }}
          >
            Cerrar sesión
          </Text>
        </ActionButton>
      </View>
    </ScrollView>
  );
}

/* ----------------- Botón con borde degradado (reutilizable) ----------------- */
function ActionButton({
  children,
  onPress,
  isDark,
  variant = "default",
  loading = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  isDark: boolean;
  variant?: "default" | "danger";
  loading?: boolean;
}) {
  const baseBg = isDark ? "rgba(20, 28, 44, 0.55)" : "#ffffff";
  const baseBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dangerBorder = "rgba(220,38,38,0.35)";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={loading}
      style={{
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: baseBg,
        borderWidth: 1,
        borderColor: variant === "danger" ? dangerBorder : baseBorder,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
