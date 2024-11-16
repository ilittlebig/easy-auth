/**
 * Handles the configuration of the EasyAuth library, with built-in validation.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { AuthError } from "./authError";
import { DefaultStorage } from "./storage";
import { authErrorStrings } from "../utils/errorUtils";
import type { AuthConfig, CognitoConfig } from "../../types/auth";
import type { KeyValueStorageInterface } from "../../types/auth/internal";

class EasyAuthClass {
  private resourcesConfig: AuthConfig | {} = {};
	keyValueStorage: KeyValueStorageInterface = new DefaultStorage();

  private validateConfig(config: AuthConfig): void {
    const cognitoConfig: CognitoConfig | undefined = config.Auth?.Cognito;
    if (!cognitoConfig?.userPoolId || !cognitoConfig?.userPoolClientId) {
      throw new AuthError({
        name: "InvalidConfigException",
        message: authErrorStrings.InvalidConfigException,
      });
    }
  }

  getConfig = (): AuthConfig => {
    if (Object.keys(this.resourcesConfig).length === 0) {
      throw new AuthError({
        name: "InvalidConfigException",
        message: authErrorStrings.InvalidConfigException,
      });
    }

    this.validateConfig(this.resourcesConfig as AuthConfig);
    return this.resourcesConfig as AuthConfig;
  };

	setKeyValueStorage(storage: KeyValueStorageInterface) {
		this.keyValueStorage = storage;
	}

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

  configure = (config: AuthConfig) => {
    this.validateConfig(config);
    this.resourcesConfig = config;
  };
}

export const EasyAuth = new EasyAuthClass();
