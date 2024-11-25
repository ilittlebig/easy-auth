# AWS Cognito Authentication Library
A simple, no-fuss authentication library using AWS SDK with SRP-based login. Designed to make AWS Cognito integration straightforward and secure.

> **Note:** The implementation of this library is inspired by AWS Amplify.

### Features
-	🔒 Secure Authentication: Uses SRP (Secure Remote Password) for safe user logins.
- ⚙️ AWS SDK Integration: Works seamlessly with AWS Cognito.
- 👤 User Management: Easily handle user registration, login, and password resets.
-	✅ Unit Tests: Fully tested to ensure everything works smoothly.

### Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Sign In](#sign-in)
  - [Reset Password](#reset-password)
  - [Get Current Session](#get-current-session)
  - [Get Current User](#get-current-user)
  - [Sign Out](#sign-out)
  - [Update Password](#update-password)
  - [Update MFA Preference](#update-mfa-preference)
  - [Get MFA Preference](#get-mfa-preference)
  - [Get Devices](#get-devices)
  - [Get User Attributes](#get-user-attributes)
  - [Verify TOTP](#verify-totp)
  - [Sign Up](#sign-up)
  - [Confirm Sign Up](#confirm-sign-up)
  - [Resend Sign Up Code](#resend-sign-up-code)
  - [Delete User](#delete-user)
  - [Change Storage Provider](#change-storage-provider)
- [Running Tests](#running-tests)
- [References](#references)

### Installation
1. In your project, run this command:
```bash
npm i @ilittlebig/easy-auth
```

### Usage
#### Configuration
Before using the authentication functions, configure EasyAuth with your AWS Cognito credentials:
```ts
EasyAuth.configure({
  Auth: {
    Cognito: {
      userPoolId: "your-user-pool-id",
      userPoolClientId: "your-user-pool-client-id"
    },
  }
});
```

#### Sign In
To sign in a user, pass the username and password:
```ts
import { signIn } from "easy-auth";

const result = await signIn({
  username: "email@domain.com",
  password: "LongPassword123!!"
});
```
The `signIn` function may return a `nextStep` if further action is needed (e.g., setting a new password or entering an MFA code). You can handle each step based on the `nextStep.signInStep` value:
```ts
import { confirmSignIn } from "easy-auth";

if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
  // Handle new password requirement
  await confirmSignIn({ challengeResponse: "newPassword123" });
}
```
When all steps are completed, `nextStep.signInStep` will return `DONE`, indicating a successful sign-in.

#### Reset Password
To start the password reset flow, provide the username:
```ts
import { resetPassword } from "easy-auth";
await resetPassword({ username: "email@domain.com" });
```
If a confirmation code is required, confirm the password reset:
```ts
import { confirmResetPassword } from "easy-auth";

await confirmResetPassword({
  username: "email@domain.com",
  confirmationCode: "123456",
  newPassword: "LongPassword123!!",
});
```

#### Get Current Session
Retrieve the current session tokens, including the access and ID tokens, along with the user ID (sub). These tokens may contain user information, roles, and expiration details.
```ts
import { getCurrentSession } from "easy-auth";
const { tokens, sub } = await getCurrentSession();
```


#### Get Current User
Retrieve the current session tokens and user ID (sub) for ongoing authentication or session management needs.
```ts
import { getCurrentUser } from "easy-auth";
const { username, userId } = await getCurrentUser();
```

#### Sign Out
To sign out a user, use the `signOut` function. You can pass an optional parameter `{ isGlobal: true | false }` to determine whether the sign-out should be global (across all devices) or just on the current client.
```ts
import { signOut } from "easy-auth";

// Sign out from all devices
await signOut({ isGlobal: true });

// Sign out only from the current device
await signOut({ isGlobal: false });
```

#### Update Password
Use the `updatePassword` function to update the password for an authenticated user. This function requires the current (previous) password and the new (proposed) password.
```ts
import { updatePassword } from "easy-auth";

await updatePassword({
  previousPassword: "oldPassword123",
  proposedPassword: "newPassword321"
});
```

#### Update MFA Preference
Use the `updateMFAPreference` function to configure the Multi-Factor Authentication (MFA) preferences for an authenticated user. You can set preferences for both `totp` (Time-based One-Time Password) and `sms` (SMS-based) MFA methods.

Both `totp` and `sms` preferences are optional and can be set to the following values:
- `"PREFERRED"`: Sets MFA as the preferred authentication method.
- `"ENABLED"`: Enables MFA but does not make it preferred.
- `"DISABLED"`: Disables MFA for this method.
- `"NOT_PREFERRED"`: Sets MFA as non-preferred.

```ts
import { updateMFAPreference } from "easy-auth";

await updateMFAPreference({
  totp: "PREFERRED",
  sms: "NOT_PREFERRED"
});
```

#### Get MFA Preference
Use the `getMFAPreference` function to retrieve the current Multi-Factor Authentication (MFA) preferences for an authenticated user. This function provides the user’s preferred MFA method and a list of all enabled MFA settings.

The response object includes:
- `preferredMFASetting`: The preferred MFA method, such as `"TOTP"`.
- `userMFASettingList`: An array of enabled MFA methods, like `["TOTP","SMS"]`.

```ts
import { getMFAPreference } from "easy-auth";
const result = await getMFAPreference();
```

#### Get Devices
Use the `getDevices` function to retrieve a list of remembered devices associated with the authenticated user. This list includes devices that the user has previously chosen to remember during the login process.

```ts
import { getDevices } from "easy-auth";
const devices = await getDevices();
```

#### Get User Attributes
Retrieves key profile details for the authenticated user from AWS Cognito. This data often includes information such as the user's email, verification status, and unique user identifier (sub), among other attributes configured in your Cognito setup.

```ts
import { getUserAttributes } from "easy-auth";
const attributes = await getUserAttributes();
```

#### Verify TOTP
Verifies a Time-based One-Time Password (TOTP) code, typically used for Multi-Factor Authentication (MFA). Checks the code provided by the user and returns a result indicating whether the verification was successful or not.

The result object includes:
- `status`: `"SUCCESS"` if the verification was successful, or `"ERROR"` if it failed.
- `session`: An optional session token included if a session is available.

```ts
import { verifyTOTP } from "easy-auth";
const result = await verifyTOTP();
```

#### Sign Up
Registers a new user with AWS Cognito. To create a user, provide a `username` and `password`. You can also pass optional user attributes to customize the user's profile. AWS Cognito supports the following standard attributes:

- `name`
- `family_name`
- `given_name`
- `middle_name`
- `nickname`
- `preferred_username`
- `profile`
- `picture`
- `website`
- `gender`
- `birthdate`
- `zoneinfo`
- `locale`
- `updated_at`
- `address`
- `email`
- `phone_number`
- `sub`

Example:
```ts
import { signUp } from "easy-auth";

const result = await signUp({
  username: "email@domain.com",
  password: "LongPassword123!!",
  options: {
    userAttributes: {
      gender: "Male",
      nickname: "Olof"
    }
  }
});
```

#### Confirm Sign Up
After signing up, the user must confirm their account, typically by entering a confirmation code sent to their email. Use the confirmSignUp function to verify the code and complete the registration process.

```ts
import { confirmSignUp } from "easy-auth";

let signUpCode = "123456";

const result = await confirmSignUp({
  username: "email@domain.com",
  confirmationCode: signUpCode
});
```

#### Resend Sign Up Code
Allows you to resend the confirmation code to a user who is in the process of signing up but hasn’t yet confirmed their account. This is useful if the user didn’t receive the original code or needs a new one.

```ts
import { resendSignUpCode } from "easy-auth";

const codeDeliveryDetails = await resendSignUpCode({
  username: "email@domain.com",
});
```

#### Delete User
Permanently deletes the authenticated user's account from AWS Cognito. This action is irreversible and removes all associated user data. It’s typically used when a user wants to close their account.

```ts
import { deleteUser } from "easy-auth";
await deleteUser();
```

#### Change Storage Provider
Select the default storage provider for managing token storage, such as `localStorage` or `inMemoryStorage`, which are stored locally, or opt for `cookieStorage`, where tokens are stored in cookies.

```ts
// Store tokens in cookies
import { EasyAuth, CookieStorage } from "easy-auth";
EasyAuth.setKeyValueStorage(new CookieStorage());

// Store tokens in memory
import { EasyAuth, InMemoryStorage } from "easy-auth";
EasyAuth.setKeyValueStorage(new InMemoryStorage());
```

## Running Tests
To run the included unit tests:
```bash
npm test
```

## References
- [AWS Amplify](https://github.com/aws-amplify/amplify-js/tree/main)
- [AWS Cognito](https://aws.amazon.com/pm/cognito/?gclid=Cj0KCQjw4Oe4BhCcARIsADQ0csmmQYKFkPMoXc-u8_XjXmrA8zBWbYHqGLd3a-bxTEeROm9PqxHGvWoaAtF1EALw_wcB&trk=d4ed1ec2-fa74-4450-ad36-bdbfda7b0575&sc_channel=ps&ef_id=Cj0KCQjw4Oe4BhCcARIsADQ0csmmQYKFkPMoXc-u8_XjXmrA8zBWbYHqGLd3a-bxTEeROm9PqxHGvWoaAtF1EALw_wcB:G:s&s_kwcid=AL!4422!3!689494568877!e!!g!!amazon%20cognito!20987280941!164069379011)
