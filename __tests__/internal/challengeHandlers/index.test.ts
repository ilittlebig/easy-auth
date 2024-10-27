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
import { handleChallenge } from "../../../src/internal/challengeHandlers";
import { AuthError } from "../../../src/internal/classes";
import newPasswordRequiredHandler from "../../../src/internal/challengeHandlers/newPasswordRequired";
import mfaSetupHandler from "../../../src/internal/challengeHandlers/mfaSetup";
import softwareTokenMfaHandler from "../../../src/internal/challengeHandlers/softwareTokenMfa";
import type { ChallengeInput } from "../../../src/types/authTypes";

vi.mock("../../../src/internal/challengeHandlers/newPasswordRequired", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/challengeHandlers/mfaSetup", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/challengeHandlers/softwareTokenMfa", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

describe("handleChallenge", () => {
  const mockNewPasswordRequiredHandler = newPasswordRequiredHandler as Mock;
  const mockMfaSetupHandler = mfaSetupHandler as Mock;
  const mockSoftwareTokenMfaHandler = softwareTokenMfaHandler as Mock;

  const username = "testUser";
  const signInSession = "testSession";
  const challengeResponse = "challengeResponse";
  const cognitoConfig = {
    userPoolId: "us-east-1_testPoolId",
    userPoolClientId: "testClientId",
  };
  const options = { someOption: "someValue" };

  const commonChallengeInput: Omit<ChallengeInput, "challengeName"> = {
    username,
    signInSession,
    challengeResponse,
    cognitoConfig,
    options,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should call newPasswordRequired handler when challengeName is 'NEW_PASSWORD_REQUIRED'", async () => {
    const challengeName = "NEW_PASSWORD_REQUIRED";
    const expectedResult = { success: true };

    mockNewPasswordRequiredHandler.mockResolvedValueOnce(expectedResult);

    const result = await handleChallenge({
      challengeName,
      ...commonChallengeInput,
    });

    expect(mockNewPasswordRequiredHandler).toHaveBeenCalledWith({
      ...commonChallengeInput,
    });
    expect(result).toEqual(expectedResult);
  });

  test("should call mfaSetup handler when challengeName is 'MFA_SETUP'", async () => {
    const challengeName = "MFA_SETUP";
    const expectedResult = { success: true };

    mockMfaSetupHandler.mockResolvedValueOnce(expectedResult);

    const result = await handleChallenge({
      challengeName,
      ...commonChallengeInput,
    });

    expect(mockMfaSetupHandler).toHaveBeenCalledWith({
      ...commonChallengeInput,
    });
    expect(result).toEqual(expectedResult);
  });

  test("should call softwareTokenMfa handler when challengeName is 'SOFTWARE_TOKEN_MFA'", async () => {
    const challengeName = "SOFTWARE_TOKEN_MFA";
    const expectedResult = { success: true };

    mockSoftwareTokenMfaHandler.mockResolvedValueOnce(expectedResult);

    const result = await handleChallenge({
      challengeName,
      ...commonChallengeInput,
    });

    expect(mockSoftwareTokenMfaHandler).toHaveBeenCalledWith({
      ...commonChallengeInput,
    });
    expect(result).toEqual(expectedResult);
  });

  test("should throw AuthError when challengeName is unknown", async () => {
    const challengeName = "UNKNOWN_CHALLENGE";
    const errorMessage = `Unknown challenge: ${challengeName}`;

    await expect(
      handleChallenge({
        // @ts-expect-error CHALLENGE_NAME is "UNKNOWN_CHALLENGE"
        challengeName,
        ...commonChallengeInput,
      })
    ).rejects.toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "UnknownChallengeException",
      message: errorMessage,
    });
  });

  test("should throw AuthError when challengeName is undefined", async () => {
    const challengeName = undefined as unknown as string;
    const errorMessage = `Unknown challenge: ${challengeName}`;

    await expect(
      handleChallenge({
        // @ts-expect-error CHALLENGE_NAME is undefined
        challengeName,
        ...commonChallengeInput,
      })
    ).rejects.toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "UnknownChallengeException",
      message: errorMessage,
    });
  });

  test("should throw AuthError when challengeName is null", async () => {
    const challengeName = null as unknown as string;
    const errorMessage = `Unknown challenge: ${challengeName}`;

    await expect(
      handleChallenge({
        // @ts-expect-error CHALLENGE_NAME is null
        challengeName,
        ...commonChallengeInput,
      })
    ).rejects.toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "UnknownChallengeException",
      message: errorMessage,
    });
  });
});
