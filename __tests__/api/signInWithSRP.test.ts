/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */


import { RespondToAuthChallengeCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import { EasyAuth } from "../../src/internal/classes";
import { signInWithSRP } from "../../src/api/signInWithSRP";
import { authTestParams } from "../testUtils/authTestParams";
import { authErrorStrings } from "../../src/internal/utils/errorUtils";
import * as userSRPAuthUtils from "../../src/internal/utils/authFlowUtils/userSRPAuthFlow";

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

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("signInWithSRP", () => {
  beforeEach(() => {
    mocks.send.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should sign in successfully with valid SRP credentials", async () => {
    mocks.send.mockImplementationOnce(() => authTestParams.handleUserSRPAuthFlow1);
    mocks.send.mockImplementationOnce(() => authTestParams.handleUserSRPAuthFlow2);

    const result = await signInWithSRP({
      username: authTestParams.user1.username,
      password: authTestParams.user1.password
    });

    expect(result).toEqual(authTestParams.signInResult);
    expect(mocks.send).toHaveBeenCalledTimes(3);
  });

  test("should handle login with valid SRP credentials and return the next step/challenge", async () => {
    const spy = vi.spyOn(userSRPAuthUtils, "handleUserSRPAuthFlow");
    spy.mockImplementationOnce(async () => {
      const mockResponse: Partial<RespondToAuthChallengeCommandOutput> = {
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ChallengeParameters: {},
      };
      return mockResponse as RespondToAuthChallengeCommandOutput;
    });

    const result = await signInWithSRP({
      username: authTestParams.user1.username,
      password: authTestParams.user1.password
    });

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      }
    });

    expect(userSRPAuthUtils.handleUserSRPAuthFlow).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if successful login but challenge name is missing in result", async () => {
    const spy = vi.spyOn(userSRPAuthUtils, "handleUserSRPAuthFlow");
    spy.mockImplementationOnce(async () => {
      const mockResponse: Partial<RespondToAuthChallengeCommandOutput> = {
        // ChallengeName is missing
      };
      return mockResponse as RespondToAuthChallengeCommandOutput;
    });

    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: authTestParams.user1.password,
      })
    ).rejects.toThrowError(authErrorStrings.MissingChallengeNameException);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("should throw PasswordResetRequiredException and handle it successfully", async () => {
    const spy = vi.spyOn(userSRPAuthUtils, "handleUserSRPAuthFlow");
    spy.mockImplementationOnce(() => {
      const error = new Error("Password reset is required");
      error.name = "PasswordResetRequiredException";
      throw error;
    });

    const result = await signInWithSRP({
      username: authTestParams.user1.username,
      password: authTestParams.user1.password,
    })

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: { signInStep: "RESET_PASSWORD" },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if username is missing", async () => {
    await expect(
      signInWithSRP({
        username: "",
        password: authTestParams.user1.password,
      })
    ).rejects.toThrowError(authErrorStrings.EmptyUsernameException);

    expect(mocks.send).not.toHaveBeenCalled();
  });

  test("should throw an error if password is missing", async () => {
    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: "",
      })
    ).rejects.toThrowError(authErrorStrings.EmptyPasswordException);

    expect(mocks.send).not.toHaveBeenCalled();
  });

  test("should throw an error if challenge name is missing", async () => {
    mocks.send.mockImplementationOnce(() => ({
      ...authTestParams.handleUserSRPAuthFlow1,
      ChallengeName: undefined,
      // Missing ChallengeName
    }));

    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: authTestParams.user1.password,
      })
    ).rejects.toThrowError(authErrorStrings.MissingChallengeNameException);

    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if SRP challenge parameters are missing", async () => {
    mocks.send.mockImplementationOnce(() => ({
      ChallengeName: "USER_SRP_AUTH",
      ChallengeParameters: {
        // Missing SRP_B, SALT, and SECRET_BLOCK
      },
      Session: "some-session-token",
    }));

    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: authTestParams.user1.password,
      })
    ).rejects.toThrowError(authErrorStrings.MissingChallengeParametersException);

    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  test("should throw a NotAuthorizedException if SRP verification fails (incorrect password)", async () => {
    mocks.send.mockImplementationOnce(() => {
      throw new Error("NotAuthorizedException: Incorrect username or password.");
    });

    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: "wrong_password",
      })
    ).rejects.toThrowError("NotAuthorizedException: Incorrect username or password.");

    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  /*
  TODO: device metadata test
  test("should sign in successfully and handle new device metadata", async () => {
    mocks.send.mockImplementationOnce(() => {
      return authTestParams.handleUserSRPAuthFlowWithNewDeviceMetadata;
    });

    const result = await signInWithSRP({
      username: authTestParams.user1.username,
      password: authTestParams.user1.password,
    });

    expect(result).toEqual(authTestParams.signInResultWithNewDeviceMetadata);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  */

  test("should handle cognito service error", async () => {
    mocks.send.mockImplementationOnce(() => {
      throw new Error("Cognito service failure");
    });

    await expect(
      signInWithSRP({
        username: authTestParams.user1.username,
        password: authTestParams.user1.password,
      })
    ).rejects.toThrowError("Cognito service failure");

    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
});
