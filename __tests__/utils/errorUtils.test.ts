/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

import {
  vi,
  describe,
  test,
  expect,
  type Mock,
} from "vitest";
import { AuthError } from "../../src/internal/classes";
import { authErrorStrings } from "../../src/internal/utils/errorUtils";
import { assert, validateUserNotAuthenticated } from "../../src/internal/utils/errorUtils";
import { getCurrentUser } from "../../src/api";
import type { AuthUser } from "../../src/types/authTypes";

vi.mock("../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

vi.mock("../../src/api", () => ({
  getCurrentUser: vi.fn(),
}));

describe("assert", () => {
  test("does not throw an error if assertion is true", () => {
    expect(() => assert(true, "AnyException", "Should not throw"))
      .not
      .toThrow();
  });

  test("throws an error if assertion is false", () => {
    expect(() => assert(false, "TestException", "Test failed"))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "TestException",
      message: "Test failed",
    });
  });
});

describe("validateUserNotAuthenticated", () => {
  test("does not throw error if user is not authenticated", async () => {
    (getCurrentUser as Mock).mockRejectedValue(new Error(""));

    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });

  test("throws error if user is authenticated", async () => {
    const mockAuthUser: AuthUser = { userId: "123", username: "testUser" };
    (getCurrentUser as Mock).mockResolvedValue(mockAuthUser);

    await expect(validateUserNotAuthenticated())
      .rejects
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "UserAlreadyAuthenticatedException",
      message: authErrorStrings.UserAlreadyAuthenticatedException,
    });
  });

  test("does not throw error if getCurrentUser fails", async () => {
    (getCurrentUser as Mock).mockRejectedValue(new Error("User not found"));
    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });

  test("does not throw error if user has incomplete information", async () => {
    const incompleteAuthUser: Partial<AuthUser> = { userId: undefined, username: undefined };
    (getCurrentUser as Mock).mockResolvedValue(incompleteAuthUser);
    await expect(validateUserNotAuthenticated())
      .resolves
      .not
      .toThrow();
  });
});
