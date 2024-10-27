/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */

import type { CognitoResponse } from "../../types/authTypes";

/**
 *
 */

const parseAttributes = (attributes: string): string[] => {
  if (!attributes) return [];
  const attributePrefix = "userAttributes.";

  let parsedAttributes;
  try {
    parsedAttributes = JSON.parse(attributes);
  } catch (error) {
    return [];
  }

  if (!Array.isArray(parsedAttributes)) {
    return [];
  }

  return parsedAttributes.map((attribute: string) =>
    attribute.startsWith(attributePrefix)
      ? attribute.replace(attributePrefix, "")
      : attribute
  );
};

/**
 * Handler
 */

export default (challengeParameters: CognitoResponse) => ({
  isSignedIn: false,
  nextStep: {
    signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
    missingAttributes: parseAttributes(challengeParameters.requiredAttributes),
  }
})
