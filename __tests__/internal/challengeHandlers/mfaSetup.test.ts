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
import {
  RespondToAuthChallengeCommand,
  VerifySoftwareTokenCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import mfaSetupHandler from "../../../src/internal/challengeHandlers/mfaSetup";
import { getRegion } from "../../../src/internal/utils/regionUtils";
import { signInStore } from "../../../src/internal/stores/signInStore";
import type { ChallengeParams } from "../../../src/types/authTypes";

vi.mock("@aws-sdk/client-cognito-identity-provider", () => {
  return {
    CognitoIdentityProviderClient: vi.fn(),
    VerifySoftwareTokenCommand: vi.fn(),
    RespondToAuthChallengeCommand: vi.fn(),
  };
});

vi.mock("../../../src/internal/utils/regionUtils", () => {
  return {
    getRegion: vi.fn(),
  };
});

vi.mock("../../../src/internal/stores/signInStore", () => {
  return {
    signInStore: {
      dispatch: vi.fn(),
    },
  };
});

describe("mfaSetupHandler", () => {
  const mockClientSend = vi.fn();
  const mockGetRegion = getRegion as Mock;
  const mockSignInStoreDispatch = signInStore.dispatch as Mock;

  const username = "testUser";
  const signInSession = "testSession";
  const challengeResponse = "123456";
  const cognitoConfig = {
    userPoolId: "us-east-1_testPoolId",
    userPoolClientId: "testClientId",
  };
  const region = "us-east-1";

  const challengeParams: ChallengeParams = {
    username,
    signInSession,
    challengeResponse,
    cognitoConfig,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRegion.mockReturnValue(region);

    (CognitoIdentityProviderClient as Mock).mockImplementation(() => {
      return {
        send: mockClientSend,
      };
    });

    (VerifySoftwareTokenCommand as unknown as Mock).mockImplementation(params => params);
    (RespondToAuthChallengeCommand as unknown as Mock).mockImplementation(params => params);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should successfully verify software token and respond to auth challenge", async () => {
    const newSession = "newTestSession";
    const expectedFinalResponse = {
      AuthenticationResult: {
        AccessToken: "testAccessToken",
        IdToken: "testIdToken",
        RefreshToken: "testRefreshToken",
      },
    };

    mockClientSend.mockResolvedValueOnce({
      Session: newSession,
    }).mockResolvedValueOnce(expectedFinalResponse);

    const result = await mfaSetupHandler(challengeParams);

    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });
    expect(VerifySoftwareTokenCommand).toHaveBeenCalledWith({
      UserCode: challengeResponse,
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenNthCalledWith(1, {
      UserCode: challengeResponse,
      Session: signInSession,
    });

    expect(mockSignInStoreDispatch).toHaveBeenCalledWith({
      type: "SET_SIGN_IN_SESSION",
      value: newSession,
    });

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "MFA_SETUP",
      ChallengeResponses: {
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: newSession,
    });

    expect(mockClientSend).toHaveBeenNthCalledWith(2, {
      ChallengeName: "MFA_SETUP",
      ChallengeResponses: {
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: newSession,
    });

    expect(result).toEqual(expectedFinalResponse);
  });

  test("should handle error when VerifySoftwareTokenCommand fails", async () => {
    const error = new Error("Verification failed");
    mockClientSend.mockRejectedValueOnce(error);
    await expect(mfaSetupHandler(challengeParams)).rejects.toThrowError(error);

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(mockSignInStoreDispatch).not.toHaveBeenCalled();
    expect(RespondToAuthChallengeCommand).not.toHaveBeenCalled();
  });

  test("should handle error when RespondToAuthChallengeCommand fails", async () => {
    const newSession = "newTestSession";
    const error = new Error("Respond to auth challenge failed");

    mockClientSend.mockResolvedValueOnce({
      Session: newSession,
    }).mockRejectedValueOnce(error);

    await expect(mfaSetupHandler(challengeParams)).rejects.toThrowError(error);
    expect(mockClientSend).toHaveBeenCalledTimes(2);

    expect(mockSignInStoreDispatch).toHaveBeenCalledWith({
      type: "SET_SIGN_IN_SESSION",
      value: newSession,
    });
  });
});
