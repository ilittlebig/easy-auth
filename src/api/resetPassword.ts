/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type {
  AuthDeliveryMedium,
  AuthAttributeName,
  ResetPasswordInput,
  ResetPasswordOutput
} from "../types/auth";

export const resetPassword = async (input: ResetPasswordInput): Promise<ResetPasswordOutput> => {
  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const username = input.username;

  assert(
    !!username,
    "EmptyResetPasswordUsernameException",
    authErrorStrings.EmptyResetPasswordUsernameException
  );

  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });

  const forgotPasswordCommand = new ForgotPasswordCommand({
    Username: username,
    ClientId: userPoolClientId,
  });

  const result = await client.send(forgotPasswordCommand);
  const codeDeliveryDetails = result.CodeDeliveryDetails;

  return {
    isPasswordReset: false,
    nextStep: {
      resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE",
      codeDeliveryDetails: {
        deliveryMedium: codeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
        destination: codeDeliveryDetails?.Destination as string,
        attributeName: codeDeliveryDetails?.AttributeName as AuthAttributeName,
      },
    },
  }
}

