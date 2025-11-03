// src/shared/lib/api.ts
import { getDeviceId } from "@/shared/lib/deviceId";
import axios from "axios";

const URL = __DEV__
  ? "http://192.168.1.143:3000"
  : "https://fitgenius-server-production-c4c8.up.railway.app";

export const api = axios.create({
  baseURL: URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true,
});

// Asignar dinámicamente el header x-device-id
getDeviceId().then((id) => {
  api.defaults.headers.common["x-device-id"] = id;
});

// 🔑 Token opcional (añade o quita Authorization)
export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
