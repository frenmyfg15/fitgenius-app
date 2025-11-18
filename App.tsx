// src/App.tsx
import "react-native-gesture-handler";
import React from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";
import "./global.css";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import AppNavigator from "@/features/navigation/App";
import AuthNavigator from "@/features/navigation/Auth";
import Toast from "react-native-toast-message";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
  "[Reanimated]",
  "SafeAreaView"
]);


// 👇 Stripe
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

const linking: LinkingOptions<any> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Perfil: {
        screens: {
          PremiumSuccess: "premium/success",
          Cuenta: "premium/cancel",
        },
      },
    },
  },
};

// Clave publicable desde app.json/app.config (expo.extra.STRIPE_PUBLISHABLE_KEY)
const PUBLISHABLE_KEY =
  (Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY as string) ||
  "";

export default function App() {
  const { usuario, rehydrated } = useUsuarioStore();

  if (!rehydrated) {
    return (
      <StripeProvider
        publishableKey={PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.fitgenius" // iOS (Apple Pay), puede ser cualquier string único si no usas Apple Pay
        urlScheme="fitgenius" // debe coincidir con tu esquema en app.json para 3DS/redirecciones
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <SafeAreaView
              style={{ flex: 1 }}
              edges={["top", "right", "left", "bottom"]}
            >
              <ActivityIndicator style={{ flex: 1 }} />
            </SafeAreaView>
          </SafeAreaProvider>
        </GestureHandlerRootView>
        <Toast />
      </StripeProvider>
    );
  }

  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.fitgenius"
      urlScheme="fitgenius"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            {/* 👇 NO pongas otro NavigationContainer dentro de AppNavigator/AuthNavigator */}
            {usuario ? <AppNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast />
    </StripeProvider>
  );
}
