/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-22
 */

import { AuthError } from "../classes";
import { authErrorStrings } from "./errorUtils";

/**
 *
 */

export const decodeJWT = (token: string) => {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new AuthError({
      name: "InvalidJWTTokenException",
      message: authErrorStrings.InvalidJWTTokenException
    });
  }

  try {
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);

    const decodedPayload = decodeURIComponent(jsonPayload.split("").map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    const payload = JSON.parse(decodedPayload);
    return {
      toString: () => token,
      payload,
    };
  } catch (err: any) {
    throw new AuthError({
      name: "InvalidJWTTokenException",
      message: authErrorStrings.InvalidJWTTokenPayloadException + ": " + err.message
    });
  }
}
