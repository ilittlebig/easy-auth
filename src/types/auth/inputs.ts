/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

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

export interface SignOutInput {
  isGlobal?: boolean;
}