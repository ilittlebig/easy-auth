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

describe("getKeyValueStorage", () => {
  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should use localStorage if it is available", () => {
    const storage = getKeyValueStorage();

    storage.setItem("testKey", "testValue");
    expect(storage.getItem("testKey")).toBe("testValue");
    storage.removeItem("testKey");
    expect(storage.getItem("testKey")).toBeNull();
  });

  test("should use inMemoryStorage if localStorage is unavailable", () => {
    Object.defineProperty(global, "localStorage", {
      value: undefined,
      configurable: true,
    });

    const storage = getKeyValueStorage();

    storage.setItem("testKey", "testValue");
    expect(storage.getItem("testKey")).toBe("testValue");
    storage.removeItem("testKey");
    expect(storage.getItem("testKey")).toBeNull();
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
  });
});
