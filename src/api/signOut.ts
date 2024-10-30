/**
 * Handles the sign out process.
 * Both global, and client sign out is handled here.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-29
 */

import {
  CognitoIdentityProviderClient,
  RevokeTokenCommand,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth, Hub } from "../internal/classes";
import {
  authErrorStrings,
  validateAuthTokens,
  validateAuthTokensWithRefreshToken
} from "../internal/utils/errorUtils";
import {
  loadTokens,
  clearTokens,
} from "../internal/utils/tokenUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type { DecodedToken } from "../types/auth/internal";
import type { CognitoConfig, SignOutInput } from "../types/auth";

export const signOut = async (input: SignOutInput) => {
  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;

  const isGlobal = input?.isGlobal;
  if (isGlobal) {
    await signOutGlobal(cognitoConfig);
  } else {
    await signOutClient(cognitoConfig);
  }
  clearTokens();

  Hub.dispatch("auth", {
    event: "signedOut"
  });
}

/**
 * Signs out the user on the current device.
 */

const signOutClient = async (cognitoConfig: CognitoConfig) => {
  try {
    const authTokens = loadTokens();
    validateAuthTokensWithRefreshToken(authTokens)
    const sessionRevocable = isSessionRevocable(authTokens.accessToken);
    if (!sessionRevocable) return;

    const { userPoolId, userPoolClientId } = cognitoConfig;
    const region = getRegion(userPoolId);
    const client = new CognitoIdentityProviderClient({ region });

    const revokeCommand = new RevokeTokenCommand({
      ClientId: userPoolClientId,
      Token: authTokens.refreshToken,
    });
    await client.send(revokeCommand);
  } catch (error) {
    // this should never throw
    console.log(authErrorStrings.ClientSignOutErrorException);
  }
}

/**
 * Signs out the user on all devices.
 */

const signOutGlobal = async (cognitoConfig: CognitoConfig) => {
  try {
    const authTokens = loadTokens();
    validateAuthTokens(authTokens)
    const sessionRevocable = isSessionRevocable(authTokens.accessToken);
    if (!sessionRevocable) return;

    const { userPoolId } = cognitoConfig;
    const region = getRegion(userPoolId);
    const client = new CognitoIdentityProviderClient({ region });

    const revokeCommand = new GlobalSignOutCommand({
      AccessToken: authTokens.accessToken.toString(),
    });
    await client.send(revokeCommand);
  } catch (error) {
    // this should never throw
    console.log(authErrorStrings.GlobalSignOutErrorException);
  }
}

const isSessionRevocable = (token: DecodedToken) => !!token?.payload?.origin_jti;
