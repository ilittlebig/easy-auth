/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import type { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import type { SignInDetails } from "./index";

type AuthNextSignInStep =
	| ConfirmSignInWithNewPasswordRequired
	| ConfirmSignInWithTOTPCode
	| ContinueSignInWithTOTPSetup
	| ResetPasswordStep
	| DoneSignInStep;

export type AuthDeliveryMedium = "EMAIL" | "SMS" | "PHONE" | "UNKNOWN";
export type AuthResetPasswordStep = "CONFIRM_RESET_PASSWORD_WITH_CODE" | "DONE";
export type AuthAttributeName = "phone_number" | "email";
export type AuthMFAType = "SMS" | "TOTP" | undefined;

export interface AuthTOTPSetupDetails {
	sharedSecret: string;
	getSetupUri(appName: string, accountName?: string): URL;
}

export interface AuthCodeDeliveryDetails {
	destination?: string;
	deliveryMedium?: AuthDeliveryMedium;
	attributeName?: AuthAttributeName;
}

/**
 * Steps
 */

export interface ConfirmSignInWithTOTPCode {
	signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE";
}

export interface ContinueSignInWithTOTPSetup {
	signInStep: "CONTINUE_SIGN_IN_WITH_TOTP_SETUP";
	totpSetupDetails: AuthTOTPSetupDetails;
}

export interface ConfirmSignInWithNewPasswordRequired {
	signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";
	missingAttributes?: AttributeType[];
}

export interface ResetPasswordStep {
	signInStep: "RESET_PASSWORD";
}

export interface DoneSignInStep {
	signInStep: "DONE";
}

/**
 * Outputs
 */

export interface ResetPasswordOutput {
  isPasswordReset: boolean;
  nextStep: {
    resetPasswordStep: AuthResetPasswordStep;
    codeDeliveryDetails: AuthCodeDeliveryDetails;
  };
}

export interface ConfirmSignInOutput {
  isSignedIn: boolean;
  nextStep: AuthNextSignInStep;
}

export interface AuthUserOutput {
  userId: string;
  username: string;
  signInDetails?: SignInDetails;
}

export interface NewDeviceMetadataOutput {
  deviceKey: string;
  deviceGroupKey: string;
  randomPassword: string;
}

export interface GetMFAPreferenceOutput {
  preferredMFASetting?: AuthMFAType,
  userMFASettingList?: AuthMFAType[],
}
