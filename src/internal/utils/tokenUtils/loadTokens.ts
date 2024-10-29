/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import { AuthError } from "../../classes";
import { authErrorStrings } from "../errorUtils";
import { decodeJWT } from "../decodeUtils";
import { getKeyValueStorage, getAuthKeys, getLastAuthUser } from "../storageUtils";
import { getDeviceMetadata } from "../deviceMetadataUtils";
import type { TokensType } from "../../../types/auth/internal";

export const loadTokens = (): TokensType | null => {
  const storage = getKeyValueStorage();
  try {
    const authKeys = getAuthKeys();
    const accessTokenString = storage.getItem(authKeys.accessToken);

    if (!accessTokenString) {
      throw new AuthError({
        name: "NoSessionFoundException",
        message: authErrorStrings.NoSessionFoundException,
      });
    }


    const accessToken = decodeJWT(accessTokenString);
    const itString = storage.getItem(authKeys.idToken);
    const idToken = itString ? decodeJWT(itString) : undefined;

    const refreshToken =
      storage.getItem(authKeys.refreshToken) ??
      undefined;

    const clockDriftString =
      storage.getItem(authKeys.clockDrift) ?? "0";
    const clockDrift = Number.parseInt(clockDriftString);

    const signInDetails = storage.getItem(authKeys.signInDetails);
    const tokens = {
      accessToken,
      idToken,
      refreshToken,
      deviceMetadata: getDeviceMetadata() ?? undefined,
      clockDrift,
      username: getLastAuthUser(),
      signInDetails: undefined
    } as TokensType;

    if (signInDetails) {
      tokens.signInDetails = JSON.parse(signInDetails);
    }

    return tokens;
  } catch (err) {
    return null;
  }
}
