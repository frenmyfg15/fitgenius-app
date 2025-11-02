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

export default function App() {
  const { usuario, rehydrated } = useUsuarioStore();

  if (!rehydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left", "bottom"]}>
            <ActivityIndicator style={{ flex: 1 }} />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          {/* 👇 NO pongas otro NavigationContainer dentro de AppNavigator/AuthNavigator */}
          {usuario ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
