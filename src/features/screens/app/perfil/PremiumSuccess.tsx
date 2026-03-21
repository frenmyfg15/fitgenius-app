// src/features/premium/screens/PremiumSuccess.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

type PremiumSuccessRouteParams = {
  plan?: "monthly" | "yearly";
};

export default function PremiumSuccess() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params = (route.params || {}) as PremiumSuccessRouteParams;
  const plan = params.plan;

  const planLabel = plan === "yearly" ? "anual" : "mensual";

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 8,
          textAlign: "center",
          color: "#0F172A",
        }}
      >
        ¡Pago confirmado! 🎉
      </Text>

      <Text
        style={{
          color: "#475569",
          textAlign: "center",
          marginBottom: 10,
          lineHeight: 22,
        }}
      >
        Tu suscripción Premium {planLabel} se ha procesado correctamente.
      </Text>

      <Text
        style={{
          color: "#64748B",
          textAlign: "center",
          marginBottom: 20,
          lineHeight: 22,
        }}
      >
        Estamos terminando la sincronización de tu cuenta. En unos segundos tu
        plan aparecerá actualizado en la app.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Cuenta")}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: "#111827",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Ir a mi cuenta
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: "#475569", fontWeight: "600" }}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}