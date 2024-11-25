import { KeyValueStorageInterface } from './internal';
export * from './inputs';
export * from './outputs';
export interface SignInDetails {
    loginId: string;
    authFlowType: string;
}
export interface CognitoConfig {
    userPoolId: string;
    userPoolClientId: string;
}
export interface AuthConfig {
    Auth: {
        Cognito: CognitoConfig;
    };
}
export interface CognitoResponse {
    ChallengeName: string;
    [key: string]: any;
}
export interface CognitoMFASettings {
    Enabled: true | false;
    PreferredMfa?: true | false;
}
export type { KeyValueStorageInterface };
