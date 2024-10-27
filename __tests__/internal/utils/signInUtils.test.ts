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
  afterEach,
  type Mock
} from "vitest";
import {
  setActiveSignInUsername,
  getActiveSignInState,
  getSignInResultFromError,
} from "../../../src/internal/utils/signInUtils";
import { signInStore } from "../../../src/internal/stores/signInStore";

vi.mock("../../../src/internal/stores/signInStore", () => ({
  signInStore: {
    dispatch: vi.fn(),
    getState: vi.fn(),
  },
}));

describe("signInUtils", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("setActiveSignInUsername", () => {
    test("should dispatch SET_USERNAME action with the provided username", () => {
      const mockDispatch = signInStore.dispatch as Mock;
      const username = "testUser";

      setActiveSignInUsername(username);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SET_USERNAME",
        value: username,
      });
    });
  });

  describe("getActiveSignInState", () => {
    test("should return the username from state if it exists", () => {
      const mockGetState = signInStore.getState as Mock;
      const stateUsername = "stateUser";
      const fallbackUsername = "fallbackUser";

      mockGetState.mockReturnValue({
        username: stateUsername,
      });

      const result = getActiveSignInState(fallbackUsername);

      expect(mockGetState).toHaveBeenCalled();
      expect(result).toBe(stateUsername);
    });

    test("should return the provided username if state username is undefined", () => {
      const mockGetState = signInStore.getState as Mock;
      const fallbackUsername = "fallbackUser";

      mockGetState.mockReturnValue({
        username: undefined,
      });

      const result = getActiveSignInState(fallbackUsername);

      expect(mockGetState).toHaveBeenCalled();
      expect(result).toBe(fallbackUsername);
    });
  });

  describe("getSignInResultFromError", () => {
    test("should return RESET_PASSWORD nextStep when errorName is PasswordResetRequiredException", () => {
      const errorName = "PasswordResetRequiredException";

      const expectedResult = {
        isSignedIn: false,
        nextStep: { signInStep: "RESET_PASSWORD" },
      };

      const result = getSignInResultFromError(errorName);

      expect(result).toEqual(expectedResult);
    });

    test("should return undefined for unhandled error names", () => {
      const errorName = "SomeOtherException";

      const result = getSignInResultFromError(errorName);

      expect(result).toBeUndefined();
    });
  });
});
