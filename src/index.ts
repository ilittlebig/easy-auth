/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { EasyAuth } from "./internal/classes/easyAuth";
import { signIn } from "./api/signIn";
import { signOut } from "./api/signOut";
import { confirmSignIn } from "./api/confirmSignIn";
import { confirmResetPassword } from "./api/confirmResetPassword";
import { resetPassword } from "./api/resetPassword";
import { getCurrentUser } from "./api/getCurrentUser";
import { getCurrentSession } from "./api/getCurrentSession";
import { changePassword } from "./api/changePassword";

export {
  // classes
  EasyAuth,

  // api
  signIn,
  signOut,
  confirmSignIn,
  confirmResetPassword,
  resetPassword,
  getCurrentUser,
  getCurrentSession,
  changePassword,
};

export * from "./types";
