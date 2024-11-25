import { TokensType } from '../../types/auth/internal/tokens';
import { NewDeviceMetadataOutput } from '../../types/auth';
/**
 *
 */
export declare const authErrorStrings: {
    [key: string]: string;
};
/**
 *
 */
export declare const assert: (assertion: boolean, name: string, message: string) => void;
/**
 * Throws an error if the user is already authenticated.
 */
export declare const validateUserNotAuthenticated: () => Promise<void>;
/**
 * Throws an error if the user is not authenticated with a refresh token.
 */
export declare function validateAuthTokensWithRefreshToken(tokens: any): asserts tokens is TokensType;
/**
 * Throws an error if the device metadata is invalid.
 */
export declare function validateDeviceMetadata(deviceMetadata: any): asserts deviceMetadata is NewDeviceMetadataOutput;
/**
 *
 */
export declare function validateAuthTokens(tokens: any): asserts tokens is TokensType;
