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
import type { ChallengeHandler, ChallengeInput } from "../../types/authTypes";

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
}: ChallengeInput) => {
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
