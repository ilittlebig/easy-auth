import { RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { ChallengeRequestInput } from './index';
/**
 * Handler
 */
declare const _default: ({ username, signInSession, challengeResponse, cognitoConfig, }: ChallengeRequestInput) => Promise<RespondToAuthChallengeCommandOutput>;
export default _default;
