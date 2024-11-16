/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-11-16
 */

import JsCookie from "js-cookie";
import { AuthError } from "../authError";
import { authErrorStrings } from "../../utils/errorUtils";
import type {
	KeyValueStorageInterface,
	CookieStorageData,
	SameSite,
} from "../../../types/auth/internal";

export class CookieStorage implements KeyValueStorageInterface {
	private path: string;
	private domain?: string;
	private expires?: number;
	private secure?: boolean;
	private sameSite?: SameSite;

	constructor(data: CookieStorageData = {}) {
		const { path, domain, expires, secure, sameSite } = data;
		this.path = path || "/";
		this.domain = domain;

		this.expires = Object.prototype.hasOwnProperty.call(data, "expires")
			? expires
			: 365;
		this.secure = Object.prototype.hasOwnProperty.call(data, "secure")
			? secure
			: true;

		const hasSameSite = Object.prototype.hasOwnProperty.call(data, "sameSite");
		if (!hasSameSite) return;

		if (!sameSite || !["strict", "lax", "none"].includes(sameSite)) {
			throw new AuthError({
				name: "InvalidSameSiteValueException",
				message: authErrorStrings.InvalidSameSiteValueException,
			});
		}

		if (sameSite === "none" && !this.secure) {
			throw new AuthError({
				name: "SameSiteNoneRequiresSequreException",
				message: authErrorStrings.SameSiteNoneRequiresSequreException,
			});
		}

		this.sameSite = sameSite;
	}

	getItem(key: string): string | null {
		return JsCookie.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		JsCookie.set(key, value, this.getData());
	}

	removeItem(key: string) {
		JsCookie.remove(key, this.getData());
	}

	clear() {
		const cookies = JsCookie.get();
		Object.keys(cookies).forEach(key => this.removeItem(key));
	}

	private getData(): CookieStorageData {
		return {
			path: this.path,
			domain: this.domain,
			expires: this.expires,
			secure: this.secure,
			...(this.sameSite && { sameSite: this.sameSite }),
		};
	}
}
