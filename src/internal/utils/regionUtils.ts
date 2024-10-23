/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import { AuthError } from "../classes";
import { authErrorStrings } from "./errorUtils";

const throwInvalidUserPoolIdError = () => {
  throw new AuthError({
    name: "InvalidUserPoolIdException",
    message: authErrorStrings.InvalidUserPoolIdException,
  });
};

const splitUserPoolId = (userPoolId: string) => {
  if (typeof userPoolId !== "string" || !userPoolId.includes("_")) {
    throwInvalidUserPoolIdError();
  }

  const parts = userPoolId.split("_").map(part => part.trim());
  if (parts.length !== 2 || parts[0] === "" || parts[1] === "") {
    throwInvalidUserPoolIdError();
  }

  return parts;
};

/**
 *
 *
 * Example usage:
 * const region = getRegion("eu-central-1_XXXXXX");
 * console.log(region); -> "eu-central-1"
 *
 */

export const getRegion = (userPoolId: string): string => {
  const [region] = splitUserPoolId(userPoolId);
  return region;
};

/**
 *
 *
 * Example usage:
 * const userPoolName = getUserPoolName("eu-central-1_XXXXXX");
 * console.log(userPoolName); -> "XXXXXX"
 *
 */

export const getUserPoolName = (userPoolId: string): string => {
  const [, userPoolName] = splitUserPoolId(userPoolId);
  return userPoolName;
};
