import { AuthConfig } from '../../types/auth';
import { KeyValueStorageInterface } from '../../types/auth/internal';
declare class EasyAuthClass {
    private resourcesConfig;
    keyValueStorage: KeyValueStorageInterface;
    private validateConfig;
    getConfig: () => AuthConfig;
    setKeyValueStorage(storage: KeyValueStorageInterface): void;
    /**
     * Example usage:
     *
     * EasyAuth.configure({
     *   Auth: {
     *     Cognito: {
     *       userPoolId: "your_user_pool_id",
     *       clientId: "your_client_id",
     *     }
     *   }
     * });
     *
     */
    configure: (config: AuthConfig) => void;
}
export declare const EasyAuth: EasyAuthClass;
export {};
