/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import { AuthError } from "../../classes";
import { authErrorStrings } from "../errorUtils";
import { decodeJWT } from "../decodeUtils";
import { storeTokens } from "./storeTokens";
import type { CacheTokensInput, TokensType } from "../../../types/tokenTypes";
import type { NewDeviceMetadataOutput } from "../../../types/deviceMetadataTypes";

export const cacheTokens = ({
  username,
  authenticationResult,
  newDeviceMetadata,
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
  let deviceMetadata = newDeviceMetadata as NewDeviceMetadataOutput;

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
