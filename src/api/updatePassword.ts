/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-30
 */

import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import {
  assert,
  validateAuthTokens,
  authErrorStrings,
} from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { UpdatePasswordCommandInput } from "../types/auth";

export const updatePassword = async (input: UpdatePasswordCommandInput) => {
  const { previousPassword, proposedPassword } = input;
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  assert(
    !!previousPassword && !!proposedPassword,
    "EmptyChangePasswordException",
    authErrorStrings.EmptyChangePasswordException
  );

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const revokeCommand = new ChangePasswordCommand({
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
    AccessToken: tokens.accessToken.toString(),
  });
  await client.send(revokeCommand);
}
