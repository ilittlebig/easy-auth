/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-30
 */

import {
  CognitoIdentityProviderClient,
  SetUserMFAPreferenceCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EasyAuth } from "../internal/classes";
import { validateAuthTokens } from "../internal/utils/errorUtils";
import { getRegion } from "../internal/utils/regionUtils";
import { getTokens } from "../internal/utils/tokenUtils";
import type { AuthMFAPreference, UpdateMFAPreferenceInput, CognitoMFASettings } from "../types/auth";

const getMFASettings = (mfaPreference?: AuthMFAPreference): CognitoMFASettings | undefined => {
  if (mfaPreference === "ENABLED") {
    return {
      Enabled: true,
    };
  } else if (mfaPreference === "DISABLED") {
    return {
      Enabled: false,
    };
  } else if (mfaPreference === "PREFERRED") {
    return {
      Enabled: true,
      PreferredMfa: true,
    };
  } else if (mfaPreference === "NOT_PREFERRED") {
    return {
      Enabled: true,
      PreferredMfa: false,
    };
  }
}

export const updateMFAPreference = async (input: UpdateMFAPreferenceInput) => {
  const { sms, totp } = input;
  const tokens = await getTokens();
	validateAuthTokens(tokens);

  const cognitoConfig = EasyAuth.getConfig().Auth.Cognito;
  const { userPoolId } = cognitoConfig;
  const region = getRegion(userPoolId);

  const client = new CognitoIdentityProviderClient({ region });
  const setUserMFAPreferenceCommand = new SetUserMFAPreferenceCommand({
    AccessToken: tokens.accessToken.toString(),
    SoftwareTokenMfaSettings: getMFASettings(totp),
    SMSMfaSettings: getMFASettings(sms),
  });

  await client.send(setUserMFAPreferenceCommand);
}
