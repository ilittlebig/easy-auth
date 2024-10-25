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
} from "vitest";
import { getKeyValueStorage } from "../../../src/internal/utils/storageUtils";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe("isLocalStorageAvailable", () => {
  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });
    mockLocalStorage.clear();
  });

  test("should return true if localStorage is available", () => {
    expect(getKeyValueStorage().getItem).toBeDefined();
    expect(localStorage.setItem).toBeDefined();
  });

  test("should return false and use inMemoryStorage if localStorage is unavailable", () => {
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: () => {
          new Error("localStorage is unavailable");
        },
        setItem: () => {
          throw new Error("localStorage is unavailable");
        },
        removeItem: () => {
          throw new Error("localStorage is unavailable");
        },
      },
      configurable: true,
    });

    const storage = getKeyValueStorage();
    expect(storage.getItem).toBeDefined();
    expect(storage.setItem).toBeDefined();
  });

  test("should handle errors in localStorage gracefully", () => {
    vi.spyOn(global.localStorage, "setItem").mockImplementation(() => {
      throw new Error("localStorage is disabled");
    });
    vi.spyOn(global.localStorage, "removeItem").mockImplementation(() => {
      throw new Error("localStorage is disabled");
    });

    const storage = getKeyValueStorage();

    expect(storage.getItem("testKey")).toBeNull();
    storage.setItem("testKey", "testValue");
    expect(storage.getItem("testKey")).toBe("testValue");

    vi.restoreAllMocks();
  });
});
