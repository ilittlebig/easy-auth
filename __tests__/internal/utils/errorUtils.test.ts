/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

import {
  vi,
  describe,
  test,
  expect,
  afterEach,
  type Mock,
} from "vitest";
import { AuthError } from "../../../src/internal/classes";
import {
  authErrorStrings,
  validateDeviceMetadata,
  assert,
  validateUserNotAuthenticated,
  validateAuthTokens,
} from "../../../src/internal/utils/errorUtils";
import { getCurrentUser } from "../../../src/api/getCurrentUser";
import type { TokensType } from "../../../src/types/auth/internal";
import type { AuthUserOutput, NewDeviceMetadataOutput } from "../../../src/types/auth";

vi.mock("../../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

vi.mock("../../../src/api/getCurrentUser", () => ({
  getCurrentUser: vi.fn(),
}));

describe("assert", () => {
  test("does not throw an error if assertion is true", () => {
    expect(() => assert(true, "AnyException", "Should not throw"))
      .not
      .toThrow();
  });

  test("throws an error if assertion is false", () => {
    expect(() => assert(false, "TestException", "Test failed"))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "TestException",
      message: "Test failed",
    });
  });
});

describe("validateUserNotAuthenticated", () => {
  test("does not throw error if user is not authenticated", async () => {
    (getCurrentUser as Mock).mockRejectedValue(new Error(""));

    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });

  test("throws error if user is authenticated", async () => {
    const mockAuthUser: AuthUserOutput = { userId: "123", username: "testUser" };
    (getCurrentUser as Mock).mockResolvedValue(mockAuthUser);

    await expect(validateUserNotAuthenticated())
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "UserAlreadyAuthenticatedException",
      message: authErrorStrings.UserAlreadyAuthenticatedException,
    });
  });

  test("does not throw error if getCurrentUser fails", async () => {
    (getCurrentUser as Mock).mockRejectedValue(new Error("User not found"));
    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });

  test("does not throw error if user has incomplete information", async () => {
    const incompleteAuthUser: Partial<AuthUserOutput> = { userId: undefined, username: undefined };
    (getCurrentUser as Mock).mockResolvedValue(incompleteAuthUser);
    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });
});

describe("validateDeviceMetadata", () => {
  test("does not throw error if device metadata is valid", async () => {
    const deviceMetadata = {
      deviceKey: "validDeviceKey",
      deviceGroupKey: "validDeviceGroupKey",
      randomPassword: "validRandomPassword",
    } as NewDeviceMetadataOutput;

    expect(() => validateDeviceMetadata(deviceMetadata))
      .not
      .toThrow();
  });

  test("throws error if device metadata is undefined", async () => {
    expect(() => validateDeviceMetadata(undefined))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "DeviceMetadataException",
      message: authErrorStrings.DeviceMetadataException,
    });
  });

  test("throws error if device metadata has invalid field types", async () => {
    const deviceMetadata = {
      deviceKey: 1234,
      deviceGroupKey: 1122,
      randomPassword: "validRandomPassword",
    } as unknown as NewDeviceMetadataOutput;

    expect(() => validateDeviceMetadata(deviceMetadata))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "DeviceMetadataException",
      message: authErrorStrings.DeviceMetadataException,
    });
  });

  test("throws error if device metadata is missing fields", async () => {
    const deviceMetadata = {
      randomPassword: "validRandomPassword",
    } as NewDeviceMetadataOutput;

    expect(() => validateDeviceMetadata(deviceMetadata))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "DeviceMetadataException",
      message: authErrorStrings.DeviceMetadataException,
    });
  });

  test("throws error if device metadata has empty fields", async () => {
    const deviceMetadata = {
      deviceKey: "",
      deviceGroupKey: "",
      randomPassword: "",
    } as NewDeviceMetadataOutput;

    expect(() => validateDeviceMetadata(deviceMetadata))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "DeviceMetadataException",
      message: authErrorStrings.DeviceMetadataException,
    });
  });
});

describe("validateAuthTokens", () => {
  const validAccessToken = {
    toString: () => "validAccessToken",
    payload: { sub: "1234567" },
  };
  const emptyAccessToken = { toString: () => "" };

  const validTokens: Partial<TokensType> = { accessToken: validAccessToken };
  // @ts-expect-error AccessToken is missing payload
  const tokensWithEmptyAccessToken: Partial<TokensType> = { accessToken: emptyAccessToken };
  const tokensWithUndefinedAccessToken: Partial<TokensType> = { accessToken: undefined };
  const emptyTokens = {};

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should validate successfully when tokens contain an accessToken with a non-empty toString result", () => {
    expect(() => validateAuthTokens(validTokens)).not.toThrow();
  });

  test("should throw UserUnauthenticatedException if accessToken has an empty toString result", () => {
    expect(() => validateAuthTokens(tokensWithEmptyAccessToken)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "UserUnauthenticatedException",
      message: authErrorStrings.UserUnauthenticatedException,
    });
  });

  test("should throw UserUnauthenticatedException if accessToken is undefined", () => {
    expect(() => validateAuthTokens(tokensWithUndefinedAccessToken)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "UserUnauthenticatedException",
      message: authErrorStrings.UserUnauthenticatedException,
    });
  });

  test("should throw UserUnauthenticatedException if accessToken is missing entirely", () => {
    expect(() => validateAuthTokens(emptyTokens)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "UserUnauthenticatedException",
      message: authErrorStrings.UserUnauthenticatedException,
    });
  });

  test("should throw UserUnauthenticatedException if accessToken is not an object with a toString method", () => {
    const tokensWithInvalidType = { accessToken: 12345 };
    expect(() => validateAuthTokens(tokensWithInvalidType)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "UserUnauthenticatedException",
      message: authErrorStrings.UserUnauthenticatedException,
    });
  });
});
