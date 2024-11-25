import { KeyValueStorageInterface } from '../../../types/auth/internal';
export declare class DefaultStorage implements KeyValueStorageInterface {
    private storage;
    constructor();
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
