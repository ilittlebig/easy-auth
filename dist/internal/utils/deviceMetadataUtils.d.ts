import { NewDeviceMetadataType } from '@aws-sdk/client-cognito-identity-provider';
import { NewDeviceMetadataOutput } from '../../types/auth';
/**
 *
 */
export declare const getNewDeviceMetatada: (userPoolId: string, newDeviceMetadata?: NewDeviceMetadataType, accessToken?: string) => Promise<NewDeviceMetadataOutput | undefined>;
/**
 *
 */
export declare const getDeviceMetadata: (username?: string) => {
    deviceKey: string | null;
    deviceGroupKey: string | null;
    randomPassword: string;
} | undefined;
/**
 *
 */
export declare const clearDeviceMetadata: (username: string) => void;
