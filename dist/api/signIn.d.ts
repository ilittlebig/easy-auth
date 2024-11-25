/**
 * Handles the sign in flow for the user.
 * Calls the appropriate function based on the authFlowType.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */
interface SignInInput {
    options?: {
        authFlowType?: string;
    };
    username?: string;
    password?: string;
}
export declare const signIn: (input: SignInInput) => Promise<unknown>;
export {};
