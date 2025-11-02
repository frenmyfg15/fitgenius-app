// src/shared/lib/api.ts
import { getDeviceId } from "@/shared/lib/deviceId";
import axios from "axios";
//http://192.168.1.143:3000/

export const api = axios.create({
  baseURL: "http://192.168.1.143:3000",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true,
});

// Asignar dinámicamente el header x-device-id
getDeviceId().then((id) => {
  api.defaults.headers.common["x-device-id"] = id;
});

// 🔑 Token opcional
export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
