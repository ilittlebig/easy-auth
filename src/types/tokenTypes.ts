/**
 * Types related to tokens & storage
 *
 * Author: Elias Sjödin
 * Created: 2024-10-22
 */

import type { SignInDetails } from "./authTypes";
import type {
  AuthenticationResultType,
  NewDeviceMetadataType
} from "@aws-sdk/client-cognito-identity-provider";

interface DecodedToken {
  toString: () => string;
  payload: Record<string, any>;
}

export interface TokensType {
  accessToken: DecodedToken;
  idToken?: DecodedToken;
  refreshToken?: string;
  clockDrift: number;
  deviceMetadata?: NewDeviceMetadataType;
  username: string;
  signInDetails: SignInDetails;
}

export interface CacheTokensInput {
  username: string;
  authenticationResult: AuthenticationResultType;
  signInDetails: SignInDetails;
}
