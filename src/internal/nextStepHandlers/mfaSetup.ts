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
import { authErrorStrings } from "../utils/errorUtils";
import type { CognitoResponse, MFAType } from "../../types/authTypes";

const getMFAType = (type: string) => {
	if (type === "SMS_MFA") return "SMS";
	if (type === "SOFTWARE_TOKEN_MFA") return "TOTP";
}

const getMFATypes = (types: string[]) => {
	return types.map(getMFAType).filter(Boolean);
}

const parseMFATypes = (mfa: string) => {
	if (!mfa) return [];
	return JSON.parse(mfa);
}

const isMFATypeEnabled = (challengeParameters: CognitoResponse, mfaType: MFAType) => {
	const { MFAS_CAN_SETUP } = challengeParameters;
  const parsedTypes = parseMFATypes(MFAS_CAN_SETUP);
	const mfaTypes = getMFATypes(parsedTypes);
	return mfaTypes?.includes(mfaType);
}

const getTOTPSetupDetails = (secretCode: string, username: string) => {
	return {
		sharedSecret: secretCode,
		getSetupUri: (appName: string, accountName: string) => {
			return `otpauth://totp/${appName}:${
				accountName ?? username
			}?secret=${secretCode}&issuer=${appName}`;
		},
	};
}

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
