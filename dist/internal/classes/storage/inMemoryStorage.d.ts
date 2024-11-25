/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-16
 */
export declare class InMemoryStorage implements Storage {
    private storage;
    get length(): number;
    key(index: number): string | null;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
