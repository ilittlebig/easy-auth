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
} from "vitest";
import { EasyAuth } from "../../../../src/internal/classes";
import { authTestParams } from "../../../testUtils/authTestParams";
import { clearDeviceMetadata } from "../../../../src/internal/utils/deviceMetadataUtils";
import { getKeyValueStorage } from "../../../../src/internal/utils/storageUtils";

vi.mock("../../../../src/internal/utils/storageUtils", () => ({
  getKeyValueStorage: vi.fn().mockReturnValue({
    removeItem: vi.fn(),
  }),
  getAuthKeys: vi.fn().mockReturnValue({
    deviceKey: "mocked-deviceKey",
    deviceGroupKey: "mocked-deviceGroupKey",
    randomPassword: "mocked-randomPassword",
  }),
}));

EasyAuth.configure({
  Auth: {
    Cognito: authTestParams.cognitoConfig
  },
});

describe("clearDeviceMetadata", () => {
  test("should clear device metadata", async () => {
    const storage = getKeyValueStorage();
    clearDeviceMetadata("mocked-username");

    expect(storage.removeItem).toHaveBeenCalledWith("mocked-deviceKey");
    expect(storage.removeItem).toHaveBeenCalledWith("mocked-deviceGroupKey");
    expect(storage.removeItem).toHaveBeenCalledWith("mocked-randomPassword");
  });
});

