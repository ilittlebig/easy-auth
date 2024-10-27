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
  type Mock
} from "vitest";
import {
  getAuthKeys,
  getLastAuthUserKey,
  getKeyValueStorage
} from "../../../../src/internal/utils/storageUtils";
import { clearTokens } from "../../../../src/internal/utils/tokenUtils";

vi.mock("../../../../src/internal/utils/storageUtils", async () => {
  const originalModule = await import("../../../../src/internal/utils/storageUtils");
  return {
    ...originalModule,
    getAuthKeys: vi.fn(),
    getLastAuthUserKey: vi.fn(),
    getKeyValueStorage: vi.fn(),
  };
});

describe("clearTokens", () => {
  const authKeys = {
    accessToken: "mockedAccessTokenKey",
    idToken: "mockedIdTokenKey",
    clockDrift: "mockedClockDriftKey",
    refreshToken: "mockedRefreshTokenKey",
    signInDetails: "mockedSignInDetailsKey",
  };

  const mockLastAuthUserKey = "mockedLastAuthUserKey";
  const mockStorage = {
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    (getAuthKeys as Mock).mockReturnValue(authKeys);
    (getLastAuthUserKey as Mock).mockReturnValue(mockLastAuthUserKey);
    (getKeyValueStorage as Mock).mockReturnValue(mockStorage);
    vi.clearAllMocks();
  });

  test("should remove all token-related keys from storage", async () => {
    await clearTokens();

    expect(mockStorage.removeItem).toHaveBeenCalledWith(authKeys.accessToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(authKeys.idToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(authKeys.clockDrift);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(authKeys.refreshToken);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(authKeys.signInDetails);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(mockLastAuthUserKey);
  });

  test("should handle cases where storage.removeItem throws errors gracefully", async () => {
    mockStorage.removeItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    expect(() => clearTokens())
      .rejects
      .toThrow();
  });
});
