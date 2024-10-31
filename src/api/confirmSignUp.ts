/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-31
 */

import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { assert, authErrorStrings } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import type {
  ConfirmSignUpInput,
  ConfirmSignUpOutput,
} from "../types/auth";

export const confirmSignUp = async (input: ConfirmSignUpInput): Promise<ConfirmSignUpOutput> => {
  const { username, confirmationCode, options } = input;

  assert(
    !!username,
    "EmptyConfirmSignUpUsernameException",
    authErrorStrings.EmptyConfirmSignUpUsernameException,
  );

  assert(
    !!confirmationCode,
    "EmptyConfirmSignUpCodeException",
    authErrorStrings.EmptyConfirmSignUpCodeException,
  );

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const confirmSignUpCommand = new ConfirmSignUpCommand({
    ClientId: userPoolClientId,
    Username: username,
    ConfirmationCode: confirmationCode,
    ForceAliasCreation: options?.forceAliasCreation,
  });

  await client.send(confirmSignUpCommand);

  return {
    isSignUpComplete: true,
    nextStep: {
      signUpStep: "DONE",
    },
  };
}
