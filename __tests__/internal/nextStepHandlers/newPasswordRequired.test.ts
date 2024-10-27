/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-27
 */

import { describe, test, expect } from "vitest";
import newPasswordRequiredHandler from "../../../src/internal/nextStepHandlers/newPasswordRequired";
import type { CognitoResponse } from "../../../src/types/authTypes";

describe("newPasswordRequiredHandler", () => {
  test("should return nextStep with missingAttributes when requiredAttributes are provided", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: JSON.stringify([
        "userAttributes.email",
        "userAttributes.phone_number",
        "custom:custom_attribute",
      ]),
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: ["email", "phone_number", "custom:custom_attribute"],
      },
    });
  });

  test("should return nextStep with empty missingAttributes when requiredAttributes is missing", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {};

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      },
    });
  });

  test("should return nextStep with empty missingAttributes when requiredAttributes is empty string", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: "",
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      },
    });
  });

  test("should return nextStep with empty missingAttributes when requiredAttributes is invalid JSON", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: "invalid_json",
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      },
    });
  });

  test("should handle requiredAttributes without 'userAttributes.' prefix", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: JSON.stringify([
        "email",
        "phone_number",
        "userAttributes.given_name",
      ]),
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: ["email", "phone_number", "given_name"],
      },
    });
  });

  test("should return empty missingAttributes when requiredAttributes is a JSON object", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: JSON.stringify({ key: "value" }),
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      },
    });
  });

  test("should return empty missingAttributes when requiredAttributes is null", () => {
    // @ts-expect-error Missing CHALLENGE_NAME
    const challengeParameters: CognitoResponse = {
      requiredAttributes: null,
    };

    const result = newPasswordRequiredHandler(challengeParameters);

    expect(result).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
        missingAttributes: [],
      },
    });
  });
});
