/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import { AuthError } from "../../classes";
import { authErrorStrings } from "../errorUtils";
import {
  getAuthKeys,
  storeItem,
  storeJSON,
  storeDeviceMetadata,
  getLastAuthUserKey,
} from "../storageUtils";
import { clearTokens } from "./clearTokens";
import type { TokensType } from "../../../types/auth/internal";

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

  const lastAuthUser = tokens.username;
  storeItem(getLastAuthUserKey(), lastAuthUser);

  const authKeys = getAuthKeys();
  storeItem(authKeys.accessToken, accessToken.toString());
  storeItem(authKeys.idToken, idToken?.toString());
  storeItem(authKeys.refreshToken, refreshToken?.toString());

  storeDeviceMetadata(authKeys, deviceMetadata, storeItem);
  storeJSON(authKeys.signInDetails, signInDetails)

  storeItem(authKeys.clockDrift, `${clockDrift}`);
}
