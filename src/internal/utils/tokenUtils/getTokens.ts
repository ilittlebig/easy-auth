/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import { loadTokens } from "./loadTokens";
import { refreshTokens } from "./refreshTokens";
import { getLastAuthUser } from "../storageUtils";
import type { TokensType } from "../../../types/auth/internal";
import type { GetCurrentSessionInput } from "../../../types/auth"

const isTokenExpired = (expiresAt: number, clockDrift: number) => {
	const currentTime = Date.now();
	return currentTime + clockDrift > expiresAt;
}

export const getTokens = async (options?: GetCurrentSessionInput): Promise<TokensType | null> => {
  let tokens = loadTokens();
  const username = getLastAuthUser();

  if (tokens === null) {
    return null;
  }

  const idTokenExpired =
    tokens?.idToken ? isTokenExpired(
      (tokens.idToken?.payload?.exp ?? 0) * 1000,
      tokens.clockDrift ?? 0,
    ) : true;

  const accessTokenExpired =
    tokens?.accessToken ? isTokenExpired(
      (tokens.accessToken?.payload?.exp ?? 0) * 1000,
      tokens.clockDrift ?? 0,
    ) : true;

  const shouldRefresh =
    options?.forceRefresh ||
    idTokenExpired ||
    accessTokenExpired;

  if (shouldRefresh) {
    tokens = await refreshTokens({
      tokens,
      username,
    });
    if (tokens === null) return null;
  }

  return {
    accessToken: tokens?.accessToken,
    idToken: tokens?.idToken,
    signInDetails: tokens?.signInDetails,
  } as TokensType;
}
