/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-31
 */

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  type AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type {
  SignUpInput,
  SignUpOutput,
  AuthDeliveryMedium,
  AuthAttributeName,
} from "../types/auth";

const toAttributeType = (userAttributes: Record<string, string | undefined>): AttributeType[] => {
  return Object.entries(userAttributes).map(([name, value]) => ({
		Name: name,
		Value: value,
	}));
}

export const signUp = async (input: SignUpInput): Promise<SignUpOutput> => {
  const { username, password, options } = input;

  assert(
    !!username,
    "EmptySignUpUsernameException",
    authErrorStrings.EmptySignUpUsernameException,
  );

  assert(
    !!password,
    "EmptySignUpPasswordException",
    authErrorStrings.EmptySignUpPasswordException,
  );

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const signUpCommand = new SignUpCommand({
    ClientId: userPoolClientId,
    Username: username,
    Password: password,
    UserAttributes: options?.userAttributes && toAttributeType(options?.userAttributes),
  });

  const {
    UserConfirmed: userConfirmed,
    CodeDeliveryDetails: codeDeliveryDetails,
    UserSub: userId,
  } = await client.send(signUpCommand);

  const isSignUpComplete = !!userConfirmed;
  if (isSignUpComplete) {
    return {
      isSignUpComplete: true,
      nextStep: {
        signUpStep: "DONE",
      },
      userId,
    };
  }

  return {
    isSignUpComplete: false,
    nextStep: {
      signUpStep: "CONFIRM_SIGN_UP",
      codeDeliveryDetails: {
        deliveryMedium: codeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
        destination: codeDeliveryDetails?.Destination as string,
        attributeName: codeDeliveryDetails?.AttributeName as AuthAttributeName,
      },
    },
    userId,
  };
}
