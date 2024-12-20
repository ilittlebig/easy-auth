/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-16
 */

import { EasyAuth } from "./internal/classes/easyAuth";
import { Hub } from "./internal/classes/hub";
import { DefaultStorage } from "./internal/classes/storage/defaultStorage";
import { CookieStorage } from "./internal/classes/storage/cookieStorage";
import { InMemoryStorage } from "./internal/classes/storage/inMemoryStorage";

import { signIn } from "./api/signIn";
import { signOut } from "./api/signOut";
import { confirmSignIn } from "./api/confirmSignIn";
import { confirmResetPassword } from "./api/confirmResetPassword";
import { resetPassword } from "./api/resetPassword";
import { getCurrentUser } from "./api/getCurrentUser";
import { getCurrentSession } from "./api/getCurrentSession";
import { updatePassword } from "./api/updatePassword";
import { getMFAPreference } from "./api/getMFAPreference";
import { updateMFAPreference } from "./api/updateMFAPreference";
import { getDevices } from "./api/getDevices";
import { getUserAttributes } from "./api/getUserAttributes";
import { verifyTOTP } from "./api/verifyTOTP";
import { signUp } from "./api/signUp";
import { confirmSignUp } from "./api/confirmSignUp";
import { resendSignUpCode } from "./api/resendSignUpCode";
import { deleteUser } from "./api/deleteUser";

export {
	// classes
	Hub,
	EasyAuth,
	DefaultStorage,
	CookieStorage,
	InMemoryStorage,

	// api
	signIn,
	signOut,
	confirmSignIn,
	confirmResetPassword,
	resetPassword,
	getCurrentUser,
	getCurrentSession,
	updatePassword,
	getMFAPreference,
	updateMFAPreference,
	getDevices,
	getUserAttributes,
	verifyTOTP,
	signUp,
	confirmSignUp,
	resendSignUpCode,
	deleteUser,
};

export * from "./types";
