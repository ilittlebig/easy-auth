/**
 * Types related to authentication.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import {
  ChallengeNameType,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { SRPClient } from "../internal/utils/srp/srpClient";

export interface AuthUser {
  userId: string;
  username: string;
}

export interface CognitoConfig {
  userPoolId: string;
  userPoolClientId: string;
}

export interface AuthConfig {
  Auth: {
    Cognito: CognitoConfig;
  };
}

export interface UserSRPAuthParams {
  username: string;
  password: string;
  cognitoConfig: CognitoConfig;
}

export interface PasswordVerifierParams {
  challengeName: ChallengeNameType;
  cognitoConfig: CognitoConfig;
  client: CognitoIdentityProviderClient;
  srp: SRPClient;
  password: string;
  challengeParameters: Record<string, string>;
  session?: string;
}

export interface DevicePasswordVerifierParams {
  username: string;
  client: CognitoIdentityProviderClient;
  srp: SRPClient;
  challengeParameters: Record<string, string>;
  session?: string;
  cognitoConfig: CognitoConfig;
}

export interface SignInDetails {
  loginId: string;
  authFlowType: string;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignInState {
  username: string;
  challengeName?: ChallengeNameType;
  signInSession?: string;
  signInDetails?: Record<string, string>;
}

export interface ConfirmSignInInput {
  challengeResponse: string;
  options?: {
    [key: string]: any;
  };
}

export interface Action {
  type: string;
  value?: any;
}

export interface Store {
  getState: () => SignInState;
  dispatch: (action: Action) => void;
}

export interface CognitoResponse {
  ChallengeName: string;
  [key: string]: any;
}

export interface ChallengeInput {
  username: string;
  challengeName: ChallengeNameType;
  signInSession?: string;
  challengeResponse: string;
  cognitoConfig: CognitoConfig;
  options?: Record<string, any>;
}

export type ChallengeParams = Omit<ChallengeInput, "challengeName">;
export type ChallengeHandler = (challengeParameters: ChallengeParams) => Promise<any>;
export type NextStepHandler = (params: CognitoResponse) => any;
export type MFAType = "SMS" | "TOTP" | undefined;
