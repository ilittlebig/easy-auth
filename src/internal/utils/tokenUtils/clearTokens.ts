/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import {
  getAuthKeys,
  getLastAuthUserKey,
  getKeyValueStorage,
} from "../storageUtils";

export const clearTokens = async () => {
  const authKeys = getAuthKeys();
  const lastAuthUserKey = getLastAuthUserKey();
  const storage = getKeyValueStorage();

  await Promise.all([
    storage.removeItem(authKeys.accessToken),
    storage.removeItem(authKeys.idToken),
    storage.removeItem(authKeys.clockDrift),
    storage.removeItem(authKeys.refreshToken),
    storage.removeItem(authKeys.signInDetails),
    storage.removeItem(lastAuthUserKey),
  ]);
}
