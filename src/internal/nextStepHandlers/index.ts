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
import type { CognitoResponse } from "../../types/auth";

type NextStepHandler = (params: CognitoResponse) => any;

const nextStepHandlers: Record<string, NextStepHandler> = {
  NEW_PASSWORD_REQUIRED: newPasswordRequired,
  MFA_SETUP: mfaSetup,
  SOFTWARE_TOKEN_MFA: softwareTokenMfa,
};

export const getNextStepFromChallenge = (challengeName: string | undefined, params: CognitoResponse) => {
  const handler = nextStepHandlers[challengeName ?? ""];
  if (handler) return handler(params);

  throw new AuthError({
    name: "ChallengeNotHandledException",
    message: `No next step for challenge: ${challengeName}`
  });
};
