import { NewDeviceMetadataOutput } from '../../types/auth';
import { KeyValueStorageInterface } from '../../types/auth/internal';
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
/**
 *
 */
export declare const createKeysForAuthStorage: (provider: string, identifier: string) => AuthKeys;
/**
 *
 */
export declare const getLastAuthUserKey: () => string;
/**
 *
 */
export declare const getLastAuthUser: () => string;
/**
 *
 */
export declare const getAuthKeys: (username?: string) => AuthKeys;
/**
 *
 */
export declare const getKeyValueStorage: () => KeyValueStorageInterface;
/**
 *
 */
export declare const storeItem: (key: string, value: any) => void;
/**
 *
 */
export declare const storeJSON: (key: string, item: any) => void;
/**
 *
 */
export declare const storeDeviceMetadata: (authKeys: any, deviceMetadata?: NewDeviceMetadataOutput, storeFunction?: (key: string, value: any) => void) => void;
export {};
