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
import { EasyAuth, AuthError } from "../../../../src/internal/classes";
import { cacheTokens, storeTokens } from "../../../../src/internal/utils/tokenUtils";
import { decodeJWT } from "../../../../src/internal/utils/decodeUtils";
import { authErrorStrings } from "../../../../src/internal/utils/errorUtils";
import { authTestParams } from "../../../testUtils/authTestParams";
import type { TokensType } from "../../../../src/types/auth/internal";

// Mock dependencies
vi.mock("../../../../src/internal/utils/decodeUtils", () => ({
  decodeJWT: vi.fn(),
}));

vi.mock("../../../../src/internal/utils/tokenUtils/storeTokens", async () => ({
  storeTokens: vi.fn(),
}));

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("cacheTokens", () => {
  const username = "testUser";
  const signInDetails = {
    loginId: "validId",
    authFlowType: "validAuthFlowType"
  };

  const authenticationResult = {
    AccessToken: "mockAccessTokenJWT",
    IdToken: "mockIdTokenJWT",
    RefreshToken: "mockRefreshToken",
  };

  const deviceMetadata = {
    deviceKey: "mocked-device-key",
    deviceGroupKey: "mocked-device-group-key",
    randomPassword: "mocked-random-password",
  };

  const decodedAccessToken = {
    header: {},
    payload: {
      iat: 1698250000,
    },
    signature: "signature",
  };

  const decodedIdToken = {
    header: {},
    payload: {
      iat: 1698250000,
    },
    signature: "signature",
  };

  beforeEach(() => {
    vi.useFakeTimers();
    const fixedDate = new Date("2024-10-25T00:00:00Z");
    vi.setSystemTime(fixedDate);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should cache tokens correctly when all tokens are present", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    const currentTime = new Date().getTime();
    const expectedClockDrift = decodedAccessToken.payload.iat * 1000 - currentTime;

    const expectedTokens: TokensType = {
      accessToken: decodedAccessToken,
      idToken: decodedIdToken,
      refreshToken: "mockRefreshToken",
      clockDrift: expectedClockDrift,
      deviceMetadata,
      username,
      signInDetails,
    };

    cacheTokens({
      username,
      authenticationResult,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(decodeJWT).toHaveBeenCalledWith("mockAccessTokenJWT");
    expect(decodeJWT).toHaveBeenCalledWith("mockIdTokenJWT");
    expect(storeTokens).toHaveBeenCalledWith(expectedTokens);
  });

  test("should throw NoAccessTokenException if AccessToken is missing", () => {
    const authResultWithoutAccessToken = {
      ...authenticationResult,
      AccessToken: undefined,
    };

    expect(() => {
      cacheTokens({
        username,
        authenticationResult: authResultWithoutAccessToken,
        newDeviceMetadata: deviceMetadata,
        signInDetails,
      });
    }).toThrowError(
      new AuthError({
        name: "NoAccessTokenException",
        message: authErrorStrings.NoAccessTokenException,
      })
    );
  });

  test("should handle missing RefreshToken", () => {
    (decodeJWT as Mock).mockImplementation(() => {
      return decodedAccessToken;
    });

    const authResultWithoutRefreshToken = {
      ...authenticationResult,
      RefreshToken: undefined,
    };

    const currentTime = new Date().getTime();
    const expectedClockDrift =
      decodedAccessToken.payload.iat * 1000 - currentTime;

    const expectedTokens: TokensType = {
      accessToken: decodedAccessToken,
      idToken: decodedIdToken,
      refreshToken: undefined,
      clockDrift: expectedClockDrift,
      deviceMetadata,
      username,
      signInDetails,
    };

    cacheTokens({
      username,
      authenticationResult: authResultWithoutRefreshToken,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(decodeJWT).toHaveBeenCalledWith("mockAccessTokenJWT");
    expect(decodeJWT).toHaveBeenCalledWith("mockIdTokenJWT");
    expect(storeTokens).toHaveBeenCalledWith(expectedTokens);
  });

  test("should handle missing IdToken", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      }
      return null;
    });

    const authResultWithoutIdToken = {
      ...authenticationResult,
      IdToken: undefined,
    };

    const currentTime = new Date().getTime();
    const expectedClockDrift =
      decodedAccessToken.payload.iat * 1000 - currentTime;

    const expectedTokens: TokensType = {
      accessToken: decodedAccessToken,
      idToken: undefined,
      refreshToken: "mockRefreshToken",
      clockDrift: expectedClockDrift,
      deviceMetadata,
      username,
      signInDetails,
    };

    cacheTokens({
      username,
      authenticationResult: authResultWithoutIdToken,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(decodeJWT).toHaveBeenCalledWith("mockAccessTokenJWT");
    expect(decodeJWT).toHaveBeenCalledTimes(1);
    expect(storeTokens).toHaveBeenCalledWith(expectedTokens);
  });

  test("should calculate clockDrift correctly", () => {
    const mockIat = Math.floor(new Date().getTime() / 1000) - 100;
    const decodedAccessTokenWithIat = {
      ...decodedAccessToken,
      payload: {
        ...decodedAccessToken.payload,
        iat: mockIat,
      },
    };

    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessTokenWithIat;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    const currentTime = new Date().getTime();
    const expectedClockDrift = mockIat * 1000 - currentTime;

    cacheTokens({
      username,
      authenticationResult,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        clockDrift: expectedClockDrift,
      })
    );
  });

  test("should set clockDrift to 0 if iat is missing", () => {
    const decodedAccessTokenWithoutIat = {
      ...decodedAccessToken,
      payload: {
        ...decodedAccessToken.payload,
        iat: undefined,
      },
    };

    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessTokenWithoutIat;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    cacheTokens({
      username,
      authenticationResult,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        clockDrift: 0,
      })
    );
  });

  test("should pass deviceMetadata correctly", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    cacheTokens({
      username,
      authenticationResult,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({ deviceMetadata })
    );
  });

  test("should handle missing deviceMetadata", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    cacheTokens({
      username,
      authenticationResult,
      signInDetails,
    });

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceMetadata: undefined,
      })
    );
  });

  test("should throw error if decodeJWT throws error for AccessToken", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        throw new Error("Invalid AccessToken");
      }
      return decodedIdToken;
    });

    expect(() => {
      cacheTokens({
        username,
        authenticationResult,
        newDeviceMetadata: deviceMetadata,
        signInDetails,
      });
    }).toThrowError("Invalid AccessToken");
  });

  test("should proceed if decodeJWT throws error for IdToken", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      } else if (token === "mockIdTokenJWT") {
        throw new Error("Invalid IdToken");
      }
      return null;
    });

    expect(() => {
      cacheTokens({
        username,
        authenticationResult,
        newDeviceMetadata: deviceMetadata,
        signInDetails,
      });
    }).toThrowError("Invalid IdToken");

    expect(storeTokens).not.toBeCalled();
  });

  test("should pass username and signInDetails to storeTokens", () => {
    (decodeJWT as Mock).mockImplementation((token: string) => {
      if (token === "mockAccessTokenJWT") {
        return decodedAccessToken;
      } else if (token === "mockIdTokenJWT") {
        return decodedIdToken;
      }
      return null;
    });

    cacheTokens({
      username,
      authenticationResult,
      newDeviceMetadata: deviceMetadata,
      signInDetails,
    });

    expect(storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        username,
        signInDetails,
      })
    );
  });
});
