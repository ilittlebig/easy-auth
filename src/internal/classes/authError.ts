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

export class AuthError extends Error {
	constructor({ message, name }: AuthErrorInput) {
		super(message);
		this.name = name;
	}
}
