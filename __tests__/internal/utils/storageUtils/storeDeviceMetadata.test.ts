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
import { storeDeviceMetadata } from "../../../../src/internal/utils/storageUtils";
import type { NewDeviceMetadataOutput } from "../../../../src/types/deviceMetadataTypes";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe("storeDeviceMetadata", () => {
  const authKeys = {
    deviceKey: "authDeviceKey",
    deviceGroupKey: "authDeviceGroupKey",
    randomPassword: "authRandomPassword",
  };

  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      configurable: true,
    });
    mockLocalStorage.clear();
  });

  test("should store each device metadata property in storage", () => {
    const mockFunction = vi.fn();

    const deviceMetadata: NewDeviceMetadataOutput = {
      deviceKey: "mocked-device-key",
      deviceGroupKey: "mocked-device-group-key",
      randomPassword: "mocked-random-password",
    };

    storeDeviceMetadata(authKeys, deviceMetadata, mockFunction);

    expect(mockFunction).toHaveBeenCalledWith("authDeviceKey", "mocked-device-key");
    expect(mockFunction).toHaveBeenCalledWith("authDeviceGroupKey", "mocked-device-group-key");
    expect(mockFunction).toHaveBeenCalledWith("authRandomPassword", "mocked-random-password");
  });

  test("should not store anything if deviceMetadata is undefined", () => {
    const mockFunction = vi.fn();
    storeDeviceMetadata(authKeys, undefined, mockFunction);
    expect(mockFunction).not.toHaveBeenCalled();
  });

  test("should handle missing metadata properties gracefully", () => {
    const partialMetadata = { deviceKey: "partial-device-key" };
    storeDeviceMetadata(authKeys, partialMetadata as NewDeviceMetadataOutput);

    expect(mockLocalStorage.getItem("authDeviceKey")).toBe("partial-device-key");
    expect(mockLocalStorage.getItem("authDeviceGroupKey")).toBeNull();
    expect(mockLocalStorage.getItem("authRandomPassword")).toBeNull();
  });
});
