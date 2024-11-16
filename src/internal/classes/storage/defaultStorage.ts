/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-16
 */

import { InMemoryStorage } from "./inMemoryStorage";
import type { KeyValueStorageInterface } from "../../../types/auth/internal";

const getLocalStorageWithFallback = () => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			return window.localStorage;
		}
	} catch {
		console.log("localStorage not found, using inMemoryStorage as fallback");
	}

	return new InMemoryStorage();
}

export class DefaultStorage implements KeyValueStorageInterface {
	private storage: Storage;

	constructor() {
		this.storage = getLocalStorageWithFallback();
	}

	getItem(key: string): string | null {
		return this.storage.getItem(key);
	}

	setItem(key: string, value: string) {
		this.storage.setItem(key, value)
	}

	removeItem(key: string) {
		this.storage.removeItem(key);
	}

	clear() {
		this.storage.clear();
	}
}
