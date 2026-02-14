// App.tsx
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { ActivityIndicator, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NavigationContainer,
  type LinkingOptions,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import "./global.css";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import AppNavigator from "@/features/navigation/App";
import AuthNavigator from "@/features/navigation/Auth";
import mobileAds from "react-native-google-mobile-ads";

// Stripe
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

// Modal global
import { GlobalErrorModalProvider } from "@/shared/components/ui/GlobalErrorModalProvider";

// Auth stack
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sesion from "@/features/screens/auth/Sesion";
import LegalScreen from "@/features/screens/auth/LegalScreen";

import * as Sentry from "@sentry/react-native";

// ✅ Tema persistido (default dark si no hay nada guardado)
import { usePersistedColorScheme } from "@/theme/usePersistedColorScheme";

Sentry.init({
  dsn: "https://4c6aa91122ad7f362c9aa79df79e428b@o4510526940577792.ingest.de.sentry.io/4510526942609488",
  sendDefaultPii: false,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
  "[Reanimated]",
  "SafeAreaView",
]);

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

const PUBLISHABLE_KEY =
  (Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY as string) || "";

type RootAuthStackParamList = {
  Sesion: undefined;
  Registro: undefined;
  Legal: { initialTab?: "terminos" | "privacidad" } | undefined;
};

const RootAuthStack = createNativeStackNavigator<RootAuthStackParamList>();

// ✅ Navigation ref para etiquetar la screen actual en Sentry
const navigationRef = createNavigationContainerRef<any>();

function getActiveRouteName(state: any): string | null {
  if (!state) return null;
  const route = state.routes?.[state.index];
  if (!route) return null;
  if (route.state) return getActiveRouteName(route.state);
  return route.name ?? null;
}

export default Sentry.wrap(function App() {
  const { usuario, rehydrated } = useUsuarioStore();

  // ✅ Aplica preferencia guardada; si no existe, fuerza "dark" y la guarda.
  // Devuelve themeReady para evitar “flash” del tema al inicio.
  const { isReady: themeReady } = usePersistedColorScheme();

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log("AdMob inicializado");
      });
  }, []);

  // ✅ Vincula usuario + tags a Sentry
  useEffect(() => {
    if (!rehydrated) return;

    if (usuario) {
      Sentry.setUser({
        id: String((usuario as any).id ?? "unknown"),
        username: String((usuario as any).nombre ?? ""),
      });

      Sentry.setTag("auth", "logged_in");
      Sentry.setTag("plan", (usuario as any).esPremium ? "premium" : "free");
    } else {
      Sentry.setUser(null);
      Sentry.setTag("auth", "logged_out");
      Sentry.setTag("plan", "unknown");
    }
  }, [rehydrated, usuario]);

  // ✅ Loader hasta que zustand haya rehidratado y el tema esté listo
  if (!rehydrated || !themeReady) {
    return (
      <StripeProvider
        publishableKey={PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.fitgenius" // iOS (Apple Pay)
        urlScheme="fitgenius"
      >
        <GlobalErrorModalProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <SafeAreaView
                style={{ flex: 1, backgroundColor: "#0B0F1A" }} // ✅ evita fondo blanco mientras carga
                edges={["top", "right", "left", "bottom"]}
              >
                <ActivityIndicator style={{ flex: 1 }} />
              </SafeAreaView>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </GlobalErrorModalProvider>
      </StripeProvider>
    );
  }

  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.fitgenius"
      urlScheme="fitgenius"
    >
      <GlobalErrorModalProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer
              linking={linking}
              ref={navigationRef}
              onReady={() => {
                const name = getActiveRouteName(navigationRef.getRootState());
                if (name) Sentry.setTag("screen", name);
              }}
              onStateChange={() => {
                const name = getActiveRouteName(navigationRef.getRootState());
                if (name) Sentry.setTag("screen", name);
              }}
            >
              {usuario ? (
                <AppNavigator />
              ) : (
                <RootAuthStack.Navigator
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                >
                  <RootAuthStack.Screen name="Sesion" component={Sesion} />

                  {/* ✅ AuthNavigator (wizard) SIN Legal */}
                  <RootAuthStack.Screen name="Registro" component={AuthNavigator} />

                  {/* ✅ Legal SOLO aquí */}
                  <RootAuthStack.Screen name="Legal" component={LegalScreen} />
                </RootAuthStack.Navigator>
              )}
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </GlobalErrorModalProvider>
    </StripeProvider>
  );
});
