/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
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
import { handleUserSRPAuthFlow } from "../../../src/internal/utils/authFlows/userSRPAuthFlow";
import { getDeviceMetadata } from "../../../src/internal/utils/deviceMetadataUtils";
import { handleDeviceSRPAuthFlow } from "../../../src/internal/utils/authFlows/deviceSRPAuthFlow";
import { setActiveSignInUsername } from "../../../src/internal/utils/signInUtils";
import { AuthError } from "../../../src/internal/classes";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import { getUserPoolName, getRegion } from "../../../src/internal/utils/regionUtils";
import { authTestParams } from "../../testUtils/authTestParams";
import type { UserSRPAuthParams } from "../../../src/types/authTypes";

const mocks = vi.hoisted(() => ({
  send: vi.fn()
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", async () => {
  const originalModule = await import("@aws-sdk/client-cognito-identity-provider");
  return {
    ...originalModule,
    CognitoIdentityProviderClient: vi.fn().mockReturnValue({
      send: mocks.send,
    })
  };
});

vi.mock("../../../src/internal/utils/signInUtils", async () => {
  const originalModule = await vi.importActual("../../../src/internal/utils/signInUtils");
  return {
    ...originalModule,
    setActiveSignInUsername: vi.fn()
  };
});

vi.mock("../../../src/internal/utils/deviceMetadataUtils", async () => {
  const originalModule = await vi.importActual("../../../src/internal/utils/deviceMetadataUtils");
  return {
    ...originalModule,
    getDeviceMetadata: vi.fn()
  };
});

vi.mock("../../../src/internal/utils/authFlows/deviceSRPAuthFlow", async () => {
  const originalModule = await vi.importActual("../../../src/internal/utils/authFlows/deviceSRPAuthFlow");
  return {
    ...originalModule,
    handleDeviceSRPAuthFlow: vi.fn()
  };
});

vi.mock("../../../src/internal/utils/authFlows/userSRPAuthFlow", async () => {
  const originalModule = await vi.importActual("../../../src/internal/utils/authFlows/userSRPAuthFlow");
  return {
    ...originalModule,
    handlePasswordVerifier: vi.fn()
  };
});

vi.mock("../../../src/internal/utils/regionUtils", () => ({
  getUserPoolName: vi.fn(),
  getRegion: vi.fn(),
}));

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("handleUserSRPAuthFlow", () => {
  const userSRPAuthParams: UserSRPAuthParams = {
    username: authTestParams.user1.username,
    password: authTestParams.user1.password,
    cognitoConfig: authTestParams.cognitoConfig,
  };

  const challengeParameters = {
    SRP_B: "mockSRP_B",
    SALT: "mockSALT",
    SECRET_BLOCK: "mockSecretBlock",
    USER_ID_FOR_SRP: "mockUserId",
    USERNAME: "mockUser"
  };

  beforeEach(() => {
    (getUserPoolName as Mock).mockReturnValue("mockUserPoolName");
    (getRegion as Mock).mockReturnValue("mockRegion");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should successfully complete authentication with valid challenge parameters", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    }

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);

    const result = await handleUserSRPAuthFlow(userSRPAuthParams);

    const { userPoolId } = authTestParams.cognitoConfig;
    expect(getUserPoolName).toHaveBeenCalledWith(userPoolId);
    expect(getRegion).toHaveBeenCalledWith(userPoolId);

    expect(mocks.send).toHaveBeenCalledWith(expect.any(InitiateAuthCommand));
    expect(result).toEqual(passwordVerifierResponse);
  });

  test("should include DEVICE_KEY in challengeParameters if deviceKey is present", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    }

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);

    (getDeviceMetadata as Mock).mockReturnValueOnce({
      deviceKey: "validDeviceKey"
    });

    const result = await handleUserSRPAuthFlow(userSRPAuthParams);

    const { userPoolId } = authTestParams.cognitoConfig;
    expect(getUserPoolName).toHaveBeenCalledWith(userPoolId);
    expect(getRegion).toHaveBeenCalledWith(userPoolId);

    expect(mocks.send).toHaveBeenCalledWith(expect.any(InitiateAuthCommand));
    expect(result).toEqual(passwordVerifierResponse);
  });

  test("should throw MissingChallengeParametersException if required challenge parameters are missing", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: {}, // Missing SRP_B, SALT, SECRET_BLOCK
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);

    await expect(
      handleUserSRPAuthFlow(userSRPAuthParams)
    ).rejects.toThrowError(
      new AuthError({
        name: "MissingChallengeParametersException",
        message: authErrorStrings.MissingChallengeParametersException,
      })
    );
  });

  test("should throw EmptyUserIdForSRPException if USER_ID_FOR_SRP is missing", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: {
        ...challengeParameters,
        USER_ID_FOR_SRP: undefined
      },
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);

    await expect(
      handleUserSRPAuthFlow(userSRPAuthParams)
    ).rejects.toThrowError(
      new AuthError({
        name: "EmptyUserIdForSRPException",
        message: authErrorStrings.EmptyUserIdForSRPException,
      })
    );
  });

  test("should throw MissingChallengeNameException if ChallengeName is missing", async () => {
    const authResponse = {
      ChallengeName: undefined,
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);

    await expect(
      handleUserSRPAuthFlow(userSRPAuthParams)
    ).rejects.toThrowError(
      new AuthError({
        name: "MissingChallengeNameException",
        message: authErrorStrings.MissingChallengeNameException,
      })
    );
  });

  test("should handle DEVICE_SRP_AUTH challenge by proceeding through device SRP auth flow", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      ChallengeName: "DEVICE_SRP_AUTH",
      Session: "mockDeviceSession",
    };

    const devicePasswordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockDeviceAccessToken",
      },
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);
    (handleDeviceSRPAuthFlow as Mock).mockReturnValueOnce(devicePasswordVerifierResponse);

    const result = await handleUserSRPAuthFlow(userSRPAuthParams);
    expect(result).toEqual(devicePasswordVerifierResponse);
  });

  test("should set active username from challenge parameters", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);
    await handleUserSRPAuthFlow(userSRPAuthParams);

    expect(setActiveSignInUsername).toHaveBeenCalledWith(
      challengeParameters.USERNAME
    );
  });

  test("should set active username from input username if challengeParameters.USERNAME is missing", async () => {
    const challengeParametersWithoutUsername = {
      ...challengeParameters,
      USERNAME: undefined,
    };
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParametersWithoutUsername,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);
    await handleUserSRPAuthFlow(userSRPAuthParams);

    expect(setActiveSignInUsername).toHaveBeenCalledWith(
      userSRPAuthParams.username
    );
  });

  test("should handle errors thrown by client.send(authCommand)", async () => {
    const error = new Error("Network Error");
    mocks.send.mockRejectedValueOnce(error);

    await expect(
      handleUserSRPAuthFlow(userSRPAuthParams)
    ).rejects.toThrowError(error);
  });

  test("should handle errors thrown by handlePasswordVerifier", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const error = new Error("Password Verifier Error");
    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockRejectedValueOnce(error);

    await expect(
      handleUserSRPAuthFlow(userSRPAuthParams)
    ).rejects.toThrowError(error);
  });

  test("should handle unexpected ChallengeName values", async () => {
    const authResponse = {
      ChallengeName: "UNKNOWN_CHALLENGE",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      ChallengeName: "UNKNOWN_CHALLENGE",
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);

    const result = await handleUserSRPAuthFlow(userSRPAuthParams);
    expect(result).toEqual(passwordVerifierResponse);
  });

  /*
  test("should call handlePasswordVerifier with correct parameters", async () => {
    const authResponse = {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const passwordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce(passwordVerifierResponse);
    await handleUserSRPAuthFlow(userSRPAuthParams);

    expect(handlePasswordVerifier).toHaveBeenCalledWith({
      challengeName: authResponse.ChallengeName,
      cognitoConfig: authTestParams.cognitoConfig,
      client: expect.any(Object),
      srp: expect.any(Object),
      password: userSRPAuthParams.password,
      challengeParameters: authResponse.ChallengeParameters,
      session: authResponse.Session,
    });
  });
  */
});
