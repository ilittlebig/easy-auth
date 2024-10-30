/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import {
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth, AuthError } from "../classes";
import { signInStore } from "../stores/signInStore";
import { getRegion } from "../utils/regionUtils";
import { isMFATypeEnabled, getTOTPSetupDetails } from "../utils/signInUtils";
import { authErrorStrings } from "../utils/errorUtils";
import type { CognitoResponse } from "../../types/auth";

/**
 * Handler
 */

export default async (challengeParameters: CognitoResponse) => {
  const { signInSession, username } = signInStore.getState();

  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const totpEnabled = isMFATypeEnabled(challengeParameters, "TOTP");
  if (!totpEnabled) {
    throw new AuthError({
      name: "SignInException",
      message: authErrorStrings.InvalidMFASetupTypeException + ": TOTP",
    });
  }

  const client = new CognitoIdentityProviderClient({ region });
  const associateSoftwareTokenCommand = new AssociateSoftwareTokenCommand({
    Session: signInSession
  });

  const {
    SecretCode: secretCode,
    Session: session
  } = await client.send(associateSoftwareTokenCommand);

  if (!secretCode) {
    throw new AuthError({
      name: "MissingSecretCodeException",
      message: authErrorStrings.MissingSecretCodeException,
    });
  }

  signInStore.dispatch({
    type: "SET_SIGN_IN_SESSION",
    value: session,
  });

  return {
    isSignedIn: false,
    nextStep: {
      signInStep: "CONTINUE_SIGN_IN_WITH_TOTP_SETUP",
      totpSetupDetails: getTOTPSetupDetails(secretCode, username),
    },
  };
}
