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
  afterEach,
  type Mock,
} from "vitest";
import { EasyAuth } from "../../../src/internal/classes";
import { cacheTokens, storeTokens } from "../../../src/internal/utils/tokenUtils";
import { decodeJWT } from "../../../src/internal/utils/decodeUtils";
import { AuthError } from "../../../src/internal/classes";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import { authTestParams, VALID_ACCESS_TOKEN } from "../../testUtils/authTestParams";
import type { CacheTokensInput } from "../../../src/types/tokenTypes";

vi.mock("../../../src/internal/utils/tokenUtils", async () => {
  const actual = await import("../../../src/internal/utils/tokenUtils");
  return {
    ...actual,
    storeTokens: vi.fn(),
  };
});

vi.mock("../../../src/internal/utils/decodeUtils", () => ({
  decodeJWT: vi.fn(),
}));

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("cacheTokens", () => {
  const currentTime = 1680000000000;

  const mockAccessToken = authTestParams.tokens.accessToken;
  const mockIdToken = authTestParams.tokens.idToken;
  const authenticationResult = authTestParams.authenticationResult;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentTime);

    (decodeJWT as Mock).mockImplementation(token => {
      return token === VALID_ACCESS_TOKEN ? mockAccessToken : mockIdToken;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  /*
  test("should throw an error if AccessToken is missing", () => {
    const input = {
      username,
      authenticationResult: { ...authenticationResult, AccessToken: undefined },
      signInDetails,
    } as CacheTokensInput;

    expect(() => cacheTokens(input)).toThrowError(
      new AuthError({
        name: "NoAccessTokenException",
        message: authErrorStrings.NoAccessTokenException,
      })
    );
  });
  */

  test("should calculate clock drift and store tokens", () => {
    const input: CacheTokensInput = {
      username: authTestParams.user1.username,
      authenticationResult: authTestParams.authenticationResult,
      signInDetails: authTestParams.tokens.signInDetails,
    };

    cacheTokens(input);

    const expectedClockDrift = mockAccessToken.payload.iat * 1000 - currentTime;
    expect(decodeJWT).toHaveBeenCalledWith(authenticationResult.AccessToken);
    expect(decodeJWT).toHaveBeenCalledWith(authenticationResult.IdToken);

    // Validate storeTokens called with TokensType object
    expect(storeTokens).toHaveBeenCalledWith({
      accessToken: mockAccessToken,
      idToken: mockIdToken,
      refreshToken: authenticationResult.RefreshToken,
      clockDrift: expectedClockDrift,
      deviceMetadata: authenticationResult.NewDeviceMetadata,
      username: authTestParams.user1.username,
      signInDetails: authTestParams.tokens.signInDetails,
    });
  });

  /*
  test("should handle optional RefreshToken and IdToken gracefully", () => {
    const input: CacheTokensInput = {
      username,
      authenticationResult: {
        AccessToken: "mockAccessToken",
        // IdToken and RefreshToken are missing
      } as any,
      signInDetails,
    };

    cacheTokens(input);

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: mockAccessToken,
        idToken: undefined,
        refreshToken: undefined,
      })
    );
  });
  */
});
