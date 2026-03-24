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

import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

import { GlobalErrorModalProvider } from "@/shared/components/ui/GlobalErrorModalProvider";
import { ToastProvider } from "@/shared/components/ui/Toast";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sesion from "@/features/screens/auth/Sesion";
import LegalScreen from "@/features/screens/auth/LegalScreen";

import * as Sentry from "@sentry/react-native";

import { usePersistedColorScheme } from "@/theme/usePersistedColorScheme";
import { getMe } from "@/features/api/usuario.api";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

Sentry.init({
  dsn: "https://3760723ec34bd1fc51f566b9c0a633ea@o4510526940577792.ingest.de.sentry.io/4511048512962640",
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
const navigationRef = createNavigationContainerRef<any>();

function getActiveRouteName(state: any): string | null {
  if (!state) return null;
  const route = state.routes?.[state.index];
  if (!route) return null;
  if (route.state) return getActiveRouteName(route.state);
  return route.name ?? null;
}

// ✅ MOVER FUERA DE App
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.fitgenius"
      urlScheme="fitgenius"
    >
      <SafeAreaProvider>
        <ToastProvider>
          <GlobalErrorModalProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              {children}
            </GestureHandlerRootView>
          </GlobalErrorModalProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}

export default Sentry.wrap(function App() {
  const { usuario, rehydrated, setUsuario } = useUsuarioStore();
  const { isReady: themeReady } = usePersistedColorScheme();

  useEffect(() => {
    if (!rehydrated) return;

    if (usuario) {
      Sentry.setUser({
        id: String((usuario as any).id ?? "unknown"),
        username: String((usuario as any).nombre ?? ""),
      });
      Sentry.setTag("auth", "logged_in");
      Sentry.setTag(
        "plan",
        (usuario as any).planActual === "PREMIUM" ? "premium" : "free"
      );
    } else {
      Sentry.setUser(null);
      Sentry.setTag("auth", "logged_out");
    }
  }, [rehydrated, usuario]);

  useEffect(() => {
    if (!rehydrated) return;

    let cancelled = false;

    getMe()
      .then((me) => {
        if (!cancelled && me?.id) setUsuario(me);
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [rehydrated, setUsuario]);

  if (!rehydrated || !themeReady) {
    return (
      <AppProviders>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#0B0F1A" }}
          edges={["top", "right", "left", "bottom"]}
        >
          <ActivityIndicator size="large" color="#22C55E" style={{ flex: 1 }} />
        </SafeAreaView>
      </AppProviders>
    );
  }

  return (
    <AppProviders>
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
        <BottomSheetModalProvider>
          {usuario ? (
            <AppNavigator />
          ) : (
            <RootAuthStack.Navigator
              screenOptions={{ headerShown: false, animation: "slide_from_right" }}
            >
              <RootAuthStack.Screen name="Sesion" component={Sesion} />
              <RootAuthStack.Screen name="Registro" component={AuthNavigator} />
              <RootAuthStack.Screen name="Legal" component={LegalScreen} />
            </RootAuthStack.Navigator>
          )}
        </BottomSheetModalProvider>
      </NavigationContainer>
    </AppProviders>
  );
});