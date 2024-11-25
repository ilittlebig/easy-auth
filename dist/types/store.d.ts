import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import { SignInDetails } from './auth';
export interface SignInState {
    username: string;
    signInSession?: string;
    challengeName?: ChallengeNameType;
    signInDetails?: SignInDetails;
}
export interface Action {
    type: string;
    value?: any;
}
export interface Store {
    getState: () => SignInState;
    dispatch: (action: Action) => void;
}
