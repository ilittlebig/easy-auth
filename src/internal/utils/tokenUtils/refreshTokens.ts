/**
 * Refreshes the auth tokens for a user.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth, Hub, AuthError } from "../../classes";
import { authErrorStrings } from "../errorUtils";
import { decodeJWT } from "../decodeUtils";
import { getRegion } from "../regionUtils";
import { clearTokens } from "./clearTokens";
import type { TokensType } from "../../../types/auth/internal";

const handleErrors = (err: any) => {
  const isNetworkError =
    err.message !== "Network error" ||
    err.message !== "The Internet connection appears to be offline.";
  if (isNetworkError) clearTokens();

  Hub.dispatch("auth", {
    event: "tokenRefreshFailure",
    data: { err }
  });

  if (err.name.startsWith("NotAuthorizedException")) {
    return null;
  }
  throw err;
}

export const refreshTokens = async ({
  tokens,
  username
}: {
  tokens: TokensType,
  username: string
}): Promise<TokensType | null> => {
  try {
    const refreshToken = tokens.refreshToken;
    if (!refreshToken) {
      throw new AuthError({
        name: "MissingRefreshTokenException",
        message: authErrorStrings.MissingRefreshTokenException,
      });
    }

    const deviceMetadata = tokens.deviceMetadata;
    if (!deviceMetadata) {
      throw new AuthError({
        name: "MissingDeviceMetadataException",
        message: authErrorStrings.MissingDeviceMetadataException,
      });
    }

    const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;

    const { userPoolId, userPoolClientId } = cognitoConfig;
    const region = getRegion(userPoolId);
    const client = new CognitoIdentityProviderClient({ region });

    const authCommand = new InitiateAuthCommand({
      ClientId: userPoolClientId,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        DEVICE_KEY: deviceMetadata.deviceKey
      }
    });

    const {
      AuthenticationResult: authenticationResult
    } = await client.send(authCommand);

    const accessToken = decodeJWT(authenticationResult?.AccessToken ?? "");
    const idToken = authenticationResult?.IdToken
      ? decodeJWT(authenticationResult.IdToken)
      : undefined;

    const iat = accessToken.payload.iat;
    if (!iat) {
      throw new AuthError({
        name: "iatNotFoundException",
        message: authErrorStrings.iatNotFoundException,
      });
    }

    const clockDrift = iat * 1000 - new Date().getTime();
    return {
      accessToken,
      idToken,
      clockDrift,
      refreshToken: tokens.refreshToken,
      username,
    };
  } catch (err: any) {
    return handleErrors(err)
  }
}
