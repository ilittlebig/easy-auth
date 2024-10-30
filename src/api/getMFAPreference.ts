/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-30
 */

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import { getMFAType, getMFATypes } from "../internal/utils/signInUtils";
import type { GetMFAPreferenceOutput } from "../types/auth";

export const getMFAPreference = async (): Promise<GetMFAPreferenceOutput> => {
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
    PreferredMfaSetting: preferredMFASetting,
    UserMFASettingList: userMFASettingList,
  } = await client.send(getUserCommand);

  return {
    preferredMFASetting: getMFAType(preferredMFASetting),
    userMFASettingList: getMFATypes(userMFASettingList),
  };
}
