/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { getCurrentUser } from "../../api";
import { AuthError } from "../classes";
import type { AuthUser } from "../../types/authTypes";

/**
 *
 */

export const authErrorStrings = {
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
}

/**
 *
 */

export const assert = (value: any, name: string, message: string) => {
  const isValid = !!value && (typeof value !== "string" || value.trim() !== "");
  if (isValid) return;
  throw new AuthError({ name, message });
};

/**
 * Throws an error if the user is already authenticated.
 */

export const validateUserNotAuthenticated = async () => {
	let authUser: AuthUser | null = null;
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
