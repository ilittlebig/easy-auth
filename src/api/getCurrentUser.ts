/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-28
 */

import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { AuthUserOutput } from "../types/auth";

export const getCurrentUser = async (): Promise<AuthUserOutput> => {
  const tokens = await getTokens({ forceRefresh: false });
	validateAuthTokens(tokens);

	const {
    "cognito:username": username,
    sub
  } = tokens.idToken?.payload ?? {};

	const authUser: AuthUserOutput = {
		username: username,
		userId: sub,
	};

  const signInDetails = tokens.signInDetails;
	if (signInDetails) {
		authUser.signInDetails = signInDetails;
	}

	return authUser;
}
