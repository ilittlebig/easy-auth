/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import {
  RespondToAuthChallengeCommand,
  CognitoIdentityProviderClient,
  type RespondToAuthChallengeCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { getRegion } from "../utils/regionUtils";
import type { ChallengeRequestInput } from "./index";

/**
 *
 */

const createAttributes = (attributes?: Record<string, string>): Record<string, string> => {
  const attributePrefix = "userAttributes.";

  return attributes ? Object.entries(attributes)
    .reduce((newAttributes, [key, value]) => {
      if (value) {
        newAttributes[`${attributePrefix}${key}`] = value;
      }
      return newAttributes;
    }, {} as Record<string, string>)
  : {};
};

/**
 * Handler
 */

export default async ({
  username,
  signInSession,
  challengeResponse,
  cognitoConfig,
  options
}: ChallengeRequestInput): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: "NEW_PASSWORD_REQUIRED",
		ChallengeResponses: {
      ...createAttributes(options?.requiredAttributes),
      NEW_PASSWORD: challengeResponse,
      USERNAME: username,
    },
		ClientId: userPoolClientId,
		Session: signInSession,
  });
  return await client.send(respondToAuthCommand);
}
