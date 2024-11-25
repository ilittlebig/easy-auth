import { CognitoConfig } from '../../../types/auth';
/**
 *
 */
export declare const handleDeviceSRPAuthFlow: (username: string, cognitoConfig: CognitoConfig) => Promise<import('@aws-sdk/client-cognito-identity-provider').RespondToAuthChallengeCommandOutput>;
