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
  type Mock
} from "vitest";
import {
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import mfaSetupHandler from "../../../src/internal/nextStepHandlers/mfaSetup";
import { EasyAuth, AuthError } from "../../../src/internal/classes";
import { signInStore } from "../../../src/internal/stores/signInStore";
import { getRegion } from "../../../src/internal/utils/regionUtils";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import type { CognitoResponse } from "../../../src/types/authTypes";

vi.mock("@aws-sdk/client-cognito-identity-provider", () => {
  return {
    CognitoIdentityProviderClient: vi.fn(),
    AssociateSoftwareTokenCommand: vi.fn(),
  };
});

vi.mock("../../../src/internal/stores/signInStore", () => {
  return {
    signInStore: {
      getState: vi.fn(),
      dispatch: vi.fn(),
    },
  };
});

vi.mock("../../../src/internal/classes", () => {
  return {
    EasyAuth: {
      getConfig: vi.fn(),
    },
    AuthError: vi.fn(),
  };
});

vi.mock("../../../src/internal/utils/regionUtils", () => {
  return {
    getRegion: vi.fn(),
  };
});

describe("mfaSetupHandler", () => {
  const signInSession = "testSession";
  const username = "testUser";
  const userPoolId = "us-east-1_testPoolId";
  const region = "us-east-1";

  const cognitoConfig = {
    userPoolId,
  };

  // @ts-expect-error Missing CHALLENGE_NAME
  const challengeParameters: CognitoResponse = {
    MFAS_CAN_SETUP: JSON.stringify(["SOFTWARE_TOKEN_MFA"]),
  };

  const mockClientSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (signInStore.getState as Mock).mockReturnValue({
      signInSession,
      username,
    });

    (EasyAuth.getConfig as Mock).mockReturnValue({
      Auth: {
        Cognito: cognitoConfig,
      },
    });

    (getRegion as Mock).mockReturnValue(region);

    (CognitoIdentityProviderClient as Mock).mockImplementation(() => {
      return {
        send: mockClientSend,
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should successfully set up TOTP MFA when TOTP is enabled", async () => {
    const secretCode = "testSecretCode";
    const newSession = "newTestSession";

    mockClientSend.mockResolvedValue({
      SecretCode: secretCode,
      Session: newSession,
    });

    const result = await mfaSetupHandler(challengeParameters);

    expect(signInStore.getState).toHaveBeenCalled();
    expect(EasyAuth.getConfig).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalledWith(userPoolId);

    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });
    expect(AssociateSoftwareTokenCommand).toHaveBeenCalledWith({
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(signInStore.dispatch).toHaveBeenCalledWith({
      type: "SET_SIGN_IN_SESSION",
      value: newSession,
    });

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONTINUE_SIGN_IN_WITH_TOTP_SETUP",
        totpSetupDetails: {
          sharedSecret: secretCode,
          getSetupUri: expect.any(Function),
        },
      },
    });

    const { getSetupUri } = result.nextStep.totpSetupDetails;
    const appName = "TestApp";
    const accountName = "testAccount";
    const setupUri = getSetupUri(appName, accountName);

    expect(setupUri).toBe(
      `otpauth://totp/${appName}:${accountName}?secret=${secretCode}&issuer=${appName}`
    );
  });

  test("should throw SignInException when TOTP is not enabled", async () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const invalidChallengeParameters: CognitoResponse = {
      MFAS_CAN_SETUP: JSON.stringify(["SMS_MFA"]),
    };

    await expect(() => mfaSetupHandler(invalidChallengeParameters))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "SignInException",
      message: authErrorStrings.InvalidMFASetupTypeException + ": TOTP",
    });

    expect(signInStore.getState).toHaveBeenCalled();
    expect(EasyAuth.getConfig).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalledWith(userPoolId);
    expect(CognitoIdentityProviderClient).not.toHaveBeenCalled();
    expect(mockClientSend).not.toHaveBeenCalled();
    expect(signInStore.dispatch).not.toHaveBeenCalled();
  });

  test("should throw MissingSecretCodeException when secretCode is missing", async () => {
    const newSession = "newTestSession";

    mockClientSend.mockResolvedValue({
      Session: newSession,
    });

    await expect(() => mfaSetupHandler(challengeParameters))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "MissingSecretCodeException",
      message: authErrorStrings.MissingSecretCodeException,
    });

    expect(signInStore.getState).toHaveBeenCalled();
    expect(EasyAuth.getConfig).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalledWith(userPoolId);

    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });
    expect(AssociateSoftwareTokenCommand).toHaveBeenCalledWith({
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(signInStore.dispatch).not.toHaveBeenCalled();
  });

  test("should handle errors thrown by client.send", async () => {
    const error = new Error("Network error");
    mockClientSend.mockRejectedValue(error);

    await expect(mfaSetupHandler(challengeParameters)).rejects.toThrowError(error);

    expect(signInStore.getState).toHaveBeenCalled();
    expect(EasyAuth.getConfig).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalledWith(userPoolId);

    expect(CognitoIdentityProviderClient).toHaveBeenCalledWith({ region });
    expect(AssociateSoftwareTokenCommand).toHaveBeenCalledWith({
      Session: signInSession,
    });

    expect(mockClientSend).toHaveBeenCalledTimes(1);
    expect(signInStore.dispatch).not.toHaveBeenCalled();
  });

  test("should parse MFAS_CAN_SETUP correctly", async () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParametersWithMultipleMFAs: CognitoResponse = {
      MFAS_CAN_SETUP: JSON.stringify(["SMS_MFA", "SOFTWARE_TOKEN_MFA"]),
    };

    const secretCode = "testSecretCode";
    const newSession = "newTestSession";

    mockClientSend.mockResolvedValue({
      SecretCode: secretCode,
      Session: newSession,
    });

    const result = await mfaSetupHandler(challengeParametersWithMultipleMFAs);

    expect(result).toBeDefined();
    expect(result.nextStep).toBeDefined();
    expect(result.nextStep.totpSetupDetails.sharedSecret).toBe(secretCode);
  });

  test("should handle empty MFAS_CAN_SETUP", async () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParametersWithEmptyMFAs: CognitoResponse = {
      MFAS_CAN_SETUP: JSON.stringify([]),
    };

    await expect(() => mfaSetupHandler(challengeParametersWithEmptyMFAs))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "SignInException",
      message: authErrorStrings.InvalidMFASetupTypeException + ": TOTP",
    });

    expect(CognitoIdentityProviderClient).not.toHaveBeenCalled();
    expect(mockClientSend).not.toHaveBeenCalled();
  });

  test("should handle missing MFAS_CAN_SETUP", async () => {
    // @ts-expect-error Missing MFAS_CAN_SETUP and CHALLENGE_NAME
    const challengeParametersWithoutMFAs: CognitoResponse = {};

    await expect(mfaSetupHandler(challengeParametersWithoutMFAs))
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "SignInException",
      message: authErrorStrings.InvalidMFASetupTypeException + ": TOTP",
    });

    expect(CognitoIdentityProviderClient).not.toHaveBeenCalled();
    expect(mockClientSend).not.toHaveBeenCalled();
  });

  test("should use username when accountName is undefined in getSetupUri", async () => {
    const secretCode = "testSecretCode";
    const newSession = "newTestSession";

    mockClientSend.mockResolvedValue({
      SecretCode: secretCode,
      Session: newSession,
    });

    const result = await mfaSetupHandler(challengeParameters);

    const { getSetupUri } = result.nextStep.totpSetupDetails;
    const appName = "TestApp";

    // @ts-expect-error Missing username argument
    const setupUri = getSetupUri(appName);
    expect(setupUri).toBe(
      `otpauth://totp/${appName}:${username}?secret=${secretCode}&issuer=${appName}`
    );
  });
});
