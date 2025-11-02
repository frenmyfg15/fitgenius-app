// src/auth/loginConGoogleNativo.ts
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

/** Web Client ID (de Google Console) */
const WEB_CLIENT_ID =
  "908335534107-e496lulonfali73hupjkpt1i98feklni.apps.googleusercontent.com";

export function configurarGoogle() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

// 🔍 helper para decodificar el payload de un JWT
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Inicia sesión con Google **mostrando siempre el selector de cuenta**:
 * - Cierra sesión previa en Google (si la hubiera)
 * - Cierra sesión previa en Firebase
 * - Lanza signIn para elegir cuenta
 */
export async function loginConGoogleNativo() {
  try {
    // 1) Limpia Google Sign-In previo (si hubo uno)
    try {
      // hasPreviousSignIn() existe en versiones recientes y evita TS error
      const hadPrev = await GoogleSignin.hasPreviousSignIn();
      if (hadPrev) {
        console.log("[Google] Cerrando sesión previa…");
      }
      await GoogleSignin.signOut().catch(() => {}); // safe: aunque no hubiera sesión
    } catch (signoutErr) {
      console.warn("[Google] signOut warning:", signoutErr);
    }

    // 2) Limpia sesión Firebase (si la hubiera)
    try {
      await auth().signOut();
    } catch (firebaseErr) {
      console.warn("[Firebase] signOut warning:", firebaseErr);
    }

    // 3) Verifica servicios de Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 4) Inicia el flujo con selector de cuenta
    const userInfo = await GoogleSignin.signIn();
    console.log("[Google] Usuario:", userInfo?.user?.email, userInfo?.user?.name);

    // 5) Obtén tokens de Google
    const { idToken: googleIdToken } = await GoogleSignin.getTokens();
    if (!googleIdToken) throw new Error("No se recibió idToken de Google");

    // (opcional) Inspección de payload
    const payload = decodeJwtPayload(googleIdToken);
    console.log("[Google] ID real (sub):", payload?.sub);
    console.log("[Google] Email verificado:", payload?.email_verified);
    console.log("[Google] Email:", payload?.email);

    // 6) Autenticar en Firebase con Google
    const credential = auth.GoogleAuthProvider.credential(googleIdToken);
    const res = await auth().signInWithCredential(credential);

    const firebaseIdToken = await res.user.getIdToken();

    console.log("[Firebase] UID:", res.user.uid);
    console.log("[Firebase] ID Token (recortado):", firebaseIdToken.slice(0, 24) + "...");

    return {
      token: firebaseIdToken,
      googleIdToken,
      user: {
        nombre: res.user.displayName ?? undefined,
        email: res.user.email ?? undefined,
        foto: res.user.photoURL ?? undefined,
        uid: res.user.uid,
        googleId: payload?.sub, // opcional
      },
    };
  } catch (error: any) {
    console.error("[loginConGoogleNativo] Error:", error?.message ?? error);
    throw error;
  }
}
