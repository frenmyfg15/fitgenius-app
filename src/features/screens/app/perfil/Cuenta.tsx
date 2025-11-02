// src/features/cuenta/Cuenta.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

// Icons (lucide-react-native)
import { LogOut, Settings, Lock, UserX, XOctagon } from "lucide-react-native";

// Store y API
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { logoutToken } from "@/features/api/usuario.api";

// Subcomponentes (migrados a RN)
import PremiumMiniCTACard from "@/shared/components/ui/PremiumCTA";
import Experiencia from "@/shared/components/cuenta/Experiencia";
import Perfil from "@/shared/components/cuenta/Perfil";
import IMCVisual from "@/shared/components/ui/IMCVisual";
import GastoCalorico from "@/shared/components/ui/GastoCalorico";
import PesoIdeal from "@/shared/components/ui/PesoIdeal";
import TasaMetabolicaBasal from "@/shared/components/ui/TasaMetabolicaBasal";
import PesoObjetivoProgreso from "@/shared/components/ui/PesoObjetivoProgreso";


export default function Cuenta() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario, logout } = useUsuarioStore();
  const isPremium = useUsuarioStore((s) => s.usuario?.planActual === "PREMIUM");
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);

  const [closing, setClosing] = useState(false);

  const go = (name: string) => {
    // Ajusta los nombres a tus screens reales (p. ej. Perfil stack)
    // @ts-ignore
    navigation.navigate(name);
  };

  const cerrarSesion = async () => {
    try {
      setClosing(true);
      Toast.show({ type: "info", text1: "Cerrando sesión..." });
      await logoutToken();
      logout();
      Toast.show({ type: "success", text1: "Sesión cerrada correctamente" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Toast.show({ type: "error", text1: "Error al cerrar sesión" });
    } finally {
      setClosing(false);
    }
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
      <IMCVisual />
      <GastoCalorico />
      <PesoIdeal />
      <TasaMetabolicaBasal />
      <PesoObjetivoProgreso />

      {/* Acciones (móvil) */}
      <View style={{ gap: 12, paddingTop: 8, width: "100%", maxWidth: 450, alignSelf: "center" }}>
        {/* Configuración */}
        <ActionButton onPress={() => go("EditarPerfil")} isDark={isDark}>
          <Settings size={18} color={isDark ? "#e5e7eb" : "#334155"} />
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "700", color: isDark ? "#e5e7eb" : "#0f172a" }}>
            Configuración
          </Text>
        </ActionButton>

        {/* Cambiar contraseña */}
        <ActionButton onPress={() => go("CambiarContrasena")} isDark={isDark}>
          <Lock size={18} color={isDark ? "#e5e7eb" : "#334155"} />
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "700", color: isDark ? "#e5e7eb" : "#0f172a" }}>
            Cambiar contraseña
          </Text>
        </ActionButton>

        {/* Cancelar suscripción (solo premium pagado) */}
        {isPremium && haPagado && (
          <ActionButton onPress={() => go("CancelarSuscripcion")} isDark={isDark} variant="danger">
            <XOctagon size={18} color={"#dc2626"} />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "800", color: "#dc2626" }}>
              Cancelar suscripción
            </Text>
          </ActionButton>
        )}

        {/* Dar de baja (destructivo) */}
        <ActionButton onPress={() => go("EliminarCuenta")} isDark={isDark} variant="danger">
          <UserX size={18} color={"#dc2626"} />
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "800", color: "#dc2626" }}>
            Dar de baja mi cuenta
          </Text>
        </ActionButton>

        {/* Cerrar sesión (mismo estilo unificado) */}
        <ActionButton onPress={cerrarSesion} isDark={isDark} loading={closing}>
          {closing ? <ActivityIndicator color={isDark ? "#e5e7eb" : "#0f172a"} /> : <LogOut size={18} color={isDark ? "#e5e7eb" : "#334155"} />}
          <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "800", color: isDark ? "#e5e7eb" : "#0f172a" }}>
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
  const baseBg = isDark ? "rgba(20, 28, 44, 0.55)" : "#ffffff"; // glass en dark, blanco en light
  const baseBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dangerBorder = isDark ? "rgba(220,38,38,0.35)" : "rgba(220,38,38,0.35)";
  const shadow =
    isDark
      ? { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 6 }
      : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 };

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
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
