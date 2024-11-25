/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */
interface AuthErrorInput {
    message: string;
    name: string;
}
export declare class AuthError extends Error {
    constructor({ message, name }: AuthErrorInput);
}
export {};
