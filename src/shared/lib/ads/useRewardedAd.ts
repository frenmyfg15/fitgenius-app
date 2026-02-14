// src/shared/lib/ads/useRewardedAd.ts
import { useCallback } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const AD_UNIT_ID = __DEV__ ? TestIds.REWARDED : "ca-app-pub-XXXX/YYYY";

export function useRewardedAd(featureKey: string) {
  const { usuario } = useUsuarioStore();
  const usuarioId = usuario?.id;

  const mostrarAnuncioYObtenerToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log("[Ads] iniciar rewarded", {
        AD_UNIT_ID,
        featureKey,
        usuarioId,
      });

      const hasUser = typeof usuarioId === "number";

      const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
        ...(hasUser && {
          serverSideVerificationOptions: {
            userId: String(usuarioId),
            customData: featureKey,
          },
        }),
      });

      let terminado = false;

      const cleanup = () => {
        try {
          unsubLoaded && unsubLoaded();
          unsubEarned && unsubEarned();
        } catch {}
        clearTimeout(timeoutId);
      };

      const safeResolve = (token: string) => {
        if (terminado) return;
        terminado = true;
        cleanup();
        resolve(token);
      };

      const safeReject = (err: any) => {
        if (terminado) return;
        terminado = true;
        cleanup();
        reject(err);
      };

      // Evento cuando el anuncio está cargado
      const unsubLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log("[Ads] LOADED → show()");
          ad.show().catch((err) => {
            console.log("[Ads] show() error", err);
            safeReject(err);
          });
        }
      );

      // Evento cuando el usuario gana recompensa
      const unsubEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          console.log("[Ads] EARNED_REWARD");
          const token = `reward-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;
          safeResolve(token);
        }
      );

      // Timeout si no carga
      const timeoutId = setTimeout(() => {
        console.log("[Ads] TIMEOUT: no cargó");
        safeReject(new Error("No se pudo cargar el anuncio"));
      }, 8000);

      console.log("[Ads] load()");
      ad.load();
    });
  }, [usuarioId, featureKey]);

  return { mostrarAnuncioYObtenerToken };
}
