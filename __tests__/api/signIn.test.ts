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
  type Mock
} from "vitest";
import { signIn } from "../../src/api/signIn";
import { signInWithSRP } from "../../src/api/signInWithSRP";
import { validateUserNotAuthenticated } from "../../src/internal/utils/errorUtils";

vi.mock("../../src/api/signInWithSRP", () => ({
  signInWithSRP: vi.fn(),
}));

vi.mock("../../src/internal/utils/errorUtils", () => ({
  validateUserNotAuthenticated: vi.fn(),
}));

describe("signIn", () => {
  const username = "testUser";
  const password = "testPassword";
  const authFlowType = "SRP_AUTH";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should call validateUserNotAuthenticated before proceeding", async () => {
    await signIn({ username, password, options: { authFlowType } });
    expect(validateUserNotAuthenticated).toHaveBeenCalled();
  });

  test("should call signInWithSRP with required fields by default", async () => {
    const expectedInput = { username, password };
    await signIn({ username, password });
    expect(signInWithSRP).toHaveBeenCalledWith(expectedInput);
  });

  test("should call signInWithSRP with provided authFlowType", async () => {
    const expectedInput = { username, password, options: { authFlowType } };
    await signIn({ username, password, options: { authFlowType } });
    expect(signInWithSRP).toHaveBeenCalledWith(expectedInput);
  });

  test("should throw an error if validateUserNotAuthenticated fails", async () => {
    const error = new Error("User already authenticated");
    (validateUserNotAuthenticated as Mock).mockRejectedValueOnce(error);

    await expect(signIn({ username, password })).rejects.toThrow(error);
    expect(signInWithSRP).not.toHaveBeenCalled();
  });
});
