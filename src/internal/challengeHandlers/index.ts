/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import { AuthError } from "../classes";
import newPasswordRequired from "./newPasswordRequired";
import mfaSetup from "./mfaSetup";
import softwareTokenMfa from "./softwareTokenMfa";
import type { CognitoConfig } from "../../types/auth";
import type {
  ChallengeNameType,
  RespondToAuthChallengeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

export type ChallengeRequestInput = Omit<HandleAuthChallengeRequest, "challengeName">;
type ChallengeHandler = (challengeParameters: ChallengeRequestInput) => Promise<RespondToAuthChallengeCommandOutput>;

interface HandleAuthChallengeRequest {
  username: string;
  signInSession?: string;
  challengeResponse: string;
  cognitoConfig: CognitoConfig;
  options?: Record<string, any>;
  challengeName: ChallengeNameType;
}

const challengeHandlers: Record<string, ChallengeHandler> = {
  NEW_PASSWORD_REQUIRED: newPasswordRequired,
  MFA_SETUP: mfaSetup,
  SOFTWARE_TOKEN_MFA: softwareTokenMfa,
};

export const handleChallenge = async ({
  username,
  challengeName,
  signInSession,
  challengeResponse,
  cognitoConfig,
  options
}: HandleAuthChallengeRequest) => {
  const handler = challengeHandlers[challengeName];
  if (!handler) {
    throw new AuthError({
      name: "UnknownChallengeException",
      message: `Unknown challenge: ${challengeName}`
    });
  }

  return await handler({
    username,
    signInSession,
    challengeResponse,
    cognitoConfig,
    options
  });
};
