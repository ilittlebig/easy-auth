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
import newPasswordRequiredHandler from "../../../src/internal/challengeHandlers/newPasswordRequired";
import { getRegion } from "../../../src/internal/utils/regionUtils";
import type { ChallengeParams } from "../../../src/types/authTypes";

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(),
  RespondToAuthChallengeCommand: vi.fn(),
}));

vi.mock("../../../src/internal/utils/regionUtils", () => ({
  getRegion: vi.fn(),
}));

describe("newPasswordRequiredHandler", () => {
  const mockClientSend = vi.fn();
  const mockGetRegion = getRegion as Mock;

  const username = "testUser";
  const signInSession = "testSession";
  const challengeResponse = "newPassword123!";
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
    options: {
      requiredAttributes: {
        email: "test@example.com",
        phone_number: "+1234567890",
      },
    },
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

  test("should successfully respond to NEW_PASSWORD_REQUIRED challenge with required attributes", async () => {
    const expectedResponse = {
      AuthenticationResult: {
        AccessToken: "testAccessToken",
        IdToken: "testIdToken",
        RefreshToken: "testRefreshToken",
      },
    };

    mockClientSend.mockResolvedValueOnce(expectedResponse);

    const result = await newPasswordRequiredHandler(challengeParams);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });

    const expectedAttributes = {
      "userAttributes.email": "test@example.com",
      "userAttributes.phone_number": "+1234567890",
    };

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(result).toEqual(expectedResponse);
  });

  test("should successfully respond to NEW_PASSWORD_REQUIRED challenge without required attributes", async () => {
    const expectedResponse = {
      AuthenticationResult: {
        AccessToken: "testAccessToken",
        IdToken: "testIdToken",
        RefreshToken: "testRefreshToken",
      },
    };

    mockClientSend.mockResolvedValueOnce(expectedResponse);

    const challengeParamsWithoutAttributes: ChallengeParams = {
      username,
      signInSession,
      challengeResponse,
      cognitoConfig,
      // options is undefined or has no requiredAttributes
    };

    const result = await newPasswordRequiredHandler(challengeParamsWithoutAttributes);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(result).toEqual(expectedResponse);
  });

  test("should handle error when client.send fails", async () => {
    const error = new Error("Respond to auth challenge failed");
    mockClientSend.mockRejectedValueOnce(error);

    await expect(newPasswordRequiredHandler(challengeParams))
      .rejects
      .toThrowError(error);

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);

    const expectedAttributes = {
      "userAttributes.email": "test@example.com",
      "userAttributes.phone_number": "+1234567890",
    };

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });
  });

  test("should exclude attributes with empty or falsy values", async () => {
    const expectedResponse = {
      AuthenticationResult: {
        AccessToken: "testAccessToken",
        IdToken: "testIdToken",
        RefreshToken: "testRefreshToken",
      },
    };

    mockClientSend.mockResolvedValueOnce(expectedResponse);

    const challengeParamsWithEmptyAttributeValues: ChallengeParams = {
      username,
      signInSession,
      challengeResponse,
      cognitoConfig,
      options: {
        requiredAttributes: {
          email: "test@example.com",
          phone_number: "",
          nickname: null,
          address: undefined,
        },
      },
    };

    const result = await newPasswordRequiredHandler(challengeParamsWithEmptyAttributeValues);
    expect(mockGetRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });

    const expectedAttributes = {
      "userAttributes.email": "test@example.com",
      // Attributes with empty or falsy values should not be included
    };

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });

    expect(result).toEqual(expectedResponse);
  });

  test("should handle error when client.send fails due to invalid attributes", async () => {
    const error = new Error("Invalid attributes");
    mockClientSend.mockRejectedValueOnce(error);

    const challengeParamsWithInvalidAttributes: ChallengeParams = {
      username,
      signInSession,
      challengeResponse,
      cognitoConfig,
      options: {
        requiredAttributes: {
          invalid_attribute: "some value",
        },
      },
    };

    await expect(newPasswordRequiredHandler(challengeParamsWithInvalidAttributes)).rejects.toThrowError(error);
    expect(mockClientSend).toHaveBeenCalledTimes(1);

    const expectedAttributes = {
      "userAttributes.invalid_attribute": "some value",
    };

    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        ...expectedAttributes,
        NEW_PASSWORD: challengeResponse,
        USERNAME: username,
      },
      ClientId: cognitoConfig.userPoolClientId,
      Session: signInSession,
    });
  });
});
