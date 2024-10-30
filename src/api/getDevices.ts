/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-31
 */

import {
  CognitoIdentityProviderClient,
  ListDevicesCommand,
  type ListDevicesCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";

const MAX_DEVICES = 60;

export const getDevices = async (): Promise<ListDevicesCommandOutput> => {
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const listDevicesCommand = new ListDevicesCommand({
    AccessToken: tokens.accessToken.toString(),
    Limit: MAX_DEVICES,
  });
  return await client.send(listDevicesCommand);
}
