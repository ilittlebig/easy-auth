/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-31
 */

import {
  CognitoIdentityProviderClient,
  VerifySoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, validateAuthTokens, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { VerifyTOTPInput, VerifyTOTPOutput } from "../types/auth";

export const verifyTOTP = async (input: VerifyTOTPInput): Promise<VerifyTOTPOutput> => {
  const { code, options } = input;
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  assert(
    !!code,
    "EmptyVerifyTOTPCodeException",
    authErrorStrings.EmptyVerifyTOTPCodeException,
  );

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const verifyTOTPCommand = new VerifySoftwareTokenCommand({
    AccessToken: tokens.accessToken.toString(),
    UserCode: code,
    FriendlyDeviceName: options?.deviceName
  });

  const result = await client.send(verifyTOTPCommand);
  return {
    status: result.Status,
    session: result.Session,
  };
}
