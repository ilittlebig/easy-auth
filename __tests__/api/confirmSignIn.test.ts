/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-27
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
import { confirmSignIn } from "../../src/api/confirmSignIn";
import { EasyAuth, AuthError } from "../../src/internal/classes";
import * as errorUtils from "../../src/internal/utils/errorUtils";
import { getNewDeviceMetatada } from "../../src/internal/utils/deviceMetadataUtils";
import { cacheTokens } from "../../src/internal/utils/tokenUtils";
import {
  signInStore,
  setActiveSignInState,
  cleanActiveSignInState
} from "../../src/internal/stores/signInStore";
import { handleChallenge } from "../../src/internal/challengeHandlers";
import { getNextStepFromChallenge } from "../../src/internal/nextStepHandlers";
import type { ConfirmSignInInput } from "../../src/types/auth";

vi.mock("../../src/internal/classes", () => ({
  EasyAuth: { getConfig: vi.fn() },
  AuthError: vi.fn(),
}));

vi.mock("../../src/internal/utils/deviceMetadataUtils", () => ({
  getNewDeviceMetatada: vi.fn(),
}));

vi.mock("../../src/internal/utils/tokenUtils", () => ({
  cacheTokens: vi.fn(),
}));

vi.mock("../../src/internal/stores/signInStore", () => ({
  signInStore: {
    getState: vi.fn(),
  },
  setActiveSignInState: vi.fn(),
  cleanActiveSignInState: vi.fn(),
}));

vi.mock("../../src/internal/challengeHandlers", () => ({
  handleChallenge: vi.fn(),
}));

vi.mock("../../src/internal/nextStepHandlers", () => ({
  getNextStepFromChallenge: vi.fn(),
}));

describe("confirmSignIn", () => {
  const authErrorStrings = errorUtils.authErrorStrings;

  const username = "testUser";
  const challengeName = "NEW_PASSWORD_REQUIRED";
  const signInSession = "testSession";
  const challengeResponse = "testResponse";
  const cognitoConfig = { Auth: { Cognito: { userPoolId: "testPoolId" } } };

  const mockChallengeResult = {
    ChallengeName: "SOFTWARE_TOKEN_MFA",
    ChallengeParameters: { testParam: "value" },
    AuthenticationResult: { AccessToken: "testAccessToken" },
    Session: "newSession",
  };

  const confirmSignInInput: ConfirmSignInInput = {
    challengeResponse,
    options: {},
  };

  beforeEach(() => {
    (signInStore.getState as Mock).mockReturnValue({
      username,
      challengeName,
      signInSession,
    });

    (EasyAuth.getConfig as Mock).mockReturnValue(cognitoConfig);
    (handleChallenge as Mock).mockResolvedValue(mockChallengeResult);
    (getNewDeviceMetatada as Mock).mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should handle successful authentication and return 'DONE' step", async () => {
    const authenticationResult = { AccessToken: "testAccessToken", NewDeviceMetadata: {} };
    (handleChallenge as Mock).mockResolvedValueOnce({
      ...mockChallengeResult,
      AuthenticationResult: authenticationResult,
      ChallengeName: undefined,
    });

    const assertSpy = vi.spyOn(errorUtils, "assert");
    const result = await confirmSignIn(confirmSignInInput);
    expect(assertSpy).toHaveBeenCalledWith(expect.any(Boolean), "InvalidChallengeResponseException", authErrorStrings.InvalidChallengeResponseException);
    expect(assertSpy).toHaveBeenCalledWith(expect.any(Boolean), "SignInException", authErrorStrings.SignInException);

    expect(cleanActiveSignInState).toHaveBeenCalled();
    expect(cacheTokens).toHaveBeenCalledWith(expect.objectContaining({
      username,
      authenticationResult: {
        AccessToken: "testAccessToken",
        NewDeviceMetadata: {}
      },
      newDeviceMetadata: {},
      signInDetails: undefined,
    }));

    expect(result).toEqual({
      isSignedIn: true,
      nextStep: { signInStep: "DONE" },
    });
  });

  test("should set next challenge and session state if no authentication result is returned", async () => {
    const nextChallengeName = "SOFTWARE_TOKEN_MFA";
    const challengeParameters = { testParam: "value" };

    (handleChallenge as Mock).mockResolvedValueOnce({
      ...mockChallengeResult,
      AuthenticationResult: undefined,
    });

    const result = await confirmSignIn(confirmSignInInput);

    expect(setActiveSignInState).toHaveBeenCalledWith({
      username,
      challengeName: nextChallengeName,
      signInSession: "newSession",
      signInDetails: undefined,
    });

    expect(getNextStepFromChallenge).toHaveBeenCalledWith(nextChallengeName, challengeParameters);
    // @ts-expect-error Missing CHALLENGE_NAME
    expect(result).toEqual(await getNextStepFromChallenge(nextChallengeName, challengeParameters));
  });

  test("should throw MissingChallengeNameException if challengeName is missing", async () => {
    (signInStore.getState as Mock).mockReturnValue({
      username,
      signInSession,
      challengeName: undefined,
    });

    await expect(confirmSignIn(confirmSignInInput))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toBeCalledWith({
      name: "MissingChallengeNameException",
      message: authErrorStrings.MissingChallengeNameException,
    });
  });

  test("should throw error if challengeResponse is invalid", async () => {
    const invalidInput: ConfirmSignInInput = { challengeResponse: "" };
    await expect(confirmSignIn(invalidInput))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toBeCalledWith({
      name: "InvalidChallengeResponseException",
      message: authErrorStrings.InvalidChallengeResponseException,
    });

    expect(handleChallenge).not.toHaveBeenCalled();
  });

  test("should call getNewDeviceMetatada with correct parameters on successful authentication", async () => {
    const authenticationResult = {
      AccessToken: "testAccessToken",
      NewDeviceMetadata: { DeviceKey: "testDeviceKey" },
    };

    (handleChallenge as Mock).mockResolvedValueOnce({
      ...mockChallengeResult,
      AuthenticationResult: authenticationResult,
    });

    await confirmSignIn(confirmSignInInput);

    expect(getNewDeviceMetatada).toHaveBeenCalledWith(
      cognitoConfig.Auth.Cognito.userPoolId,
      authenticationResult.NewDeviceMetadata,
      authenticationResult.AccessToken
    );
  });

  test("should handle errors thrown during handleChallenge", async () => {
    const error = new Error("Challenge handling failed");
    (handleChallenge as Mock).mockRejectedValueOnce(error);

    await expect(confirmSignIn(confirmSignInInput)).rejects.toThrow(error);
  });

  test("should handle errors thrown during getNewDeviceMetatada", async () => {
    const error = new Error("Device metadata retrieval failed");
    (getNewDeviceMetatada as Mock).mockRejectedValueOnce(error);

    await expect(confirmSignIn(confirmSignInInput))
      .rejects
      .toThrow(error);
  });
});
