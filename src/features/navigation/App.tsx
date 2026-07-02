import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationState } from "@react-navigation/native";

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
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

/* ---------- Tipos ---------- */
export type HomeStackParamList = {
  Home: undefined;
  VistaEjercicio: any;
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
  PremiumPayment: undefined;
};

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProgresoStack = createNativeStackNavigator<ProgresoStackParamList>();
const RutinasStack = createNativeStackNavigator<RutinasStackParamList>();
const PerfilStack = createNativeStackNavigator<PerfilStackParamList>();

const stackOptions = {
  headerShown: false,
  animation: "slide_from_right" as const,
};

const HIDDEN_TAB_SCREENS = new Set(["CrearRutina"]);

const TAB_ROOT_SCREEN: Record<string, string> = {
  Inicio: "Home",
  Rutinas: "MisRutinas",
  Progreso: "Estadisticas",
  Perfil: "Cuenta",
};

function navigateToTabRoot(navigation: any, tabName: string) {
  const rootScreen = TAB_ROOT_SCREEN[tabName];
  if (!rootScreen) {
    navigation.navigate(tabName);
    return;
  }
  navigation.navigate(tabName, { screen: rootScreen });
}

function useIsTabBarHidden(): boolean {
  return useNavigationState((state) => {
    if (!state) return false;
    for (const tabRoute of state.routes) {
      if (tabRoute.state) {
        const tabState = tabRoute.state;
        const activeIndex = tabState.index ?? (tabState.routes.length - 1);
        const activeScreen = tabState.routes[activeIndex];
        if (activeScreen && HIDDEN_TAB_SCREENS.has(activeScreen.name)) {
          return true;
        }
      }
    }
    return false;
  });
}

/* ---------- Stacks ---------- */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen
        name="VistaEjercicio"
        component={VistaEjercicio}
        options={{ contentStyle: { backgroundColor: Colors.primary } }}
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
      <PerfilStack.Screen
        name="PremiumPayment"
        component={PremiumPaymentScreen}
        options={{ presentation: "modal" }}
      />
      <PerfilStack.Screen
        name="PremiumSuccess"
        component={PremiumSuccess}
        options={{ presentation: "modal" }}
      />
    </PerfilStack.Navigator>
  );
}

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inicio: "barbell",
  Rutinas: "fitness-outline",
  Progreso: "bar-chart-outline",
  Perfil: "person-outline",
};

/* ---------- CustomTabBar ---------- */
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const isHidden = useIsTabBarHidden();

  if (isHidden) return null;

  const cardBg = isDark ? Colors.primary : Colors.secondary;
  const dynamicBottom =
    insets.bottom > 0
      ? insets.bottom + (Platform.OS === "ios" ? 10 : 15)
      : 30;

  return (
    <View style={[styles.tabContainer, { bottom: dynamicBottom }]}>
      <View style={[styles.floatingBar, { backgroundColor: cardBg, borderColor: t.border }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigateToTabRoot(navigation, route.name)}
              style={styles.tabItem}
            >
              <Ionicons
                name={isFocused ? (iconName.replace("-outline", "") as any) : iconName}
                size={22}
                color={isFocused ? t.textPrimary : t.textSecondary}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? t.textPrimary : t.textSecondary }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- Header condicional ---------- */
function ConditionalHeader() {
  const isHidden = useIsTabBarHidden();
  if (isHidden) return null;
  return <Header />;
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigateToTabRoot(navigation, "Inicio"); },
        })}
      />
      <Tab.Screen
        name="Rutinas"
        component={RutinasStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigateToTabRoot(navigation, "Rutinas"); },
        })}
      />
      <Tab.Screen
        name="Progreso"
        component={ProgresoStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigateToTabRoot(navigation, "Progreso"); },
        })}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigateToTabRoot(navigation, "Perfil"); },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
    zIndex: 99,
  },
  floatingBar: {
    height: 60,
    flexDirection: "row",
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    ...TextStyle.caption,
    fontFamily: Font.body.bold,
    marginTop: 2,
  },
});
