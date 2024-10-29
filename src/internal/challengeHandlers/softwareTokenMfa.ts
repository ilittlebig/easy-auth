/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-22
 */

import {
  RespondToAuthChallengeCommand,
  CognitoIdentityProviderClient,
  type RespondToAuthChallengeCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { getRegion } from "../utils/regionUtils";
import type { ChallengeRequestInput } from "./index";

/**
 * Handler
 */

export default async ({
  username,
  signInSession,
  challengeResponse,
  cognitoConfig,
}: ChallengeRequestInput): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: "SOFTWARE_TOKEN_MFA",
		ChallengeResponses: {
      USERNAME: username,
      SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
    },
		ClientId: userPoolClientId,
		Session: signInSession,
  });
  return client.send(respondToAuthCommand);
}
