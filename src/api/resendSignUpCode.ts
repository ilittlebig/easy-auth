/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-01
 */

import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type {
  AuthAttributeName,
  AuthCodeDeliveryDetails,
  AuthDeliveryMedium,
  ResendSignUpCodeInput
} from "../types/auth";

export const resendSignUpCode = async (input: ResendSignUpCodeInput): Promise<AuthCodeDeliveryDetails> => {
  const { username } = input;
  assert(
    !!username,
    "EmptyResendSignUpCodeUsernameException",
    authErrorStrings.EmptyResendSignUpCodeUsernameException,
  );

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const resendSignUpCodeCommand = new ResendConfirmationCodeCommand({
    Username: username,
    ClientId: userPoolClientId,
  });

  const {
    CodeDeliveryDetails: codeDeliveryDetails,
  } = await client.send(resendSignUpCodeCommand);

  return {
    destination: codeDeliveryDetails?.Destination,
    deliveryMedium: codeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
    attributeName: codeDeliveryDetails?.AttributeName as AuthAttributeName,
  };
}
