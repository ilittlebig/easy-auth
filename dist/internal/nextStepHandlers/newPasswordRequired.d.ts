import { CognitoResponse } from '../../types/auth';
/**
 * Handler
 */
declare const _default: (challengeParameters: CognitoResponse) => {
    isSignedIn: boolean;
    nextStep: {
        signInStep: string;
        missingAttributes: string[];
    };
};
export default _default;
