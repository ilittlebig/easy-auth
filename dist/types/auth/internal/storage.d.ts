/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-16
 */
export type SameSite = "strict" | "lax" | "none";
export interface KeyValueStorageInterface {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
export interface CookieStorageData {
    domain?: string;
    path?: string;
    expires?: number;
    secure?: boolean;
    sameSite?: SameSite;
}
