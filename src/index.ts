/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { EasyAuth } from "./internal/classes/easyAuth";
import { signIn } from "./api/signIn";
import { confirmSignIn } from "./api/confirmSignIn";
import { getCurrentUser } from "./api/getCurrentUser";
import { getCurrentSession } from "./api/getCurrentSession";

export {
  // classes
  EasyAuth,

  // api
  signIn,
  confirmSignIn,
  getCurrentUser,
  getCurrentSession,
};

export * from "./types";
