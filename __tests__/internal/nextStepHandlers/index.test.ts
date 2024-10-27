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
import { getNextStepFromChallenge } from "../../../src/internal/nextStepHandlers";
import { AuthError } from "../../../src/internal/classes";
import newPasswordRequired from "../../../src/internal/nextStepHandlers/newPasswordRequired";
import mfaSetup from "../../../src/internal/nextStepHandlers/mfaSetup";
import softwareTokenMfa from "../../../src/internal/nextStepHandlers/softwareTokenMfa";
import type { CognitoResponse } from "../../../src/types/authTypes";

vi.mock("../../../src/internal/nextStepHandlers/newPasswordRequired", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/nextStepHandlers/mfaSetup", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/nextStepHandlers/softwareTokenMfa", () => ({
  default: vi.fn(),
}));

vi.mock("../../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

describe("getNextStepFromChallenge", () => {
  const mockNewPasswordRequired = newPasswordRequired as Mock;
  const mockMfaSetup = mfaSetup as Mock;
  const mockSoftwareTokenMfa = softwareTokenMfa as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should call newPasswordRequired handler when challengeName is 'NEW_PASSWORD_REQUIRED'", () => {
    const challengeName = "NEW_PASSWORD_REQUIRED";
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    const expectedResult = { isSignedIn: false, nextStep: { signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED" } };
    mockNewPasswordRequired.mockReturnValue(expectedResult);

    const result = getNextStepFromChallenge(challengeName, params);

    expect(mockNewPasswordRequired).toHaveBeenCalledWith(params);
    expect(result).toEqual(expectedResult);
  });

  test("should call mfaSetup handler when challengeName is 'MFA_SETUP'", () => {
    const challengeName = "MFA_SETUP";
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    const expectedResult = { isSignedIn: false, nextStep: { signInStep: "MFA_SETUP_REQUIRED" } };
    mockMfaSetup.mockReturnValue(expectedResult);

    const result = getNextStepFromChallenge(challengeName, params);
    expect(mockMfaSetup).toHaveBeenCalledWith(params);
    expect(result).toEqual(expectedResult);
  });

  test("should call softwareTokenMfa handler when challengeName is 'SOFTWARE_TOKEN_MFA'", () => {
    const challengeName = "SOFTWARE_TOKEN_MFA";
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    const expectedResult = { isSignedIn: false, nextStep: { signInStep: "SOFTWARE_TOKEN_MFA_REQUIRED" } };
    mockSoftwareTokenMfa.mockReturnValue(expectedResult);

    const result = getNextStepFromChallenge(challengeName, params);
    expect(mockSoftwareTokenMfa).toHaveBeenCalledWith(params);
    expect(result).toEqual(expectedResult);
  });

  test("should throw AuthError when challengeName is not handled", () => {
    const challengeName = "UNKNOWN_CHALLENGE";
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    expect(() => getNextStepFromChallenge(challengeName, params)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "ChallengeNotHandledException",
      message: `No next step for challenge: ${challengeName}`,
    });
  });

  test("should throw AuthError when challengeName is undefined", () => {
    const challengeName = undefined as unknown as string;
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    expect(() => getNextStepFromChallenge(challengeName, params)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "ChallengeNotHandledException",
      message: `No next step for challenge: ${challengeName}`,
    });
  });

  test("should throw AuthError when challengeName is null", () => {
    const challengeName = null as unknown as string;
    // @ts-expect-error Missing CHALLENGE_NAME
    const params: CognitoResponse = { some: "params" };

    expect(() => getNextStepFromChallenge(challengeName, params)).toThrowError(AuthError);
    expect(AuthError).toHaveBeenCalledWith({
      name: "ChallengeNotHandledException",
      message: `No next step for challenge: ${challengeName}`,
    });
  });
});
