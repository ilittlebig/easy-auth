import { ChallengeNameType, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { SRPClient } from '../../../internal/utils/srp/srpClient';
import { SignInInput, CognitoConfig } from '../index';
export interface UserSRPAuthParams extends SignInInput {
    cognitoConfig: CognitoConfig;
}
export interface PasswordVerifierParams {
    srp: SRPClient;
    password: string;
    session?: string;
    challengeName: ChallengeNameType;
    cognitoConfig: CognitoConfig;
    client: CognitoIdentityProviderClient;
    challengeParameters: Record<string, string>;
}
export interface DevicePasswordVerifierParams {
    srp: SRPClient;
    username: string;
    session?: string;
    cognitoConfig: CognitoConfig;
    client: CognitoIdentityProviderClient;
    challengeParameters: Record<string, string>;
}