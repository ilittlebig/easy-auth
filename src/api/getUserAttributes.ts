/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-31
 */

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  type AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { AuthAttributesType } from "../types/auth";

const toAuthAttributes = (userAttributes?: AttributeType[]): AuthAttributesType => {
  const attributes: AuthAttributesType = {};
  userAttributes?.map(({ Name: name, Value: value }) => {
    if (name) attributes[name] = value;
  });
  return attributes;
}

export const getUserAttributes = async (): Promise<AuthAttributesType | undefined> => {
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const getUserCommand = new GetUserCommand({
    AccessToken: tokens.accessToken.toString(),
  });

  const {
    UserAttributes: userAttributes,
  } = await client.send(getUserCommand);

  return toAuthAttributes(userAttributes);
}
