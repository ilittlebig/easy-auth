/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { GetCurrentSessionInput } from "../types/auth/inputs";

export const getCurrentSession = async (options?: GetCurrentSessionInput) => {
  const tokens = await getTokens(options);
	validateAuthTokens(tokens);
  const sub = tokens.accessToken.payload.sub;
  return { tokens, sub };
}
