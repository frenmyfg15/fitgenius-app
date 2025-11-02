// src/features/premium/screens/PremiumSuccess.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

export default function PremiumSuccess() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const setPlanActual = (plan: any) => {} // ajusta a tu store

  useEffect(() => {
    (async () => {
      try {
        // (Opcional) verifica con tu backend si quieres estar 100% seguro
        // await verifyStripeSubscription(route.params?.subscriptionId)
        setPlanActual?.("PREMIUM");
      } catch (e: any) {
        setErr(e?.message || "No se pudo verificar la suscripción");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Activando Premium…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding: 20 }}>
        <Text style={{ color:"#dc2626", textAlign:"center", marginBottom: 12 }}>{err}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding:12, borderRadius:10, backgroundColor:"#111827" }}>
          <Text style={{ color:"#fff", fontWeight:"700" }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding: 24 }}>
      <Text style={{ fontSize:22, fontWeight:"800", marginBottom:8 }}>¡Premium activado! 🎉</Text>
      <Text style={{ color:"#475569", textAlign:"center", marginBottom:16 }}>
        Disfruta de todo el catálogo e IA avanzada.
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate("Cuenta" as never)} style={{ padding:12, borderRadius:10, backgroundColor:"#111827" }}>
        <Text style={{ color:"#fff", fontWeight:"700" }}>Ir a mi cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}
