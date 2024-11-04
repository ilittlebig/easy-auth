/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-01
 */

import {
  CognitoIdentityProviderClient,
  DeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";

export const deleteUser = async () => {
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const deleteUserCommand = new DeleteUserCommand({
    AccessToken: tokens.accessToken.toString(),
  });

  await client.send(deleteUserCommand);
}
