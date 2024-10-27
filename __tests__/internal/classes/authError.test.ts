/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-26
 */

import { describe, test, expect } from "vitest";
import { AuthError } from "../../../src/internal/classes/authError";

describe("AuthError Class", () => {
  test("should create an AuthError instance with correct message and name", () => {
    const errorMessage = "Test error message";
    const errorName = "TestErrorName";

    const authError = new AuthError({ message: errorMessage, name: errorName });

    expect(authError).toBeInstanceOf(Error);
    expect(authError).toBeInstanceOf(AuthError);
    expect(authError.message).toBe(errorMessage);
    expect(authError.name).toBe(errorName);
  });

  test("should have correct prototype chain", () => {
    const authError = new AuthError({ message: "Prototype chain test", name: "PrototypeError" });

    expect(Object.getPrototypeOf(authError)).toBe(AuthError.prototype);
    expect(Object.getPrototypeOf(AuthError.prototype)).toBe(Error.prototype);
  });

  test("should handle missing message and name gracefully", () => {
    const authError = new AuthError({ message: "", name: "" });

    expect(authError.message).toBe("");
    expect(authError.name).toBe("");
  });
});
