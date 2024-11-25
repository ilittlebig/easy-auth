import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { SignInDetails } from './index';
type AuthNextSignInStep = ConfirmSignInWithNewPasswordRequired | ConfirmSignInWithTOTPCode | ContinueSignInWithTOTPSetup | ResetPasswordStep | DoneSignInStep;
type AuthNextSignUpStep = ConfirmSignUpStep | DoneSignUpStep;
export type AuthDeliveryMedium = "EMAIL" | "SMS" | "PHONE" | "UNKNOWN";
export type AuthResetPasswordStep = "CONFIRM_RESET_PASSWORD_WITH_CODE" | "DONE";
export type AuthAttributeName = "phone_number" | "email";
export type AuthMFAType = "SMS" | "TOTP" | undefined;
export type AuthAttributesType = Record<string, string | undefined>;
export type AuthTOTPStatus = "SUCCESS" | "ERROR";
export interface AuthTOTPSetupDetails {
    sharedSecret: string;
    getSetupUri(appName: string, accountName?: string): URL;
}
export interface AuthCodeDeliveryDetails {
    destination?: string;
    deliveryMedium?: AuthDeliveryMedium;
    attributeName?: AuthAttributeName;
}
export interface AuthUserAttribute {
    Name: string;
    Value?: string;
}
/**
 * Steps
 */
export interface ConfirmSignUpStep {
    signUpStep: "CONFIRM_SIGN_UP";
    codeDeliveryDetails: AuthCodeDeliveryDetails;
}
export interface DoneSignUpStep {
    signUpStep: "DONE";
}
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
    preferredMFASetting?: AuthMFAType;
    userMFASettingList?: AuthMFAType[];
}
export interface VerifyTOTPOutput {
    status?: AuthTOTPStatus;
    session?: string;
}
export interface SignUpOutput {
    isSignUpComplete: boolean;
    nextStep: AuthNextSignUpStep;
    userId?: string;
}
export interface ConfirmSignUpOutput {
    isSignUpComplete: boolean;
    nextStep: AuthNextSignUpStep;
}
export {};
