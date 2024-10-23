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

## Running Tests
To run the included unit tests:
```bash
npm test
```
