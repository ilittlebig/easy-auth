/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type { ConfirmResetPasswordInput } from "../types/authTypes";

export const confirmResetPassword = async (input: ConfirmResetPasswordInput) => {
  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const { username, newPassword, confirmationCode } = input;

  assert(
    !!username,
    "EmptyConfirmResetPasswordUsernameException",
    authErrorStrings.EmptyConfirmResetPasswordUsernameException
  );

  assert(
    !!newPassword,
    "EmptyConfirmResetPasswordNewPasswordException",
    authErrorStrings.EmptyConfirmResetPasswordNewPasswordException
  );

  assert(
    !!confirmationCode,
    "EmptyConfirmResetPasswordConfirmationCodeException",
    authErrorStrings.EmptyConfirmResetPasswordConfirmationCodeException
  );

  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });

  const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
    Username: username,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
    ClientId: userPoolClientId,
  });
  await client.send(confirmForgotPasswordCommand);
}
