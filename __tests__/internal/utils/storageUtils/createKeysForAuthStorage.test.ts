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
} from "vitest";
import { createKeysForAuthStorage } from "../../../../src/internal/utils/storageUtils";

describe("createKeysForAuthStorage", () => {
  test("should create keys with specified provider and identifier", () => {
    const provider = "TestProvider";
    const identifier = "TestIdentifier";

    const authKeys = createKeysForAuthStorage(provider, identifier);

    expect(authKeys.accessToken).toBe("TestProvider.TestIdentifier.accessToken");
    expect(authKeys.idToken).toBe("TestProvider.TestIdentifier.idToken");
    expect(authKeys.clockDrift).toBe("TestProvider.TestIdentifier.clockDrift");
    expect(authKeys.refreshToken).toBe("TestProvider.TestIdentifier.refreshToken");
    expect(authKeys.deviceKey).toBe("TestProvider.TestIdentifier.deviceKey");
    expect(authKeys.deviceGroupKey).toBe("TestProvider.TestIdentifier.deviceGroupKey");
    expect(authKeys.randomPassword).toBe("TestProvider.TestIdentifier.randomPassword");
    expect(authKeys.signInDetails).toBe("TestProvider.TestIdentifier.signInDetails");
  });

  test("should handle empty provider and identifier", () => {
    const authKeys = createKeysForAuthStorage("", "");

    expect(authKeys.accessToken).toBe(".accessToken");
    expect(authKeys.idToken).toBe(".idToken");
    expect(authKeys.clockDrift).toBe(".clockDrift");
    expect(authKeys.refreshToken).toBe(".refreshToken");
    expect(authKeys.deviceKey).toBe(".deviceKey");
    expect(authKeys.deviceGroupKey).toBe(".deviceGroupKey");
    expect(authKeys.randomPassword).toBe(".randomPassword");
    expect(authKeys.signInDetails).toBe(".signInDetails");
  });
});
