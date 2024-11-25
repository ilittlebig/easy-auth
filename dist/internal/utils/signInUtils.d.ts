import { AuthMFAType, AuthSignInOutput, CognitoResponse } from '../../types/auth';
/**
 *
 */
export declare const setActiveSignInUsername: (username: string) => void;
/**
 *
 */
export declare const getActiveSignInState: (username: string) => string;
/**
 *
 */
export declare const getSignInResultFromError: (errorName: string) => AuthSignInOutput | undefined;
/**
 *
 */
export declare const getMFAType: (type?: string) => AuthMFAType | undefined;
/**
 *
 */
export declare const getMFATypes: (types?: string[]) => AuthMFAType[] | undefined;
/**
 *
 */
export declare const parseMFATypes: (mfa: string) => any;
/**
 *
 */
export declare const isMFATypeEnabled: (challengeParameters: CognitoResponse, mfaType: AuthMFAType) => boolean | undefined;
/**
 *
 */
export declare const getTOTPSetupDetails: (secretCode: string, username: string) => {
    sharedSecret: string;
    getSetupUri: (appName: string, accountName: string) => string;
};
