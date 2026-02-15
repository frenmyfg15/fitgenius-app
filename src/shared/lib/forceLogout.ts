import { logoutToken } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

let isLoggingOut = false;

export async function forceLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
        await logoutToken().catch(() => { });
    } finally {
        useUsuarioStore.getState().logout();
        isLoggingOut = false;
    }
}
