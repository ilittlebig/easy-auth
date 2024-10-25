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
  type Mock,
} from "vitest";
import { getDeviceMetadata } from "../../../src/internal/utils/deviceMetadataUtils";
import { getKeyValueStorage } from "../../../src/internal/utils/storageUtils";

vi.mock("../../../src/internal/utils/storageUtils", () => ({
  getKeyValueStorage: vi.fn().mockReturnValue({
    getItem: vi.fn((key) => {
      const storage = {
        "mocked-deviceKey": "deviceKey",
        "mocked-deviceGroupKey": "deviceGroupKey",
        "mocked-randomPassword": "randomPassword",
      };
      return storage[key];
    }),
  }),
  getAuthKeys: vi.fn().mockReturnValue({
    deviceKey: "mocked-deviceKey",
    deviceGroupKey: "mocked-deviceGroupKey",
    randomPassword: "mocked-randomPassword",
  }),
}));

describe("getDeviceMetadata", () => {
  test("should return device metadata if randomPassword exists", () => {
    const result = getDeviceMetadata("mocked-username");
    expect(result).toEqual({
      deviceKey: "deviceKey",
      deviceGroupKey: "deviceGroupKey",
      randomPassword: "randomPassword",
    });
  });

  test("should return null if randomPassword does not exist", () => {
    (vi.mocked(getKeyValueStorage) as Mock).mockReturnValueOnce({
      getItem: vi.fn(() => undefined),
    });

    const result = getDeviceMetadata("mocked-username");
    expect(result).toBeUndefined();
  });
});
