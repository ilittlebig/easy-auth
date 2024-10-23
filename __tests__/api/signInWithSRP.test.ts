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
import { AuthBuddy } from "../../src/internal/classes";
import { signIn, confirmSignIn } from "../../src/api";

describe("signInWithSRP", () => {
  test("test", async () => {
    AuthBuddy.configure({
      Auth: {
        Cognito: {
          userPoolId: "eu-central-1_p7kFFrIpB",
          userPoolClientId: "v4c2su1ocb86i3pp9q8s0vjl4",
        }
      },
    });
    const a = await signIn({ username: "elias@jamee.se", password: "Elias0404!!" });
    console.log(a);
    const b = await confirmSignIn({ challengeResponse: "Elias0404!!" });
    console.log(b);
  });
});
