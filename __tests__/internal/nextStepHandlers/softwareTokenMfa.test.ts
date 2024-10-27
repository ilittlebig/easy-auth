/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-27
 */

import { describe, test, expect } from "vitest";
import softwareTokenMfaHandler from "../../../src/internal/nextStepHandlers/softwareTokenMfa";

describe("softwareTokenMfaHandler", () => {
  test("should return the correct nextStep 'CONFIRM_SIGN_IN_WITH_TOTP_CODE'", () => {
    const nextStep = softwareTokenMfaHandler();
    expect(nextStep).toEqual({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE",
      },
    });
  });
});
