import { CognitoConfig } from '../../types/auth';
import { ChallengeNameType, RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
export type ChallengeRequestInput = Omit<HandleAuthChallengeRequest, "challengeName">;
interface HandleAuthChallengeRequest {
    username: string;
    signInSession?: string;
    challengeResponse: string;
    cognitoConfig: CognitoConfig;
    options?: Record<string, any>;
    challengeName: ChallengeNameType;
}
export declare const handleChallenge: ({ username, challengeName, signInSession, challengeResponse, cognitoConfig, options }: HandleAuthChallengeRequest) => Promise<RespondToAuthChallengeCommandOutput>;
export {};
