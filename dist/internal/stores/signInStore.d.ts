import { SignInState, Action, Store } from '../../types/store';
export declare const getDefaultState: () => SignInState;
export declare const signInReducer: (state: SignInState, action: Action) => SignInState;
export declare const createStore: (reducer: (state: SignInState, action: Action) => SignInState) => Store;
export declare const setActiveSignInState: (state: SignInState) => void;
export declare const cleanActiveSignInState: () => void;
export declare const signInStore: Store;
