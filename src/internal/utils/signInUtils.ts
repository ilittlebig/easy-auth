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
import { AuthError } from "../classes";
import { getRegion, getUserPoolName } from "./regionUtils";
import { getDeviceMetadata } from "./deviceMetadataUtils";
import { getNowString, calculateSignature } from "./srp/utils";
import { SRPClient } from "./srp/srpClient";
import { authErrorStrings, validateDeviceMetadata } from "./errorUtils";
import { signInStore } from "../stores/signInStore";
import type {
  UserSRPAuthParams,
  PasswordVerifierParams,
  CognitoConfig,
  DevicePasswordVerifierParams,
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

export const getSignInResultFromError = (errorName: string) => {
  if (errorName === "PasswordResetRequiredException") {
    return {
			isSignedIn: false,
			nextStep: { signInStep: "RESET_PASSWORD" },
		};
  }
}

/**
 *
 */

export const handleUserSRPAuthFlow = async ({
  username,
  password,
  cognitoConfig,
}: UserSRPAuthParams): Promise<RespondToAuthChallengeCommandOutput> => {
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const userPoolName = getUserPoolName(userPoolId);
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const srp = new SRPClient(userPoolName);
  const srpA = srp.calculateA();

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

  const activeUsername = challengeParameters.USERNAME ?? username;
	setActiveSignInUsername(activeUsername);

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
    challengeParameters,
    session,
  });

  if (response.ChallengeName === "DEVICE_SRP_AUTH") {
    return handleDeviceSRPAuthFlow(activeUsername, cognitoConfig);
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
  const { userPoolId, userPoolClientId } = cognitoConfig;
  const userPoolName = getUserPoolName(userPoolId);

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

  const dateNow = getNowString();
  const hkdf = srp.getPasswordAuthenticationKey(username, password, serverBValue, salt);
  const signatureString = calculateSignature(hkdf, userPoolName, username, secretBlock, dateNow);

  const challengeResponses: { [key: string]: string } = {
    USERNAME: username,
    PASSWORD_CLAIM_SECRET_BLOCK: secretBlock,
    TIMESTAMP: dateNow,
    PASSWORD_CLAIM_SIGNATURE: signatureString,
  };

  const deviceMetadata = getDeviceMetadata(username);
	if (deviceMetadata && deviceMetadata.deviceKey) {
		challengeResponses["DEVICE_KEY"] = deviceMetadata.deviceKey;
	}

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: challengeName,
		ChallengeResponses: challengeResponses,
		ClientId: userPoolClientId,
		Session: session,
  });
  return await client.send(respondToAuthCommand);
}

/**
 *
 */

const handleDevicePasswordVerifier = async ({
  username,
  client,
  srp,
  challengeParameters,
  session,
  cognitoConfig
}: DevicePasswordVerifierParams) => {
  const { userPoolClientId } = cognitoConfig;
  const deviceMetadata = getDeviceMetadata(username);
  validateDeviceMetadata(deviceMetadata);

  const {
    deviceKey,
    deviceGroupKey,
    randomPassword
  } = deviceMetadata;

  const {
    SRP_B: serverBValue,
    SALT: salt,
    SECRET_BLOCK: secretBlock
  } = challengeParameters;

  const dateNow = getNowString();
  const hkdf = srp.getPasswordAuthenticationKey(deviceKey, randomPassword, serverBValue, salt);
  const signatureString = calculateSignature(hkdf, deviceGroupKey, deviceKey, secretBlock, dateNow);

  const challengeResponses = {
    USERNAME: challengeParameters?.USERNAME ?? username,
    PASSWORD_CLAIM_SECRET_BLOCK: secretBlock,
    TIMESTAMP: dateNow,
    PASSWORD_CLAIM_SIGNATURE: signatureString,
    DEVICE_KEY: deviceKey,
  };

  const respondToAuthCommand = new RespondToAuthChallengeCommand({
		ChallengeName: "DEVICE_PASSWORD_VERIFIER",
		ChallengeResponses: challengeResponses,
		ClientId: userPoolClientId,
		Session: session,
  });
  return await client.send(respondToAuthCommand);
}

/**
 *
 */

const handleDeviceSRPAuthFlow = async (
  username: string,
  cognitoConfig: CognitoConfig
) => {
  const deviceMetadata = getDeviceMetadata(username);
  validateDeviceMetadata(deviceMetadata);

  const { userPoolId, userPoolClientId } = cognitoConfig;
  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });

  const srp = new SRPClient(deviceMetadata.deviceGroupKey!);
  const srpA = srp.calculateA();

  const responseChallengeCommand = new RespondToAuthChallengeCommand({
    ChallengeName: "DEVICE_SRP_AUTH",
    ChallengeResponses: {
      USERNAME: username,
      SRP_A: srpA,
      DEVICE_KEY: deviceMetadata.deviceKey,
    },
    ClientId: userPoolClientId,
  });

  const {
    ChallengeParameters: challengeParameters,
    Session: newSession
  } = await client.send(responseChallengeCommand);

  if (!challengeParameters) {
    throw new AuthError({
      name: "MissingChallengeParametersException",
      message: authErrorStrings.MissingChallengeParametersException
    });
  }

  return await handleDevicePasswordVerifier({
    username,
    client,
    srp,
    challengeParameters,
    session: newSession,
    cognitoConfig
  });
}
