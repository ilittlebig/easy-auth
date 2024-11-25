import { RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { UserSRPAuthParams, PasswordVerifierParams } from '../../../types/auth/internal';
/**
 *
 */
export declare const handleUserSRPAuthFlow: ({ username, password, cognitoConfig, }: UserSRPAuthParams) => Promise<RespondToAuthChallengeCommandOutput>;
/**
 *
 */
export declare const handlePasswordVerifier: ({ challengeName, cognitoConfig, client, srp, password, challengeParameters, session }: PasswordVerifierParams) => Promise<RespondToAuthChallengeCommandOutput>;
