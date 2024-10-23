# AWS Cognito Authentication Library
A simple AWS Cognito authentication library using AWS SDK with SRP-based login.

### Features
-	🔒 Secure Authentication: Uses SRP (Secure Remote Password) for safe user logins.
- ⚙️ AWS SDK Integration: Works seamlessly with AWS Cognito.
- 👤 User Management: Easily handle user registration, login, and password resets.
-	✅ Unit Tests: Fully tested to ensure everything works smoothly.

### Installation
> **Note:** This library is not yet published to npm. You will need to clone the repository, build it, and link it locally to use it.

1. Clone the repo:
```bash
git clone https://github.com/ilittlebig/easy-cognito-auth.git
```

2. Navigate into the project folder and build it:
```bash
cd easy-cognito-auth
npm run build
```

3. Link the package locally:
```bash
npm link
```

5. In your project, link to the library:
```bash
npm link easy-cognito-auth
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
await signIn({ username: "email@domain.com", password: "LongPassword123!!" });
```
If a challenge (like MFA or new password requirement) is returned, you must handle it by confirming the sign-in:
```ts
import { confirmSignIn } from "easy-auth";
await confirmSignIn({ challengeResponse: "your-response" });
```

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

## Running Tests
To run the included unit tests:
```bash
npm test
```
