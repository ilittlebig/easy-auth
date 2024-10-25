/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import { signInStore } from "../stores/signInStore";

/**
 *
 */

export const setActiveSignInUsername = (username: string): void => {
	const { dispatch } = signInStore;
	dispatch({ type: "SET_USERNAME", value: username });
}

/**
 *
 */

export const getActiveSignInState = (username: string): string => {
	const state = signInStore.getState();
	return state.username ?? username;
};

/**
 *
 */

export const getSignInResultFromError = (errorName: string) => {
  if (errorName === "PasswordResetRequiredException") {
    return {
			isSignedIn: false,
			nextStep: { signInStep: "RESET_PASSWORD" },
		};
  }
}
