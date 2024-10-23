/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import SRP from "aws-cognito-srp-client";
import { AuthError } from "../classes";
import { getRegion } from "./regionUtils";
import { authErrorStrings } from "./errorUtils";
import { signInStore } from "../stores/signInStore";
import type {
  UserSRPAuthParams,
  PasswordVerifierParams,
  SRPChallengeParameters,
} from "../../types/authTypes";

/**
 *
 */

const setActiveSignInUsername = (username: string): void => {
	const { dispatch } = signInStore;
	dispatch({ type: "SET_USERNAME", value: username });
}

/**
 *
 */

export const getActiveSignInState = (username: string): string => {
	const state = signInStore.getState();
	return state.username ?? username;
};

/**
 *
 */

export const handleUserSRPAuthFlow = async ({
  username,
  password,
  cognitoConfig,
}: UserSRPAuthParams): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const srp = new SRP(userPoolId);
  const srpA = srp.getA();

  const authCommand = new InitiateAuthCommand({
    AuthFlow: "USER_SRP_AUTH",
    AuthParameters: {
      USERNAME: username,
      SRP_A: srpA
    },
    ClientId: userPoolClientId,
  });

  const {
    ChallengeName: challengeName,
    ChallengeParameters: challengeParameters,
    Session: session
  } = await client.send(authCommand);

  const activeUsername = challengeParameters?.USERNAME ?? username;
	setActiveSignInUsername(activeUsername);

  const validChallengeParameters =
    challengeParameters &&
    challengeParameters.SRP_B &&
    challengeParameters.SALT &&
    challengeParameters.SECRET_BLOCK;

  if (!validChallengeParameters) {
    throw new AuthError({
      name: "MissingChallengeParametersException",
      message: authErrorStrings.MissingChallengeParametersException
    });
  }

  if (!challengeName) {
    throw new AuthError({
      name: "MissingChallengeNameException",
      message: authErrorStrings.MissingChallengeNameException
    });
  }

  const response = await handlePasswordVerifier({
    challengeName,
    cognitoConfig,
    client,
    srp,
    password,
    challengeParameters: challengeParameters as unknown as SRPChallengeParameters,
    session,
  });

  if (response.ChallengeName === "DEVICE_SRP_AUTH") {
    /*
    return handleDeviceSRPAuthFlow({
      username: activeUsername,
      cognitoConfig,
      session: response.Session,
    });
    */
  }

  return response;
}

/**
 *
 */

export const handlePasswordVerifier = async ({
  challengeName,
  cognitoConfig,
  client,
  srp,
  password,
  challengeParameters,
  session
}: PasswordVerifierParams): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolClientId } = cognitoConfig;
  const {
    SRP_B: serverBValue,
    SALT: salt,
    SECRET_BLOCK: secretBlock
  } = challengeParameters;

  const username = challengeParameters.USER_ID_FOR_SRP;
  if (!username) {
    throw new AuthError({
      name: "EmptyUserIdForSRPException",
      message: authErrorStrings.EmptyUserIdForSRPException,
    });
  }

  const { signature, timestamp } = srp.getSignature(
    username,
    serverBValue,
    salt,
    secretBlock,
    password
  );

  const challengeResponses = {
    USERNAME: username,
    PASSWORD_CLAIM_SECRET_BLOCK: secretBlock,
    TIMESTAMP: timestamp,
    PASSWORD_CLAIM_SIGNATURE: signature,
  };

  /*
  const deviceMetadata = getDeviceMetadata(username);
	if (deviceMetadata && deviceMetadata.deviceKey) {
		challengeResponses["DEVICE_KEY"] = deviceMetadata.deviceKey;
	}
  */

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: challengeName,
		ChallengeResponses: challengeResponses,
		ClientId: userPoolClientId,
		Session: session,
  });
  return await client.send(respondToAuthCommand);
}
