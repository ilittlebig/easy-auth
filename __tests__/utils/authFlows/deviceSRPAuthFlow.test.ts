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
  type Mock,
} from "vitest";
import { RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../../../src/internal/classes";
import { handleDeviceSRPAuthFlow } from "../../../src/internal/utils/authFlows/deviceSRPAuthFlow";
import { getDeviceMetadata } from "../../../src/internal/utils/deviceMetadataUtils";
import { validateDeviceMetadata } from "../../../src/internal/utils/errorUtils";
import { SRPClient } from "../../../src/internal/utils/srp/srpClient";
import { getRegion } from "../../../src/internal/utils/regionUtils";
import { AuthError } from "../../../src/internal/classes";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import { authTestParams } from "../../testUtils/authTestParams";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", async () => {
  const originalModule = await import(
    "@aws-sdk/client-cognito-identity-provider"
  );
  return {
    ...originalModule,
    CognitoIdentityProviderClient: vi.fn().mockReturnValue({
      send: mocks.send,
    }),
  };
});

vi.mock("../../../src/internal/utils/deviceMetadataUtils", () => ({
  getDeviceMetadata: vi.fn(),
}));

vi.mock("../../../src/internal/utils/errorUtils", async () => {
  const originalModule = await import("../../../src/internal/utils/errorUtils");
  return {
    ...originalModule,
    validateDeviceMetadata: vi.fn(),
  };
});

vi.mock("../../../src/internal/utils/srp/srpClient", () => ({
  SRPClient: vi.fn(),
}));

vi.mock("../../../src/internal/utils/regionUtils", () => ({
  getRegion: vi.fn(),
}));

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("deviceSRPAuthFlow", () => {
  const username = authTestParams.user1.username;
  const cognitoConfig = authTestParams.cognitoConfig;

  const deviceMetadata = {
    deviceKey: "validDeviceKey",
    deviceGroupKey: "validDeviceGroupKey",
    randomPassword: "validRandomPassword",
  };

  const challengeParameters = {
    SRP_B: "mockSRP_B",
    SALT: "mockSALT",
    SECRET_BLOCK: "mockSecretBlock",
  };

  const mockSRPClientInstance = {
    calculateA: vi.fn().mockReturnValue("mockSrpA"),
    getPasswordAuthenticationKey: vi.fn().mockReturnValue("mockPassAuthKey")
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should successfully complete device SRP authentication with valid challenge parameters", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const authResponse = {
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);

    const handleDevicePasswordVerifierResponse = {
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    };

    mocks.send.mockResolvedValueOnce(handleDevicePasswordVerifierResponse);

    const result = await handleDeviceSRPAuthFlow(username, cognitoConfig);

    expect(getDeviceMetadata).toHaveBeenCalledWith(username);
    expect(validateDeviceMetadata).toHaveBeenCalledWith(deviceMetadata);
    expect(getRegion).toHaveBeenCalledWith(cognitoConfig.userPoolId);
    expect(SRPClient).toHaveBeenCalledWith(deviceMetadata.deviceGroupKey);
    expect(mockSRPClientInstance.calculateA).toHaveBeenCalled();

    expect(mocks.send).toHaveBeenCalledWith(
      expect.any(RespondToAuthChallengeCommand)
    );

    expect(result).toEqual(handleDevicePasswordVerifierResponse);
  });

  test("should throw MissingChallengeParametersException if challengeParameters are missing", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const authResponse = {
      ChallengeParameters: undefined,
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);

    await expect(
      handleDeviceSRPAuthFlow(username, cognitoConfig)
    ).rejects.toThrowError(
      new AuthError({
        name: "MissingChallengeParametersException",
        message: authErrorStrings.MissingChallengeParametersException,
      })
    );
  });

  test("should handle errors thrown by client.send", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const error = new Error("Network Error");
    mocks.send.mockRejectedValueOnce(error);

    await expect(
      handleDeviceSRPAuthFlow(username, cognitoConfig)
    ).rejects.toThrowError(error);
  });

  test("should handle errors thrown by handleDevicePasswordVerifier", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const authResponse = {
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    const error = new Error("Device Password Verifier Error");
    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockRejectedValueOnce(error);

    await expect(
      handleDeviceSRPAuthFlow(username, cognitoConfig)
    ).rejects.toThrowError(error);
  });

  test("should throw error if device metadata is invalid", async () => {
    const deviceMetadata = null;

    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {
      throw new AuthError({
        name: "InvalidDeviceMetadataException",
        message: authErrorStrings.InvalidDeviceMetadataException,
      });
    });

    await expect(
      handleDeviceSRPAuthFlow(username, cognitoConfig)
    ).rejects.toThrowError(
      new AuthError({
        name: "InvalidDeviceMetadataException",
        message: authErrorStrings.InvalidDeviceMetadataException,
      })
    );
  });

  test("should construct RespondToAuthChallengeCommand with correct parameters", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const authResponse = {
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    });

    await handleDeviceSRPAuthFlow(username, cognitoConfig);

    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          ChallengeName: "DEVICE_SRP_AUTH",
          ChallengeResponses: {
            USERNAME: username,
            SRP_A: "mockSrpA",
            DEVICE_KEY: deviceMetadata.deviceKey,
          },
          ClientId: cognitoConfig.userPoolClientId,
        },
      })
    );
  });

  test("should calculate SRP A value", async () => {
    (getDeviceMetadata as Mock).mockReturnValue(deviceMetadata);
    (validateDeviceMetadata as Mock).mockImplementation(() => {});
    (getRegion as Mock).mockReturnValue("mockRegion");
    (SRPClient as Mock).mockReturnValue(mockSRPClientInstance);

    const authResponse = {
      ChallengeParameters: challengeParameters,
      Session: "mockSession",
    };

    mocks.send.mockResolvedValueOnce(authResponse);
    mocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: "mockAccessToken",
      },
    });

    await handleDeviceSRPAuthFlow(username, cognitoConfig);
    expect(mockSRPClientInstance.calculateA).toHaveBeenCalled();
  });
});
