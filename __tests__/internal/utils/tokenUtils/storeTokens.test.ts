/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  type Mock
} from "vitest";
import { EasyAuth } from "../../../../src/internal/classes";
import { storeTokens } from "../../../../src/internal/utils/tokenUtils";
import {
  storeItem,
  storeJSON,
  storeDeviceMetadata,
  getAuthKeys
} from "../../../../src/internal/utils/storageUtils";
import { AuthError } from "../../../../src/internal/classes";
import { authErrorStrings } from "../../../../src/internal/utils/errorUtils";
import { authTestParams } from "../../../testUtils/authTestParams";
import type { TokensType } from "../../../../src/types/auth/internal";

vi.mock("../../../../src/internal/utils/tokenUtils", async () => {
  const actual = await import("../../../../src/internal/utils/tokenUtils");
  return {
    ...actual,
    clearTokens: vi.fn(),
  };
});

vi.mock("../../../../src/internal/utils/storageUtils", async () => {
  const actual = await import("../../../../src/internal/utils/storageUtils");
  return {
    ...actual,
    storeItem: vi.fn(),
    storeJSON: vi.fn(),
    storeDeviceMetadata: vi.fn(),
    getAuthKeys: vi.fn(),
  };
});

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("storeTokens", () => {
  const authKeys = {
    accessToken: "mockAccessTokenKey",
    idToken: "mockIdTokenKey",
    refreshToken: "mockRefreshTokenKey",
    clockDrift: "mockClockDriftKey",
    signInDetails: "mockSignInDetailsKey",
  };

  beforeEach(() => {
    (getAuthKeys as Mock).mockReturnValue(authKeys);
    vi.clearAllMocks();
  });

  test("should throw an error if tokens are invalid", () => {
    expect(() => storeTokens(null as unknown as TokensType)).toThrowError(
      new AuthError({
        name: "InvalidAuthTokensException",
        message: authErrorStrings.InvalidAuthTokensException,
      })
    );
  });

  test("should store each token and related metadata correctly", () => {
    const tokens: TokensType = authTestParams.tokens;
    storeTokens(tokens);

    expect(storeItem).toHaveBeenCalledWith(authKeys.accessToken, tokens.accessToken.toString());
    expect(storeItem).toHaveBeenCalledWith(authKeys.idToken, tokens.idToken?.toString());
    expect(storeItem).toHaveBeenCalledWith(authKeys.refreshToken, tokens.refreshToken);
    expect(storeDeviceMetadata).toHaveBeenCalledWith(authKeys, tokens.deviceMetadata, storeItem);
    expect(storeJSON).toHaveBeenCalledWith(authKeys.signInDetails, tokens.signInDetails);
    expect(storeItem).toHaveBeenCalledWith(authKeys.clockDrift, "300");
  });

  test("should handle missing optional fields gracefully", () => {
    const tokens: TokensType = {
      ...authTestParams.tokens,
      idToken: undefined,
      refreshToken: undefined,
      deviceMetadata: undefined,
    };

    storeTokens(tokens);

    expect(storeItem).toHaveBeenCalledWith(authKeys.accessToken, tokens.accessToken.toString());
    expect(storeItem).not.toHaveBeenCalledWith(authKeys.idToken, expect.any(String));
    expect(storeItem).not.toHaveBeenCalledWith(authKeys.refreshToken, expect.any(String));
    expect(storeDeviceMetadata).toHaveBeenCalledWith(authKeys, undefined, storeItem);
    expect(storeJSON).toHaveBeenCalledWith(authKeys.signInDetails, tokens.signInDetails);
    expect(storeItem).toHaveBeenCalledWith(authKeys.clockDrift, "300");
  });
});
