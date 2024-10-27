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
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import softwareTokenMfaHandler from "../../../src/internal/challengeHandlers/softwareTokenMfa";
import { getRegion } from "../../../src/internal/utils/regionUtils";
import type { ChallengeParams } from "../../../src/types/authTypes";

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(),
  RespondToAuthChallengeCommand: vi.fn(),
}));

vi.mock("../../../src/internal/utils/regionUtils", () => ({
  getRegion: vi.fn(),
}));

describe("softwareTokenMfaHandler", () => {
  const mockClientSend = vi.fn();
  const mockGetRegion = getRegion as Mock;

  const username = "testUser";
  const signInSession = "testSession";
  const challengeResponse = "123456"; // TOTP code
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

    (CognitoIdentityProviderClient as Mock).mockImplementation(() => ({
      send: mockClientSend,
    }));

    (RespondToAuthChallengeCommand as unknown as Mock).mockImplementation(params => params);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should successfully respond to SOFTWARE_TOKEN_MFA challenge", async () => {
    const expectedResponse = {
      AuthenticationResult: {
        AccessToken: "testAccessToken",
        IdToken: "testIdToken",
        RefreshToken: "testRefreshToken",
      },
    };

    mockClientSend.mockResolvedValueOnce(expectedResponse);

    const result = await softwareTokenMfaHandler(challengeParams);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ChallengeResponses: {
        USERNAME: username,
        SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledWith({
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ChallengeResponses: {
        USERNAME: username,
        SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(result).toEqual(expectedResponse);
  });

  test("should handle error when client.send fails", async () => {
    const error = new Error("Respond to auth challenge failed");
    mockClientSend.mockRejectedValueOnce(error);

    await expect(softwareTokenMfaHandler(challengeParams)).rejects.toThrowError(error);

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ChallengeResponses: {
        USERNAME: username,
        SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });
  });
});
