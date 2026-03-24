// src/auth/loginConGoogleNativo.ts
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";

/** Web Client ID de google-services.json */
const WEB_CLIENT_ID =
  "908335534107-e496lulonfali73hupjkpt1i98feklni.apps.googleusercontent.com";

export function configurarGoogle() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

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

export async function loginConGoogleNativo() {
  try {
    try {
      const hadPrev = await GoogleSignin.hasPreviousSignIn();
      if (hadPrev) {
        console.log("[Google] Cerrando sesión previa…");
      }
      await GoogleSignin.signOut().catch(() => { });
    } catch (signoutErr) {
      console.warn("[Google] signOut warning:", signoutErr);
    }

    try {
      const app = getApp();
      const firebaseAuth = getAuth(app);
      await signOut(firebaseAuth);
    } catch (firebaseErr) {
      console.warn("[Firebase] signOut warning:", firebaseErr);
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    console.log("[Google] Usuario:", userInfo?.data?.user?.email ?? userInfo?.user?.email);

    const { idToken: googleIdToken } = await GoogleSignin.getTokens();
    if (!googleIdToken) {
      throw new Error("No se recibió idToken de Google");
    }

    const payload = decodeJwtPayload(googleIdToken);
    console.log("[Google] ID real (sub):", payload?.sub);
    console.log("[Google] Email verificado:", payload?.email_verified);
    console.log("[Google] Email:", payload?.email);

    const app = getApp();
    const firebaseAuth = getAuth(app);

    const credential = GoogleAuthProvider.credential(googleIdToken);
    const res = await signInWithCredential(firebaseAuth, credential);

    const firebaseIdToken = await res.user.getIdToken();

    console.log("[Firebase] UID:", res.user.uid);
    console.log(
      "[Firebase] ID Token (recortado):",
      firebaseIdToken.slice(0, 24) + "..."
    );

    return {
      token: firebaseIdToken,
      googleIdToken,
      user: {
        nombre: res.user.displayName ?? undefined,
        email: res.user.email ?? undefined,
        foto: res.user.photoURL ?? undefined,
        uid: res.user.uid,
        googleId: payload?.sub,
      },
    };
  } catch (error: any) {
    console.error("[loginConGoogleNativo] Error:", error?.message ?? error);
    throw error;
  }
}