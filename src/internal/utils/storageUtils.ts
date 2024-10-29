/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

import { EasyAuth } from "../classes";
import type { NewDeviceMetadataOutput } from "../../types/auth";

const STORAGE_NAME = "CognitoIdentityServiceProvider";

interface AuthKeys {
  accessToken: string;
  idToken: string;
  clockDrift: string;
  refreshToken: string;
  deviceKey: string;
  deviceGroupKey: string;
  randomPassword: string;
  signInDetails: string;
}

interface KeyValueStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const inMemoryStorage: { [key: string]: string } = {};

/**
 *
 */

const isLocalStorageAvailable = () => {
  try {
    const testKey = "__testKey";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 *
 */

export const createKeysForAuthStorage = (provider: string, identifier: string): AuthKeys => {
  const authTokenStorageKeys: AuthKeys = {
    accessToken: "accessToken",
    idToken: "idToken",
    clockDrift: "clockDrift",
    refreshToken: "refreshToken",
    deviceKey: "deviceKey",
    deviceGroupKey: "deviceGroupKey",
    randomPassword: "randomPassword",
    signInDetails: "signInDetails",
  };
  return getAuthStorageKeys(authTokenStorageKeys)(`${provider}`, identifier);
};

/**
 *
 */

const getAuthStorageKeys = (authKeys: AuthKeys) => {
  const keys = Object.values(authKeys);
  return (prefix: string, identifier: string): AuthKeys =>
    keys.reduce(
      (acc, authKey) => ({
        ...acc,
        [authKey]: `${prefix}${identifier ? `.${identifier}` : ""}.${authKey}`,
      }),
      {} as AuthKeys
    );
};

/**
 *
 */

export const getLastAuthUserKey = () => {
  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;
  const { userPoolClientId } = cognitoConfig;
  return `${STORAGE_NAME}.${userPoolClientId}.LastAuthUser`;
}

/**
 *
 */

export const getLastAuthUser = () => {
  const storage = getKeyValueStorage();
  const lastAuthUserKey = getLastAuthUserKey();
  const lastAuthUser =
    storage.getItem(lastAuthUserKey) ??
    "username";
  return lastAuthUser;
}

/**
 *
 */

export const getAuthKeys = (username?: string) => {
  const cognitoConfig = EasyAuth.getConfig().Auth?.Cognito;
  const { userPoolClientId } = cognitoConfig;

  const lastAuthUser =
    username ??
    getLastAuthUser();

  return createKeysForAuthStorage(
    STORAGE_NAME,
    `${userPoolClientId}.${lastAuthUser}`,
  );
}

/**
 * Choose the correct functions for the available storage
 */

export const getKeyValueStorage = (): KeyValueStorage => {
  const useLocalStorage = isLocalStorageAvailable();

  if (useLocalStorage) {
    return {
      getItem: (key: string) => (localStorage.getItem(key)),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key)
    };
  } else {
    return {
      getItem: (key: string) => (inMemoryStorage[key] !== undefined ? inMemoryStorage[key] : null),
      setItem: (key: string, value: string) => { inMemoryStorage[key] = value; },
      removeItem: (key: string) => { delete inMemoryStorage[key]; }
    };
  }
}

/**
 *
 */

export const storeItem = (key: string, value: any) => {
  if (!value) return;
  const storage = getKeyValueStorage();
  storage.setItem(key, value.toString());
};

/**
 *
 */

export const storeJSON = (key: string, item: any) => {
  if (!item) return;
  const storage = getKeyValueStorage();
  storage.setItem(key, JSON.stringify(item));
}

/**
 *
 */

export const storeDeviceMetadata = (
  authKeys: any,
  deviceMetadata?: NewDeviceMetadataOutput,
  storeFunction = storeItem,
) => {
  if (!deviceMetadata) return;
  const { deviceKey, deviceGroupKey, randomPassword } = deviceMetadata;
  storeFunction(authKeys.deviceKey, deviceKey);
  storeFunction(authKeys.deviceGroupKey, deviceGroupKey);
  storeFunction(authKeys.randomPassword, randomPassword);
}
