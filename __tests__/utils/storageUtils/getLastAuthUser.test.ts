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
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { EasyAuth } from "../../../src/internal/classes";
import { getLastAuthUser, getKeyValueStorage } from "../../../src/internal/utils/storageUtils";

vi.mock("../../../src/internal/classes", () => ({
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

describe("getKeyValueStorage", () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return the last authenticated user if it exists in storage", () => {
    const storage = getKeyValueStorage();
    storage.setItem("CognitoIdentityServiceProvider.mockedClientId.LastAuthUser", "lastUser");
    const result = getLastAuthUser();
    expect(result).toBe("lastUser");
  });

  test("should return 'username' if last authenticated user is not found in storage", () => {
    const result = getLastAuthUser();
    expect(result).toBe("username");
  });
});
