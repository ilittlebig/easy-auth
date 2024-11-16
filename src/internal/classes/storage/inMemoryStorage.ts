/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-16
 */

export class InMemoryStorage implements Storage {
	private storage = new Map<string, string>();

	get length() {
		return this.storage.size;
	}

	key(index: number): string | null {
		if (index > this.length - 1) {
			return null;
		}
		return Array.from(this.storage.keys())[index];
	}

	getItem(key: string) {
		return this.storage.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		this.storage.set(key, value)
	}

	removeItem(key: string) {
		this.storage.delete(key);
	}

	clear() {
		this.storage.clear();
	}
}
