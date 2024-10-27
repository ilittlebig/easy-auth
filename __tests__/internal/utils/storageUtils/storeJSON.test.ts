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
import { storeJSON } from "../../../../src/internal/utils/storageUtils";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe("storeJSON", () => {
  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });

    mockLocalStorage.clear();
  });

  test("should store a JSON object as a string in storage", () => {
    const data = { name: "John", age: 30 };
    storeJSON("testKey", data);
    expect(mockLocalStorage.getItem("testKey")).toBe(JSON.stringify(data));
  });

  test("should store an array as a JSON string in storage", () => {
    const data = ["apple", "banana", "cherry"];
    storeJSON("testKey", data);
    expect(mockLocalStorage.getItem("testKey")).toBe(JSON.stringify(data));
  });

  test("should not store if the item is null or undefined", () => {
    storeJSON("testKey", null);
    expect(mockLocalStorage.getItem("testKey")).toBeNull();

    storeJSON("testKey", undefined);
    expect(mockLocalStorage.getItem("testKey")).toBeNull();
  });

  test("should handle nested objects and arrays correctly", () => {
    const data = { name: "Alice", preferences: { likes: ["pizza", "sushi"], dislikes: ["broccoli"] } };
    storeJSON("testKey", data);
    expect(mockLocalStorage.getItem("testKey")).toBe(JSON.stringify(data));
  });
});
