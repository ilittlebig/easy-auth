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
import { EasyAuth } from "../../../src/internal/classes";
import { getLastAuthUserKey } from "../../../src/internal/utils/storageUtils";

vi.mock("../../../src/internal/classes", () => ({
  EasyAuth: {
    getConfig: vi.fn(),
  },
}));

describe("getLastAuthUserKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return the correct LastAuthUser key based on the user pool client ID", () => {
    (EasyAuth.getConfig as Mock).mockReturnValue({
      Auth: {
        Cognito: {
          userPoolClientId: "mockedClientId",
        },
      },
    });

    const result = getLastAuthUserKey();
    expect(result).toBe("CognitoIdentityServiceProvider.mockedClientId.LastAuthUser");
  });
});
