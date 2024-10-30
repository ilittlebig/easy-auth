# AWS Cognito Authentication Library
A simple, no-fuss authentication library using AWS SDK with SRP-based login. Designed to make AWS Cognito integration straightforward and secure.

### Features
-	🔒 Secure Authentication: Uses SRP (Secure Remote Password) for safe user logins.
- ⚙️ AWS SDK Integration: Works seamlessly with AWS Cognito.
- 👤 User Management: Easily handle user registration, login, and password resets.
-	✅ Unit Tests: Fully tested to ensure everything works smoothly.

### Installation
> **Note:** This library is not yet published to npm. You will need to clone the repository, build it, and link it locally to use it.

1. Clone the repo:
```bash
git clone https://github.com/ilittlebig/easy-auth.git
```

2. Navigate into the project folder and build it:
```bash
cd easy-auth
npm run build
```

3. Link the package locally:
```bash
npm link
```

5. In your project, link to the library:
```bash
npm link easy-auth
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

#### Change Password
Use the `changePassword` function to update the password for an authenticated user. This function requires the current (previous) password and the new (proposed) password.
```ts
import { changePassword } from "easy-auth";

await getCurrentUser({
  previousPassword: "oldPassword123",
  proposedPassword: "newPassword321"
});
```

## Running Tests
To run the included unit tests:
```bash
npm test
```

## References
- [AWS Amplify](https://github.com/aws-amplify/amplify-js/tree/main)
- [AWS Cognito](https://aws.amazon.com/pm/cognito/?gclid=Cj0KCQjw4Oe4BhCcARIsADQ0csmmQYKFkPMoXc-u8_XjXmrA8zBWbYHqGLd3a-bxTEeROm9PqxHGvWoaAtF1EALw_wcB&trk=d4ed1ec2-fa74-4450-ad36-bdbfda7b0575&sc_channel=ps&ef_id=Cj0KCQjw4Oe4BhCcARIsADQ0csmmQYKFkPMoXc-u8_XjXmrA8zBWbYHqGLd3a-bxTEeROm9PqxHGvWoaAtF1EALw_wcB:G:s&s_kwcid=AL!4422!3!689494568877!e!!g!!amazon%20cognito!20987280941!164069379011)
