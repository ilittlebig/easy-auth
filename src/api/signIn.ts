/**
 * Handles the sign in flow for the user.
 * Calls the appropriate function based on the authFlowType.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { signInWithSRP } from "./signInWithSRP";
import { validateUserNotAuthenticated } from "../internal/utils/errorUtils";
import type { SignInInput, SignInOutput } from "../types/auth";

export const signIn = async (input: SignInInput): Promise<SignInOutput> => {
  const authFlowType = input.options?.authFlowType;
  await validateUserNotAuthenticated();
  switch (authFlowType) {
    default:
      return signInWithSRP(input as Required<Pick<SignInInput, "username" | "password">>);
  }
}

