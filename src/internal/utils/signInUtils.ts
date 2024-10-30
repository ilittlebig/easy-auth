/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import { signInStore } from "../stores/signInStore";
import type { AuthMFAType, CognitoResponse } from "../../types/auth";

/**
 *
 */

export const setActiveSignInUsername = (username: string): void => {
	const { dispatch } = signInStore;
	dispatch({ type: "SET_USERNAME", value: username });
}

/**
 *
 */

export const getActiveSignInState = (username: string): string => {
	const state = signInStore.getState();
	return state.username ?? username;
};

/**
 *
 */

export const getSignInResultFromError = (errorName: string) => {
  if (errorName === "PasswordResetRequiredException") {
    return {
			isSignedIn: false,
			nextStep: { signInStep: "RESET_PASSWORD" },
		};
  }
}

/**
 *
 */

export const getMFAType = (type?: string): AuthMFAType | undefined => {
	if (type === "SMS_MFA") return "SMS";
	if (type === "SOFTWARE_TOKEN_MFA") return "TOTP";
}

/**
 *
 */

export const getMFATypes = (types?: string[]): AuthMFAType[] | undefined => {
  if (!types) return undefined;
	return types.map(getMFAType).filter(Boolean);
}

/**
 *
 */

export const parseMFATypes = (mfa: string) => {
	if (!mfa) return [];
	return JSON.parse(mfa);
}

/**
 *
 */

export const isMFATypeEnabled = (challengeParameters: CognitoResponse, mfaType: AuthMFAType) => {
	const { MFAS_CAN_SETUP } = challengeParameters;
  const parsedTypes = parseMFATypes(MFAS_CAN_SETUP);
	const mfaTypes = getMFATypes(parsedTypes);
	return mfaTypes?.includes(mfaType);
}

/**
 *
 */

export const getTOTPSetupDetails = (secretCode: string, username: string) => {
	return {
		sharedSecret: secretCode,
		getSetupUri: (appName: string, accountName: string) => {
			return `otpauth://totp/${appName}:${
				accountName ?? username
			}?secret=${secretCode}&issuer=${appName}`;
		},
	};
}
