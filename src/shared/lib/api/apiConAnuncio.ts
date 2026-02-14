// src/lib/ads/useRewardedAd.ts
import { useCallback } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-XXXX/YYYY";

export function useRewardedAd() {
  const mostrarAnuncioYObtenerToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      const earnedUnsub = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earnedUnsub();
          const token = `reward-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;
          resolve(token);
        }
      );

      rewarded.load();

      rewarded.show().catch((err) => {
        earnedUnsub();
        reject(err);
      });
    });
  }, []);

  // 👈 nombre que esperas en useApiConAnuncio
  return { mostrarAnuncioYObtenerToken };
}
