/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

import {
  CognitoIdentityProviderClient,
  ConfirmDeviceCommand,
  type NewDeviceMetadataType,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  getKeyValueStorage,
  getAuthKeys,
} from "./storageUtils";
/*
import {
  SRPClient,
  convertHexToBase64,
} from "../../lib/srp";
import { getRegion } from "./regionUtils";
*/

/**
 *
 */

export const getNewDeviceMetatada = async (
  userPoolId: string,
  newDeviceMetadata?: NewDeviceMetadataType,
  accessToken?: string
) => {
  if (!newDeviceMetadata)
    return undefined;

  /*
	const userPoolName = userPoolId.split("_")[1] || "";
	const deviceKey = newDeviceMetadata?.DeviceKey;
	const deviceGroupKey = newDeviceMetadata?.DeviceGroupKey;

  const region = getRegion(userPoolId);
  const client = new CognitoIdentityProviderClient({ region });
  const srpClient = new SRPClient(userPoolName);

  try {
    srpClient.generateHashDevice(
      deviceGroupKey ?? "",
      deviceKey ?? ""
    );
  } catch (err) {
    // TODO: log error
    return undefined;
  }

  const deviceSecretVerifierConfig = {
		Salt: convertHexToBase64(srpClient.saltToHashDevices),
		PasswordVerifier: convertHexToBase64(srpClient.verifierDevices),
	};

  try {
    const randomPassword = srpClient.randomPassword;
    const confirmDeviceCommand = new ConfirmDeviceCommand({
      AccessToken: accessToken,
      DeviceKey: deviceKey,
      DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
    });
    await client.send(confirmDeviceCommand);

    return {
      deviceKey,
      deviceGroupKey,
      randomPassword,
    }
  } catch (err) {
    // TODO: log error
    return undefined;
  }
  */
  return undefined;
}

/**
 *
 */

export const getDeviceMetadata = (username: string) => {
  const storage = getKeyValueStorage();
  const authKeys = getAuthKeys(username);

  const deviceKey = storage.getItem(authKeys.deviceKey);
  const deviceGroupKey = storage.getItem(authKeys.deviceGroupKey);
  const randomPassword = storage.getItem(authKeys.randomPassword);

  return !!randomPassword ? {
    deviceKey,
    deviceGroupKey,
    randomPassword,
  } : null;
}

/**
 *
 */

export const clearDeviceMetadata = (username: string) => {
  const authKeys = getAuthKeys(username);
  const storage = getKeyValueStorage();

  Promise.all([
    storage.removeItem(authKeys.deviceKey),
    storage.removeItem(authKeys.deviceGroupKey),
    storage.removeItem(authKeys.randomPassword),
  ]);
}
