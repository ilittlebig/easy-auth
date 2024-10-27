/**
 * Handles the confirm sign in flow for the user.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import { EasyAuth, AuthError } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getNewDeviceMetatada } from "../internal/utils/deviceMetadataUtils";
import { cacheTokens } from "../internal/utils/tokenUtils";
import {
  signInStore,
  setActiveSignInState,
  cleanActiveSignInState
} from "../internal/stores/signInStore";
import { handleChallenge } from "../internal/challengeHandlers";
import { getNextStepFromChallenge } from "../internal/nextStepHandlers";
import type { CognitoResponse, ConfirmSignInInput } from "../types/authTypes";

export const confirmSignIn = async (input: ConfirmSignInInput) => {
  const { challengeResponse, options } = input;
  const { username, challengeName, signInSession, signInDetails } =
		signInStore.getState();

  assert(
    !!challengeResponse && typeof challengeResponse === "string",
    "InvalidChallengeResponseException",
    authErrorStrings.InvalidChallengeResponseException
  );

  assert(
    !!username && !!signInSession,
    "SignInException",
    authErrorStrings.SignInException
  );

  if (!challengeName) {
    throw new AuthError({
      name: "MissingChallengeNameException",
      message: authErrorStrings.MissingChallengeNameException,
    });
  }

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const {
    ChallengeName: nextChallengeName,
    ChallengeParameters: challengeParameters,
    AuthenticationResult: authenticationResult,
    Session: session,
  } = await handleChallenge({
    username,
    challengeName,
    signInSession,
    challengeResponse,
    cognitoConfig,
    options
  });

  setActiveSignInState({
    username,
    challengeName: nextChallengeName,
    signInSession: session,
    signInDetails,
  });

  if (authenticationResult) {
    cleanActiveSignInState();
    cacheTokens({
      username,
      ...authenticationResult,
      newDeviceMetadata: await getNewDeviceMetatada(
        cognitoConfig.userPoolId,
        authenticationResult.NewDeviceMetadata,
        authenticationResult.AccessToken,
      ),
      signInDetails
    });

    return {
      isSignedIn: true,
      nextStep: { signInStep: "DONE" }
    };
  }

  return getNextStepFromChallenge(
    nextChallengeName,
    challengeParameters as unknown as CognitoResponse
  );
}
