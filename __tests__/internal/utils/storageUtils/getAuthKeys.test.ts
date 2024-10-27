/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  type Mock,
} from "vitest";
import { EasyAuth } from "../../../../src/internal/classes";
import { getAuthKeys, getKeyValueStorage } from "../../../../src/internal/utils/storageUtils";

vi.mock("../../../../src/internal/classes", () => ({
  EasyAuth: {
    getConfig: vi.fn(),
  },
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe("getAuthKeys", () => {
  beforeEach(() => {
    (EasyAuth.getConfig as Mock).mockReturnValue({
      Auth: {
        Cognito: {
          userPoolClientId: "mockedClientId",
        },
      },
    });

    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });
    mockLocalStorage.clear();
  });

  test("should return auth keys with specified username", () => {
    const username = "testUser";
    const authKeys = getAuthKeys(username);

    expect(authKeys.accessToken).toBe("CognitoIdentityServiceProvider.mockedClientId.testUser.accessToken");
    expect(authKeys.idToken).toBe("CognitoIdentityServiceProvider.mockedClientId.testUser.idToken");
    expect(authKeys.deviceKey).toBe("CognitoIdentityServiceProvider.mockedClientId.testUser.deviceKey");
  });

  test("should return auth keys with last authenticated user if username is not provided", () => {
    const storage = getKeyValueStorage();
    storage.setItem("CognitoIdentityServiceProvider.mockedClientId.LastAuthUser", "lastUser");

    const authKeys = getAuthKeys();

    expect(authKeys.accessToken).toBe("CognitoIdentityServiceProvider.mockedClientId.lastUser.accessToken");
    expect(authKeys.idToken).toBe("CognitoIdentityServiceProvider.mockedClientId.lastUser.idToken");
    expect(authKeys.deviceKey).toBe("CognitoIdentityServiceProvider.mockedClientId.lastUser.deviceKey");
  });

  test("should return auth keys with default 'username' if last authenticated user is not found", () => {
    const authKeys = getAuthKeys();
    expect(authKeys.accessToken).toBe("CognitoIdentityServiceProvider.mockedClientId.username.accessToken");
    expect(authKeys.idToken).toBe("CognitoIdentityServiceProvider.mockedClientId.username.idToken");
    expect(authKeys.deviceKey).toBe("CognitoIdentityServiceProvider.mockedClientId.username.deviceKey");
  });
});
