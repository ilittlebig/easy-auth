/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { Options } from "../types/authTypes";

export const getCurrentSession = async (options?: Options) => {
  const tokens = await getTokens(options);
	validateAuthTokens(tokens);
  const sub = tokens.accessToken.payload.sub;
  return { tokens, sub };
}
