/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import {
  vi,
  describe,
  test,
  expect,
} from "vitest";
import { AuthError } from "../../../src/internal/classes";
import { authErrorStrings } from "../../../src/internal/utils/errorUtils";
import { getRegion, getUserPoolName } from "../../../src/internal/utils/regionUtils";

vi.mock("../../../src/internal/classes", () => ({
  AuthError: vi.fn(),
}));

describe("getRegion", () => {
  test("successfully extract region from valid 'userPoolId'", () => {
    const userPoolId = "eu-central-1_XXXXXX";
    const region = getRegion(userPoolId);
    expect(region).toEqual("eu-central-1");
  });

  test("throws an error when 'userPoolId' has multiple underscores", () => {
    const userPoolId = "eu-central-1_XXX_XXX";
    expect(() => getRegion(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is undefined", () => {
    const userPoolId = undefined as unknown as string;
    expect(() => getRegion(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' does not contain an underscore", () => {
    const userPoolId = "eu-no-underscore-123456789";
    expect(() => getRegion(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is only an underscore", () => {
    const userPoolId = "_";
    expect(() => getRegion(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is not a string", () => {
    const userPoolId = 123456789 as unknown as string;
    expect(() => getRegion(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });
});

describe("getUserPoolName", () => {
  test("successfully extract 'userPoolName' from valid 'userPoolId'", () => {
    const userPoolId = "eu-central-1_XXXXXX";
    const userPoolName = getUserPoolName(userPoolId);
    expect(userPoolName).toEqual("XXXXXX");
  });

  test("throws an error when 'userPoolId' has multiple underscores", () => {
    const userPoolId = "eu-central-1_XXX_XXX";
    expect(() => getUserPoolName(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is undefined", () => {
    const userPoolId = undefined as unknown as string;
    expect(() => getUserPoolName(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' does not contain an underscore", () => {
    const userPoolId = "eu-no-underscore-123456789";
    expect(() => getUserPoolName(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is only an underscore", () => {
    const userPoolId = "_";
    expect(() => getUserPoolName(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });

  test("throw error when 'userPoolId' is not a string", () => {
    const userPoolId = 123456789 as unknown as string;
    expect(() => getUserPoolName(userPoolId))
      .toThrowError(AuthError);

    expect(AuthError).toHaveBeenCalledWith({
      name: "InvalidUserPoolIdException",
      message: authErrorStrings.InvalidUserPoolIdException,
    });
  });
});
