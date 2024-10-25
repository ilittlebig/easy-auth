/**
 * Mockup data for testing the authentication process.
 *
 * Author: Elias Sjödin
 * Created: 2024-10-24
 */

export const VALID_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0"
export const VALID_ID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0"

const authenticationResult = {
  AccessToken: VALID_ACCESS_TOKEN,
  ExpiresIn: 3600,
  IdToken: VALID_ID_TOKEN,
  RefreshToken: "xxxxxxxxxxxxxxxx",
  NewDeviceMetadata: {
  },
};

export const authTestParams = {
  authenticationResult,

  user1: {
    username: "email@domain.com",
    password: "LongPassword!!123",
  },

  cognitoConfig: {
    userPoolId: "eu-central-1_123456789",
    userPoolClientId: "123456789123456789"
  },

  handleUserSRPAuthFlow1: {
    ChallengeName: "PASSWORD_VERIFIER",
		ChallengeParameters: {
      USER_ID_FOR_SRP: "xxxxxxxxxxxxxxxx",
      SALT: "xxxxxxxxxxxxxxxx",
      SRP_B: "xxxxxxxxxxxxxxxx",
      SECRET_BLOCK: "xxxxxxxxxxxxxxxx",
    },
		Session: "xxxxxxxxxxxxxxxx",
	},

  handleUserSRPAuthFlow2: {
		AuthenticationResult: authenticationResult,
    ChallengeParameters: {},
  },

  signInResult: {
    isSignedIn: true,
    nextStep: {
      signInStep: "DONE",
    },
	},

  tokens: {
    accessToken: {
      toString: () => "mockAccessTokenString",
      payload: { iat: 1234567890 }
    },
    idToken: {
      toString: () => "mockIdTokenString",
      payload: {}
    },
    refreshToken: "newRefreshToken",
    deviceMetadata: {
      deviceKey: "deviceKey",
      deviceGroupKey: "deviceGroupKey",
      randomPassword: "randomPassword"
    },
    clockDrift: 300,
    username: "testUser",
    signInDetails: {
      loginId: "validId",
      authFlowType: "validAuthFlowType"
    },
  }
};
