// src/shared/lib/api.ts
import axios from "axios";

const local = true;

const URL = local
  ? "http://192.168.1.146:3000"
  : "https://fitgenius-server-production-5009.up.railway.app";

export const api = axios.create({
  baseURL: URL,
  headers: { "Content-Type": "application/json" },
  timeout: 200000,
  withCredentials: true,
});