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
  beforeEach,
} from "vitest";
import { storeItem } from "../../../src/internal/utils/storageUtils";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe("storeItem", () => {
  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });

    mockLocalStorage.clear();
  });

  test("should store a value as a string in storage", () => {
    storeItem("testKey", 12345);
    expect(mockLocalStorage.getItem("testKey")).toBe("12345");
  });

  test("should store string values in storage", () => {
    storeItem("testKey", "testValue");
    expect(mockLocalStorage.getItem("testKey")).toBe("testValue");
  });

  test("should not store if the value is null or undefined", () => {
    storeItem("testKey", null);
    expect(mockLocalStorage.getItem("testKey")).toBeNull();

    storeItem("testKey", undefined);
    expect(mockLocalStorage.getItem("testKey")).toBeNull();
  });

  test("should convert non-string values to strings before storing", () => {
    const objectValue = { foo: "bar" };
    storeItem("testKey", objectValue);
    expect(mockLocalStorage.getItem("testKey")).toBe("[object Object]");
  });
});
