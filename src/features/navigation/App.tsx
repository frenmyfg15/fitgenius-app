// src/features/navigation/AppNavigator.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/shared/components/ui/Header";
import Cuenta from "../screens/app/perfil/Cuenta";
import PremiumSuccess from "../screens/app/perfil/PremiumSuccess";
import Estadisticas from "../screens/app/estadistica/EstadisticasScreen";
import Home from "../screens/app/home/Home";
import VistaEjercicio from "../screens/app/ejercicio/VistaEjercicio";
import CustomTabBar from "./CustomTabBar";
import MisRutinasScreen from "../screens/app/rutinas/MisRutinas";
import EditarPerfil from "../screens/app/perfil/EditarPerfilScreen";
import CambiarContrasena from "../screens/app/perfil/CambiarContrasena";
import EliminarCuenta from "../screens/app/perfil/EliminarCuenta";
import CrearRutinaScreen from "../screens/app/rutina-manual/CrearRutina";

/* ---------- Tipos de stacks ---------- */
export type HomeStackParamList = {
  Home: undefined;
  VistaEjercicio: { slug: string, asignadoId: number, ejercicio: any } | undefined;
};
export type ProgresoStackParamList = {
  Estadisticas: undefined;
  ProgresoHistorial: undefined;
};
export type RutinasStackParamList = {
  MisRutinas: undefined;
  CrearRutina: undefined;
};
export type PerfilStackParamList = {
  Cuenta: undefined;
  EditarPerfil: undefined;
  CambiarContrasena: undefined;
  EliminarCuenta: undefined;
  PremiumSuccess: undefined;
};

/* ---------- Creación de navegadores ---------- */
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProgresoStack = createNativeStackNavigator<ProgresoStackParamList>();
const RutinasStack = createNativeStackNavigator<RutinasStackParamList>();
const PerfilStack = createNativeStackNavigator<PerfilStackParamList>();


/* ---------- Pantallas dummy (sustituye por las reales) ---------- */
function ScreenStub({ title }: { title: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0b1220" : "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "600", color: isDark ? "#e5e7eb" : "#0f172a" }}>
        {title}
      </Text>
    </View>
  );
}

/* ---------- Opciones comunes de Stack (slide) ---------- */
const stackOptions = {
  headerShown: false,                   // usamos el header estático global
  animation: "slide_from_right" as const,
};

/* ---------- Stacks ---------- */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home">{() => <Home/>}</HomeStack.Screen>
      <HomeStack.Screen name="VistaEjercicio">{() => <VistaEjercicio/>}</HomeStack.Screen>
    </HomeStack.Navigator>
  );
}
function ProgresoStackNavigator() {
  return (
    <ProgresoStack.Navigator screenOptions={stackOptions}>
      <ProgresoStack.Screen name="Estadisticas">{() => <Estadisticas/>}</ProgresoStack.Screen>
      <ProgresoStack.Screen name="ProgresoHistorial">{() => <ScreenStub title="Historial" />}</ProgresoStack.Screen>
    </ProgresoStack.Navigator>
  );
}
function RutinasStackNavigator() {
  return (
    <RutinasStack.Navigator screenOptions={stackOptions}>
      <RutinasStack.Screen name="MisRutinas">{() => <MisRutinasScreen/>}</RutinasStack.Screen>
      <RutinasStack.Screen name="CrearRutina">{() => <CrearRutinaScreen/>}</RutinasStack.Screen>
    </RutinasStack.Navigator>
  );
}
function PerfilStackNavigator() {
  return (
    <PerfilStack.Navigator screenOptions={stackOptions}>
      <PerfilStack.Screen name="Cuenta">{() => <Cuenta/>}</PerfilStack.Screen>
      <PerfilStack.Screen name="EditarPerfil">{() => <EditarPerfil />}</PerfilStack.Screen>
      <PerfilStack.Screen name="CambiarContrasena">{() => <CambiarContrasena />}</PerfilStack.Screen>
      <PerfilStack.Screen name="EliminarCuenta">{() => <EliminarCuenta />}</PerfilStack.Screen>
      <PerfilStack.Screen
        name="PremiumSuccess"
        component={PremiumSuccess}
        options={{ presentation: "modal", headerShown: false }} // 👈 modal
      />
    </PerfilStack.Navigator>
  );
}

/* ---------- Iconos del tab (elige manualmente) ---------- */
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inicio: "barbell-outline",
  Progreso: "bar-chart-outline",
  Rutinas: "fitness-outline",
  Perfil: "person-outline",
  // Cambia por los que prefieras: https://icons.expo.fyi/Index?selected=Ionicons
};

/* ---------- AppNavigator (SIN NavigationContainer) ---------- */
export default function AppNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => <Header />,
        // Puedes seguir usando overrides por pantalla:
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Inicio" component={HomeStackNavigator} />
      <Tab.Screen name="Rutinas" component={RutinasStackNavigator} />
      {/* Opcional: pestaña central de acción
      <Tab.Screen name="InicioAction" component={EmptyScreen} options={{ title: "" }} />
      */}
      <Tab.Screen name="Progreso" component={ProgresoStackNavigator} options={{ tabBarBadge: 3 }} />
      <Tab.Screen name="Perfil" component={PerfilStackNavigator} />
    </Tab.Navigator>
  );
}