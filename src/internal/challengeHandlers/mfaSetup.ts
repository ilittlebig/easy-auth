/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import {
  RespondToAuthChallengeCommand,
  VerifySoftwareTokenCommand,
  CognitoIdentityProviderClient,
  type RespondToAuthChallengeCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { getRegion } from "../utils/regionUtils";
import { signInStore } from "../stores/signInStore";
import type { ChallengeParams } from "../../types/authTypes";

/**
 * Handler
 */

export default async ({
  username,
  signInSession,
  challengeResponse,
  cognitoConfig,
}: ChallengeParams): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
    UserCode: challengeResponse,
    Session: signInSession,
  });

  const {
    Session: newSession
  } = await client.send(verifySoftwareTokenCommand);

  signInStore.dispatch({
		type: "SET_SIGN_IN_SESSION",
		value: newSession,
	});

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: "MFA_SETUP",
		ChallengeResponses: {
      USERNAME: username,
    },
		ClientId: userPoolClientId,
		Session: newSession,
  });
  return client.send(respondToAuthCommand);
}
