/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

/*
import {
  vi,
  describe,
  test,
  expect,
  type Mock
} from "vitest";
import { clearTokens, storeTokens, cacheTokens } from "../../src/internal/utils/tokenUtils";
import { AuthError } from "../../src/internal/classes";
import { authErrorStrings } from "../../src/internal/utils/errorUtils";
import { decodeJWT } from "../../src/internal/utils/decodeUtils";
import {
  getAuthKeys,
  getLastAuthUserKey,
  getKeyValueStorage,
  storeItem,
  storeJSON,
  storeDeviceMetadata
} from "../../src/internal/utils/storageUtils";
import type { TokensType, CacheTokensInput } from "../../src/types/tokenTypes";

vi.mock("../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

// Mock functions from storageUtils and other external modules
vi.mock("../../src/internal/utils/storageUtils", () => ({
  getAuthKeys: vi.fn(),
  getLastAuthUserKey: vi.fn(),
  getKeyValueStorage: vi.fn(),
  storeItem: vi.fn(),
  storeJSON: vi.fn(),
  storeDeviceMetadata: vi.fn(),
}));

vi.mock("../../src/internal/utils/decodeUtils", () => ({
  decodeJWT: vi.fn(),
}));

describe("clearTokens", () => {
  test("should call removeItem for all relevant keys", () => {
    const mockStorage = {
      removeItem: vi.fn(),
    };

    const mockAuthKeys = {
      accessToken: "accessTokenKey",
      idToken: "idTokenKey",
      refreshToken: "refreshTokenKey",
      clockDrift: "clockDriftKey",
      signInDetails: "signInDetailsKey"
    };

    const mockLastAuthUserKey = "lastAuthUserKey";

    (getAuthKeys as Mock).mockReturnValue(mockAuthKeys);
    (getLastAuthUserKey as Mock).mockReturnValue(mockLastAuthUserKey);
    (getKeyValueStorage as Mock).mockReturnValue(mockStorage);

    clearTokens();

    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockAuthKeys.accessToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockAuthKeys.idToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockAuthKeys.clockDrift);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockAuthKeys.refreshToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockAuthKeys.signInDetails);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockLastAuthUserKey);
    expect(mockStorage.removeItem).toHaveBeenCalledTimes(6);
  });
});

describe("storeTokens", () => {
  test("should throw an error if tokens are invalid", () => {
    expect(() => storeTokens(null as unknown as TokensType)).toThrow(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidAuthTokensException",
      message: authErrorStrings.InvalidAuthTokensException,
    });
  });

  test("should store tokens correctly", () => {
    const mockTokens: TokensType = {
      accessToken: {
        toString: () => "mockAccessToken",
        payload: { accessToken: "mockAccessToken" },
      },
      idToken: "mockIdToken",
      refreshToken: "mockRefreshToken",
      clockDrift: 1234,
      deviceMetadata: { DeviceKey: "mockDeviceKey" },
      signInDetails: { signInTimestamp: Date.now() },
      username: "mockUsername",
    };

    const mockAuthKeys = {
      accessToken: "accessTokenKey",
      idToken: "idTokenKey",
      refreshToken: "refreshTokenKey",
      clockDrift: "clockDriftKey",
      signInDetails: "signInDetailsKey",
    };

    (getAuthKeys as Mock).mockReturnValue(mockAuthKeys);

    storeTokens(mockTokens);

    expect(storeItem).toHaveBeenCalledWith(mockAuthKeys.accessToken, mockTokens.accessToken);
    expect(storeItem).toHaveBeenCalledWith(mockAuthKeys.idToken, mockTokens.idToken);
    expect(storeItem).toHaveBeenCalledWith(mockAuthKeys.refreshToken, mockTokens.refreshToken);
    expect(storeDeviceMetadata).toHaveBeenCalledWith(mockTokens.deviceMetadata, mockAuthKeys);
    expect(storeJSON).toHaveBeenCalledWith(mockAuthKeys.signInDetails, mockTokens.signInDetails);
    expect(storeItem).toHaveBeenCalledWith(mockAuthKeys.clockDrift, `${mockTokens.clockDrift}`);
  });
});

describe("cacheTokens", () => {
  test("should throw an error if accessToken is missing", () => {
    const cacheTokensInput: CacheTokensInput = {
      username: "mockUsername",
      authenticationResult: {
        AccessToken: "",
        IdToken: "mockIdToken",
        RefreshToken: "mockRefreshToken",
      },
      signInDetails: { signInTimestamp: Date.now() },
    };

    expect(() => cacheTokens(cacheTokensInput)).toThrow(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "NoAccessTokenException",
      message: authErrorStrings.NoAccessTokenException,
    });
  });

  test("should decode JWT tokens and store them", () => {
    const mockAccessToken = { payload: { iat: 1234567890 } };
    const mockIdToken = { payload: { sub: "mockSub" } };

    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessToken") return mockAccessToken;
      if (token === "mockIdToken") return mockIdToken;
    });

    const cacheTokensInput: CacheTokensInput = {
      username: "mockUsername",
      authenticationResult: {
        AccessToken: "mockAccessToken",
        IdToken: "mockIdToken",
        RefreshToken: "mockRefreshToken",
      },
      signInDetails: { signInTimestamp: Date.now() },
    };

    cacheTokens(cacheTokensInput);

    expect(decodeJWT).toHaveBeenCalledWith("mockAccessToken");
    expect(decodeJWT).toHaveBeenCalledWith("mockIdToken");

    const expectedTokens: TokensType = {
      accessToken: mockAccessToken,
      idToken: mockIdToken,
      refreshToken: "mockRefreshToken",
      clockDrift: expect.any(Number), // Since clockDrift is dynamic
      deviceMetadata: undefined, // No deviceMetadata in this test case
      username: "mockUsername",
      signInDetails: cacheTokensInput.signInDetails,
    };

    expect(storeTokens).toHaveBeenCalledWith(expectedTokens);
  });
});
*/
