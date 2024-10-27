/**
 * Unit tests for the EasyAuthClass.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-26
 */

import { describe, test, expect, beforeEach } from "vitest";
import { EasyAuth, AuthError } from "../../../src/internal/classes";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import type { AuthConfig, CognitoConfig } from "../../../src/types/authTypes";

describe("EasyAuthClass", () => {
  let easyAuthInstance: typeof EasyAuth;

  beforeEach(() => {
    easyAuthInstance = new (EasyAuth.constructor as new () => typeof EasyAuth)();
  });

  describe("configure", () => {
    test("should set configuration when valid config is provided", () => {
      const validConfig: AuthConfig = {
        Auth: {
          Cognito: {
            userPoolId: "validUserPoolId",
            userPoolClientId: "validUserPoolClientId",
          },
        },
      };

      expect(() => {
        easyAuthInstance.configure(validConfig);
      }).not.toThrow();

      const config = easyAuthInstance.getConfig();
      expect(config).toEqual(validConfig);
    });

    test("should throw InvalidConfigException when userPoolId is missing", () => {
      const invalidConfig: AuthConfig = {
        Auth: {
          Cognito: {
            // userPoolId is missing
            userPoolClientId: "validUserPoolClientId",
          } as CognitoConfig,
        },
      };

      expect(() => {
        easyAuthInstance.configure(invalidConfig);
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });

    test("should throw InvalidConfigException when userPoolClientId is missing", () => {
      const invalidConfig: AuthConfig = {
        Auth: {
          Cognito: {
            userPoolId: "validUserPoolId",
            // userPoolClientId is missing
          } as CognitoConfig,
        },
      };

      expect(() => {
        easyAuthInstance.configure(invalidConfig);
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });

    test("should throw InvalidConfigException when Cognito config is missing", () => {
      const invalidConfig: AuthConfig = {
        // @ts-expect-error Missing cognito config for testing purposes
        Auth: {
          // Cognito config is missing
        },
      };

      expect(() => {
        easyAuthInstance.configure(invalidConfig);
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });

    test("should throw InvalidConfigException when Auth config is missing", () => {
      const invalidConfig = {
        // Auth config is missing
      } as AuthConfig;

      expect(() => {
        easyAuthInstance.configure(invalidConfig);
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });
  });

  describe("getConfig", () => {
    test("should return the configuration when it is set", () => {
      const validConfig: AuthConfig = {
        Auth: {
          Cognito: {
            userPoolId: "validUserPoolId",
            userPoolClientId: "validUserPoolClientId",
          },
        },
      };

      easyAuthInstance.configure(validConfig);

      const config = easyAuthInstance.getConfig();
      expect(config).toEqual(validConfig);
    });

    test("should throw InvalidConfigException when configuration is not set", () => {
      expect(() => {
        easyAuthInstance.getConfig();
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });

    test("should throw InvalidConfigException when configuration is invalid", () => {
      // Manually set an invalid configuration
      // @ts-expect-error We're intentionally setting an invalid config for testing
      easyAuthInstance.resourcesConfig = {};

      expect(() => {
        easyAuthInstance.getConfig();
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });
  });

  describe("validateConfig", () => {
    test("should pass validation with valid config", () => {
      const validConfig: AuthConfig = {
        Auth: {
          Cognito: {
            userPoolId: "validUserPoolId",
            userPoolClientId: "validUserPoolClientId",
          },
        },
      };

      expect(() => {
        // @ts-expect-error Accessing private method for testing purposes
        easyAuthInstance.validateConfig(validConfig);
      }).not.toThrow();
    });

    test("should throw InvalidConfigException with invalid config", () => {
      const invalidConfig = {} as AuthConfig;

      expect(() => {
        // @ts-expect-error Accessing private method for testing purposes
        easyAuthInstance.validateConfig(invalidConfig);
      }).toThrowError(
        new AuthError({
          name: "InvalidConfigException",
          message: authErrorStrings.InvalidConfigException,
        })
      );
    });
  });
});
