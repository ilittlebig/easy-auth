/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-23
 */

import {
  vi,
  describe,
  test,
  expect,
} from "vitest";
import { AuthError } from "../../src/internal/classes";
import { authErrorStrings } from "../../src/internal/utils/errorUtils";
import { decodeJWT } from "../../src/internal/utils/decodeUtils";

vi.mock("../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

describe("decodeJWT", () => {
  test("successfully decodes a valid JWT token", () => {
    const validJWT = "header.payload.signature"; // Mocked JWT parts
    const mockPayload = { sub: "1234567890", name: "John Doe", admin: true };

    vi.spyOn(global, "atob").mockReturnValueOnce(
      JSON.stringify(mockPayload)
    );

    const result = decodeJWT(validJWT);
    expect(result.payload).toEqual(mockPayload);
    expect(result.toString()).toEqual(validJWT);
  });

  test("throws error when JWT token does not have exactly 3 parts", () => {
    const invalidJWT = "header.payload"; // Missing signature part
    expect(() => decodeJWT(invalidJWT)).toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidJWTTokenException",
      message: authErrorStrings.InvalidJWTTokenException,
    });
  });

  test("throws error when payload cannot be decoded", () => {
    const invalidBase64Payload = "header.invalidPayload.signature";

    vi.spyOn(global, "atob").mockImplementation(() => {
      throw new Error("Invalid base64 string");
    });

    expect(() => decodeJWT(invalidBase64Payload)).toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidJWTTokenException",
      message: `${authErrorStrings.InvalidJWTTokenPayloadException}: Invalid base64 string`,
    });
  });

  test("throws error when payload is not valid JSON", () => {
    const invalidJSONPayload = "header.invalidJson.signature";

    vi.spyOn(global, "atob").mockReturnValueOnce("invalidJsonString");

    expect(() => decodeJWT(invalidJSONPayload)).toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidJWTTokenException",
      message: `${authErrorStrings.InvalidJWTTokenPayloadException}: Unexpected token 'i', "invalidJsonString" is not valid JSON`,
    });
  });

  test("decodes JWT with special characters in payload", () => {
    const validJWT = "header.payload.signature";
    const specialCharPayload = { name: "John%20Doe" };

    vi.spyOn(global, "atob").mockReturnValueOnce(
      JSON.stringify(specialCharPayload)
    );

    const result = decodeJWT(validJWT);
    expect(result.payload.name).toEqual("John%20Doe");
  });
});
