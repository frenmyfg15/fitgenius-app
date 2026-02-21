import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "@/shared/components/ui/Header";
import Cuenta from "../screens/app/perfil/Cuenta";
import PremiumSuccess from "../screens/app/perfil/PremiumSuccess";
import Estadisticas from "../screens/app/estadistica/EstadisticasScreen";
import Home from "../screens/app/home/Home";
import VistaEjercicio from "../screens/app/ejercicio/VistaEjercicio";
import MisRutinasScreen from "../screens/app/rutinas/MisRutinas";
import EditarPerfil from "../screens/app/perfil/EditarPerfilScreen";
import CambiarContrasena from "../screens/app/perfil/CambiarContrasena";
import EliminarCuenta from "../screens/app/perfil/EliminarCuenta";
import CrearRutinaScreen from "../screens/app/rutina-manual/CrearRutina";
import PremiumPaymentScreen from "../screens/app/premium/PremiumPaymentScreen";

/* ---------- TOKENS ESTRICTOS ---------- */
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",
    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#52525B",
    accent: "#22C55E",
  },
  radius: { lg: 16, full: 999 },
};

/* ---------- Tipos ---------- */
export type HomeStackParamList = { Home: undefined; VistaEjercicio: any; };
export type ProgresoStackParamList = { Estadisticas: undefined; ProgresoHistorial: undefined; };
export type RutinasStackParamList = { MisRutinas: undefined; CrearRutina: undefined; };
export type PerfilStackParamList = { Cuenta: undefined; EditarPerfil: undefined; CambiarContrasena: undefined; EliminarCuenta: undefined; PremiumSuccess: undefined; PremiumPayment: undefined; };

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProgresoStack = createNativeStackNavigator<ProgresoStackParamList>();
const RutinasStack = createNativeStackNavigator<RutinasStackParamList>();
const PerfilStack = createNativeStackNavigator<PerfilStackParamList>();

const stackOptions = { headerShown: false, animation: "slide_from_right" as const };

/* ---------- Stacks ---------- */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen
        name="VistaEjercicio"
        component={VistaEjercicio}
        options={{
          contentStyle: { backgroundColor: "#0b1220" },
        }}
      />
    </HomeStack.Navigator>
  );
}
function ProgresoStackNavigator() {
  return (
    <ProgresoStack.Navigator screenOptions={stackOptions}>
      <ProgresoStack.Screen name="Estadisticas" component={Estadisticas} />
    </ProgresoStack.Navigator>
  );
}
function RutinasStackNavigator() {
  return (
    <RutinasStack.Navigator screenOptions={stackOptions}>
      <RutinasStack.Screen name="MisRutinas" component={MisRutinasScreen} />
      <RutinasStack.Screen name="CrearRutina" component={CrearRutinaScreen} />
    </RutinasStack.Navigator>
  );
}
function PerfilStackNavigator() {
  return (
    <PerfilStack.Navigator screenOptions={stackOptions}>
      <PerfilStack.Screen name="Cuenta" component={Cuenta} />
      <PerfilStack.Screen name="EditarPerfil" component={EditarPerfil} />
      <PerfilStack.Screen name="CambiarContrasena" component={CambiarContrasena} />
      <PerfilStack.Screen name="EliminarCuenta" component={EliminarCuenta} />
      <PerfilStack.Screen name="PremiumPayment" component={PremiumPaymentScreen} options={{ presentation: "modal" }} />
      <PerfilStack.Screen name="PremiumSuccess" component={PremiumSuccess} options={{ presentation: "modal" }} />
    </PerfilStack.Navigator>
  );
}

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inicio: "barbell",
  Rutinas: "fitness-outline",
  Progreso: "bar-chart-outline",
  Perfil: "person-outline",
};

/* ---------- CustomTabBar Adaptativo ---------- */
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const cardBg = isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight;
  const cardBorder = isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  const mainIndex = state.routes.findIndex((r: any) => r.name === "Inicio");
  const isMainFocused = state.index === mainIndex;

  /**
   * AJUSTE DE ALTURA:
   * Hemos subido el valor base de 20 a 30 para Android con botones.
   * En iOS/Gestos, añadimos 10 puntos extra al inset para que no quede pegado a la barra.
   */
  const dynamicBottom = insets.bottom > 0
    ? insets.bottom + (Platform.OS === 'ios' ? 10 : 15)
    : 30;

  return (
    <View style={[styles.tabContainer, { bottom: dynamicBottom }]}>
      {/* BOTÓN PRINCIPAL (INICIO) */}
      <View style={styles.mainBtnWrapper}>
        <LinearGradient
          colors={[tokens.color.gradientStart, tokens.color.gradientMid, tokens.color.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Inicio")}
            style={[styles.mainBtnInner, { backgroundColor: cardBg }]}
          >
            <Ionicons
              name={TAB_ICONS["Inicio"]}
              size={28}
              color={isMainFocused ? tokens.color.accent : textSecondary}
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* BARRA FLOTANTE */}
      <View style={[styles.floatingBar, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {state.routes.filter((r: any) => r.name !== "Inicio").map((route: any) => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === route.name);
          const isFocused = state.index === routeIndex;
          const iconName = TAB_ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <Ionicons
                name={isFocused ? (iconName.replace("-outline", "") as any) : iconName}
                size={22}
                color={isFocused ? textPrimary : textSecondary}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? textPrimary : textSecondary }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ header: () => <Header />, tabBarHideOnKeyboard: true }}
    >
      <Tab.Screen name="Inicio" component={HomeStackNavigator} />
      <Tab.Screen name="Rutinas" component={RutinasStackNavigator} />
      <Tab.Screen name="Progreso" component={ProgresoStackNavigator} />
      <Tab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Perfil", { screen: "Cuenta" });
          },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    zIndex: 99,
  },
  mainBtnWrapper: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  gradientBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  mainBtnInner: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingBar: {
    flex: 1,
    height: 60,
    marginLeft: 12,
    flexDirection: "row",
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
});