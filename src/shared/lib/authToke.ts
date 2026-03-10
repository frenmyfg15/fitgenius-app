// src/shared/lib/authToken.ts
import { api } from "@/features/api/axios";
import * as SecureStore from "expo-secure-store";

const KEY = "accessToken";

export async function loadAuthToken() {
    const token = await SecureStore.getItemAsync(KEY);
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return token;
}

export async function saveAuthToken(token: string) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    await SecureStore.setItemAsync(KEY, token);
}