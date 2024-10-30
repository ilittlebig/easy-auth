/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { getCurrentUser } from "../../api/getCurrentUser";
import { AuthError } from "../classes";
import type { TokensType } from "../../types/auth/internal/tokens";
import type { NewDeviceMetadataOutput, AuthUserOutput } from "../../types/auth";

const isNonEmptyString = (value: any): value is string => {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 *
 */

export const authErrorStrings: { [key: string]: string } = {
  InvalidConfigException: `
    Invalid or missing AWS Cognito configuration.

    This most likely occurred due to:
      1. EasyAuth.configure was not called before calling the method.

         EasyAuth.configure({
           Auth: {
             Cognito: {
               userPoolId: "your_user_pool_id",
               clientId: "your_client_id",
             }
           }
         });

         // ...

      2. The configuration object is missing 'userPoolId' or 'userPoolClientId'.
      3. The configuration object is not an object.`,
  UserAlreadyAuthenticatedException: "User is already authenticated.",
  EmptyUsernameException: "Username cannot be empty.",
  EmptyPasswordException: "Password cannot be empty.",
  EmptyUserIdForSRPException: "USER_ID_FOR_SRP was not found in challengeParameters.",
  InvalidUserPoolIdException: "Invalid user pool id provided.",
  MissingChallengeNameException: "Challenge name is missing from the authentication response.",
  MissingChallengeParametersException: "Challenge parameters are missing from the authentication response.",
  MissingSecretCodeException: "SecretCode is missing from the AssociateSoftwareTokenCommand.",
  InvalidAuthTokensException: "Invalid authentication tokens.",
  InvalidChallengeResponseException: `
    You provided an invalid challenge response.

    This most likely occurred due to:
      1. The challenge response was not provied.
      2. The challenge response was an empty string.
      3. The challenge response was not a string.`,
  SignInException: `
    An error occurred during the sign in process.

    This most likely occurred due to:
      1. signIn was not called before confirmSignIn.
      2. signIn threw an exception.
      3. page was refreshed during the sign in flow.`,
  InvalidMFASetupTypeException: "Invalid MFA setup type.",
  NoAccessTokenException: "No access token was found in the authentication result.",
  InvalidJWTTokenException: "Invalid JWT token provided, could not decode token.",
  InvalidJWTTokenPayloadException: "Invalid JWT payload",
  DeviceMetadataException: "'deviceKey', 'deviceGroupKey' or 'randomPassword' not found in local storage during the sign-in process..",
  UserUnauthenticatedException: "User needs to be authenticated to call this API.",
  iatNotFoundException: "iat not found in access token.",
  MissingRefreshTokenException: "Unable to refresh tokens: refresh token not provided.",
  MissingDeviceMetadataException: "Unable to refresh tokens: device metadata not provided.",
  ClientSignOutErrorException: "An error occurred during the client sign out process.",
  GlobalSignOutErrorException: "An error occurred during the global sign out process.",
}

/**
 *
 */

export const assert = (assertion: boolean, name: string, message: string) => {
  if (assertion) return;
  throw new AuthError({ name, message });
};

/**
 * Throws an error if the user is already authenticated.
 */

export const validateUserNotAuthenticated = async () => {
	let authUser: AuthUserOutput | null = null;
	try {
		authUser = await getCurrentUser();
	} catch (err) {
    // We simply let them sign in again if we can't get the current user
  }

  const validUser =
    authUser &&
    authUser.userId &&
    authUser.username

  if (!validUser) return;
  throw new AuthError({
    name: "UserAlreadyAuthenticatedException",
    message: authErrorStrings.UserAlreadyAuthenticatedException,
  });
}

/**
 * Throws an error if the user is not authenticated with a refresh token.
 */

export function validateAuthTokensWithRefreshToken(tokens: any): asserts tokens is TokensType {
  const authenticated =
    (tokens?.accessToken || tokens?.idToken) &&
    tokens?.refreshToken;
  if (authenticated) return;

  throw new AuthError({
    name: "UserUnauthenticatedException",
    message: authErrorStrings.UserUnauthenticatedException
  });
}

/**
 * Throws an error if the device metadata is invalid.
 */

export function validateDeviceMetadata(
  deviceMetadata: any
): asserts deviceMetadata is NewDeviceMetadataOutput {
  const validDeviceMetadata: boolean =
    !!deviceMetadata &&
    isNonEmptyString(deviceMetadata.deviceKey) &&
    isNonEmptyString(deviceMetadata.deviceGroupKey) &&
    isNonEmptyString(deviceMetadata.randomPassword);

  if (!validDeviceMetadata) {
    throw new AuthError({
      name: "DeviceMetadataException",
      message: authErrorStrings.DeviceMetadataException,
    });
  }
}

/**
 *
 */

export function validateAuthTokens(tokens: any): asserts tokens is TokensType {
  const accessToken = tokens.accessToken;
  const validAccessToken =
    accessToken &&
    accessToken.payload &&
    !!accessToken.toString();
  if (validAccessToken) return;

  throw new AuthError({
    name: "UserUnauthenticatedException",
    message: authErrorStrings.UserUnauthenticatedException
  });
}
