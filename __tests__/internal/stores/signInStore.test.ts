/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-21
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  signInStore,
  getDefaultState,
  signInReducer,
  createStore,
  setActiveSignInState,
  cleanActiveSignInState,
} from "../../../src/internal/stores/signInStore";
import type { SignInState, Action } from "../../../src/types/authTypes";

describe("signInStore Module", () => {
  describe("getDefaultState", () => {
    test("should return the default sign-in state", () => {
      const defaultState = getDefaultState();
      expect(defaultState).toEqual({
        username: "",
        challengeName: undefined,
        signInSession: undefined,
        signInDetails: undefined,
      });
    });
  });

  describe("signInReducer", () => {
    let initialState: SignInState;

    beforeEach(() => {
      initialState = {
        username: "",
        challengeName: undefined,
        signInSession: undefined,
        signInDetails: undefined,
      };
    });

    test("should handle SET_CHALLENGE_NAME action", () => {
      const action: Action = {
        type: "SET_CHALLENGE_NAME",
        value: "NEW_PASSWORD_REQUIRED",
      };
      const newState = signInReducer(initialState, action);
      expect(newState).toEqual({
        ...initialState,
        challengeName: "NEW_PASSWORD_REQUIRED",
      });
    });

    test("should handle SET_SIGN_IN_SESSION action", () => {
      const action: Action = {
        type: "SET_SIGN_IN_SESSION",
        value: "session123",
      };
      const newState = signInReducer(initialState, action);
      expect(newState).toEqual({
        ...initialState,
        signInSession: "session123",
      });
    });

    test("should handle SET_USERNAME action", () => {
      const action: Action = {
        type: "SET_USERNAME",
        value: "testUser",
      };
      const newState = signInReducer(initialState, action);
      expect(newState).toEqual({
        ...initialState,
        username: "testUser",
      });
    });

    test("should handle SET_SIGN_IN_STATE action", () => {
      const action: Action = {
        type: "SET_SIGN_IN_STATE",
        value: {
          username: "testUser",
          challengeName: "NEW_PASSWORD_REQUIRED",
          signInSession: "session123",
          signInDetails: { method: "SRP" },
        },
      };
      const newState = signInReducer(initialState, action);
      expect(newState).toEqual({
        username: "testUser",
        challengeName: "NEW_PASSWORD_REQUIRED",
        signInSession: "session123",
        signInDetails: { method: "SRP" },
      });
    });

    test("should handle SET_INITIAL_STATE action", () => {
      const action: Action = {
        type: "SET_INITIAL_STATE",
      };
      const newState = signInReducer(
        {
          username: "testUser",
          challengeName: "CHALLENGE",
          signInSession: "session123",
          signInDetails: { method: "SRP" },
        },
        action
      );
      expect(newState).toEqual(getDefaultState());
    });

    test("should return current state for unknown action", () => {
      const action: Action = {
        type: "UNKNOWN_ACTION",
        value: "someValue",
      };
      const newState = signInReducer(initialState, action);
      expect(newState).toEqual(initialState);
    });
  });

  describe("createStore", () => {
    test("should create a store with default state", () => {
      const reducer = (state: SignInState): SignInState => state;
      const store = createStore(reducer);
      expect(store.getState()).toEqual(getDefaultState());
    });

    test("store dispatch should update state", () => {
      const store = createStore(signInReducer);
      store.dispatch({ type: "SET_USERNAME", value: "testUser" });
      expect(store.getState().username).toBe("testUser");
    });
  });

  describe("signInStore", () => {
    beforeEach(() => {
      cleanActiveSignInState();
    });

    test("should have default state after initialization", () => {
      expect(signInStore.getState()).toEqual(getDefaultState());
    });

    test("dispatching actions should update the state", () => {
      signInStore.dispatch({ type: "SET_USERNAME", value: "testUser" });
      expect(signInStore.getState().username).toBe("testUser");
    });
  });

  describe("setActiveSignInState", () => {
    beforeEach(() => {
      cleanActiveSignInState();
    });

    test("should update signInStore state with provided state", () => {
      const newState: SignInState = {
        username: "testUser",
        challengeName: "NEW_PASSWORD_REQUIRED",
        signInSession: "session123",
        signInDetails: { method: "SRP" },
      };
      setActiveSignInState(newState);
      expect(signInStore.getState()).toEqual(newState);
    });
  });

  describe("cleanActiveSignInState", () => {
    test("should reset signInStore to default state", () => {
      signInStore.dispatch({ type: "SET_USERNAME", value: "testUser" });
      expect(signInStore.getState().username).toBe("testUser");
      cleanActiveSignInState();
      expect(signInStore.getState()).toEqual(getDefaultState());
    });
  });
});
