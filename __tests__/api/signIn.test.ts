/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */


import {
  describe,
  test,
} from "vitest";
import { EasyAuth } from "../../src/internal/classes";
import { signInWithSRP } from "../../src/api/signInWithSRP";

EasyAuth.configure({
  Auth: {
    Cognito: {
      userPoolId: "eu-central-1_p7kFFrIpB",
      userPoolClientId: "v4c2su1ocb86i3pp9q8s0vjl4",
    }
  },
});

describe("signIn", () => {
  test("should sign in successfully with valid SRP credentials", async () => {
    const result = await signInWithSRP({
      username: "elias@jamee.se",
      password: "Elias0404!!"
    });
    console.log(result);
  });
});
