/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import { AuthError } from "../classes";
import { authErrorStrings } from "./errorUtils";
import { decodeJWT } from "./decodeUtils";
import {
  getAuthKeys,
  getLastAuthUserKey,
  getKeyValueStorage,
  storeItem,
  storeJSON,
  storeDeviceMetadata
} from "./storageUtils";
import type { CacheTokensInput, TokensType } from "../../types/tokenTypes";

/**
 *
 */

export const clearTokens = () => {
  const authKeys = getAuthKeys();
  const lastAuthUserKey = getLastAuthUserKey();
  const storage = getKeyValueStorage();

  Promise.all([
    storage.removeItem(authKeys.accessToken),
    storage.removeItem(authKeys.idToken),
    storage.removeItem(authKeys.clockDrift),
    storage.removeItem(authKeys.refreshToken),
    storage.removeItem(authKeys.signInDetails),
    storage.removeItem(lastAuthUserKey),
  ]);
}

/**
 *
 */

export const storeTokens = (tokens: TokensType) => {
  if (!tokens) {
    throw new AuthError({
      name: "InvalidAuthTokensException",
      message: authErrorStrings.InvalidAuthTokensException
    });
  }

  clearTokens();

  const {
    accessToken,
    idToken,
    refreshToken,
    deviceMetadata,
    clockDrift,
    signInDetails
  } = tokens;

  const authKeys = getAuthKeys();
  storeItem(authKeys.accessToken, accessToken);
  storeItem(authKeys.idToken, idToken);
  storeItem(authKeys.refreshToken, refreshToken);

  storeDeviceMetadata(deviceMetadata, authKeys);
  storeJSON(authKeys.signInDetails, signInDetails)

  storeItem(authKeys.clockDrift, `${clockDrift}`);
}

/**
 *
 */

export const cacheTokens = ({
  username,
  authenticationResult,
  signInDetails,
}: CacheTokensInput) => {
  if (!authenticationResult.AccessToken) {
    throw new AuthError({
      name: "NoAccessTokenException",
      message: authErrorStrings.NoAccessTokenException
    });
  }

  const accessToken = decodeJWT(authenticationResult.AccessToken);
  const accessTokenIssuedAtInMillis = (accessToken.payload.iat || 0) * 1000;
  const currentTime = new Date().getTime();
  const clockDrift =
    accessTokenIssuedAtInMillis > 0
      ? accessTokenIssuedAtInMillis - currentTime
      : 0;

  let idToken;
  let refreshToken;
  let deviceMetadata = authenticationResult.NewDeviceMetadata;

  if (authenticationResult.RefreshToken) {
    refreshToken = authenticationResult.RefreshToken;
  }

  if (authenticationResult.IdToken) {
    idToken = decodeJWT(authenticationResult.IdToken);
  }

  const tokens: TokensType = {
    accessToken,
    idToken,
    refreshToken,
    clockDrift,
    deviceMetadata,
    username,
    signInDetails,
  };

  storeTokens(tokens);
}
