import { CognitoResponse } from '../../types/auth';
/**
 * Handler
 */
declare const _default: (challengeParameters: CognitoResponse) => Promise<{
    isSignedIn: boolean;
    nextStep: {
        signInStep: string;
        totpSetupDetails: {
            sharedSecret: string;
            getSetupUri: (appName: string, accountName: string) => string;
        };
    };
}>;
export default _default;
