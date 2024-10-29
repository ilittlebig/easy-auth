/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { SRPClient } from "../srp/srpClient";
import { getNowString, calculateSignature } from "../srp/utils";
import { getDeviceMetadata } from "../deviceMetadataUtils";
import { AuthError } from "../../classes";
import { getRegion } from "../regionUtils";
import { authErrorStrings, validateDeviceMetadata } from "../errorUtils";
import type { DevicePasswordVerifierParams } from "../../../types/auth/internal";
import type { CognitoConfig } from "../../../types/auth";

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

export const handleDeviceSRPAuthFlow = async (
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
