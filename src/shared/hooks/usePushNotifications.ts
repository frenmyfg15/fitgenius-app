import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import { registrarPushToken } from "@/features/api/usuario.api";

/**
 * Pide permiso de notificaciones y registra el push token de Expo en el
 * backend. Se ejecuta una única vez por sesión cuando hay usuario autenticado.
 * Silencioso ante cualquier fallo (simulador, permiso denegado, sin
 * projectId configurado) — nunca debe bloquear ni interrumpir al usuario.
 */
export function usePushNotifications(usuarioId: number | undefined) {
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!usuarioId || hasRegistered.current) return;
    hasRegistered.current = true;

    (async () => {
      try {
        if (!Device.isDevice) return; // Push tokens no funcionan en simulador/emulador

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );

        await registrarPushToken(tokenResponse.data);
      } catch {
        // Silencioso: el registro de push no es crítico para el uso de la app.
      }
    })();
  }, [usuarioId]);
}
