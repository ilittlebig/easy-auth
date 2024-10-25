/**
 * This file is responsible for handling the state of the sign-in process.
 * It is used to store the state of the sign-in process and to update it.
 * It is also used to set the initial state of the sign-in process.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import type { SignInState, Action, Store } from "../../types/authTypes";

export const getDefaultState = (): SignInState => {
  return {
    username: "",
    challengeName: undefined,
    signInSession: undefined,
    signInDetails: undefined,
  };
};

export const signInReducer = (state: SignInState, action: Action): SignInState => {
  switch (action.type) {
    case "SET_CHALLENGE_NAME":
      return {
        ...state,
        challengeName: action.value,
      };
    case "SET_SIGN_IN_SESSION":
      return {
        ...state,
        signInSession: action.value,
      };
    case "SET_USERNAME":
      return {
        ...state,
        username: action.value,
      };
    case "SET_SIGN_IN_STATE":
      return { ...action.value };
    case "SET_INITIAL_STATE":
      return getDefaultState();
    default:
      return state;
  }
};

export const createStore = (reducer: (state: SignInState, action: Action) => SignInState): Store => {
  const defaultState = getDefaultState();
  let currentState = reducer(defaultState, { type: "SET_INITIAL_STATE" });

  return {
    getState: () => currentState,
    dispatch: (action: Action) => {
      currentState = reducer(currentState, action);
    },
  };
};

export const setActiveSignInState = (state: SignInState): void => {
  signInStore.dispatch({
    type: "SET_SIGN_IN_STATE",
    value: state,
  });
};

export const cleanActiveSignInState = (): void => {
  signInStore.dispatch({
    type: "SET_INITIAL_STATE",
  });
};

export const signInStore = createStore(signInReducer);
