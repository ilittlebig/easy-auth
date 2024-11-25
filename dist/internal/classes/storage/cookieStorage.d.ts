import { KeyValueStorageInterface, CookieStorageData } from '../../../types/auth/internal';
export declare class CookieStorage implements KeyValueStorageInterface {
    private path;
    private domain?;
    private expires?;
    private secure?;
    private sameSite?;
    constructor(data?: CookieStorageData);
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    private getData;
}
