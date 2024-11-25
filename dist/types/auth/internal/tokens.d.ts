import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import { SignInDetails, NewDeviceMetadataOutput } from '../../auth';
export interface DecodedToken {
    toString: () => string;
    payload: Record<string, any>;
}
export interface TokensType {
    accessToken: DecodedToken;
    idToken?: DecodedToken;
    refreshToken?: string;
    clockDrift: number;
    deviceMetadata?: NewDeviceMetadataOutput;
    username: string;
    signInDetails?: SignInDetails;
}
export interface CacheTokensInput {
    username: string;
    authenticationResult: AuthenticationResultType;
    newDeviceMetadata?: NewDeviceMetadataOutput;
    signInDetails?: SignInDetails;
}
