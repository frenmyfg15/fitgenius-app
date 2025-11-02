// src/shared/lib/deviceId.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto"; // o usa 'uuid' si no estás en Expo

const DEVICE_ID_KEY = "fitgenius_device_id";

export const getDeviceId = async (): Promise<string> => {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};
