/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

export type AuthMFAPreference = "ENABLED" | "DISABLED" | "PREFERRED" | "NOT_PREFERRED";

/**
 * Inputs
 */

export interface UpdateMFAPreferenceInput {
  sms?: AuthMFAPreference;
  totp?: AuthMFAPreference;
}

export interface ConfirmResetPasswordInput {
  username: string;
  newPassword: string;
  confirmationCode: string;
}

export interface ResetPasswordInput {
  username: string;
}

export interface GetCurrentSessionInput {
  forceRefresh?: boolean;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface ConfirmSignInInput {
  challengeResponse: string;
  options?: {
    [key: string]: any;
  };
}

export interface UpdatePasswordCommandInput {
  previousPassword: string;
  proposedPassword: string;
}

export interface SignOutInput {
  isGlobal?: boolean;
}

export interface VerifyTOTPInput {
  code: string;
  options?: {
    deviceName?: string;
  }
}

export interface SignUpInput {
  username: string;
  password: string;
  options?: {
    userAttributes: Record<string, string | undefined>;
  }
}

export interface ConfirmSignUpInput {
  username: string;
  confirmationCode: string;
  options?: {
    forceAliasCreation: boolean;
  };
}

export interface ResendSignUpCodeInput {
  username: string;
}
