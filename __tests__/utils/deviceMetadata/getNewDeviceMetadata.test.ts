/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-25
 */

import { ConfirmDeviceCommand } from "@aws-sdk/client-cognito-identity-provider";
import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { getNewDeviceMetatada } from "../../../src/internal/utils/deviceMetadataUtils";
import { SRPClient } from "../../../src/internal/utils/srp/srpClient";

const mocks = vi.hoisted(() => ({
  send: vi.fn()
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", async () => {
  const originalModule = await import("@aws-sdk/client-cognito-identity-provider");

  return {
    ...originalModule,
    CognitoIdentityProviderClient: vi.fn().mockReturnValue({
      send: mocks.send,
    }),
    ConfirmDeviceCommand: vi.fn(),
  };
});

vi.mock("../../../src/internal/utils/srp/srpClient", () => ({
  SRPClient: vi.fn().mockImplementation(() => ({
    generateHashDevice: vi.fn(),
    saltToHashDevices: "mocked-salt",
    verifierDevices: "mocked-verifier",
    randomPassword: "mocked-random-password",
  })),
}));

vi.mock("../../../src/internal/utils/regionUtils", () => ({
  getRegion: vi.fn().mockReturnValue("mocked-region"),
  getUserPoolName: vi.fn().mockReturnValue("mocked-user-pool"),
}));

describe("getNewDeviceMetadata", () => {
  beforeEach(() => {
    mocks.send.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should return undefined if newDeviceMetadata is not provided", async () => {
    const result = await getNewDeviceMetatada("mocked-user-pool-id");
    expect(result).toBeUndefined();
  });

  test("should return device metadata on success", async () => {
    const result = await getNewDeviceMetatada("mocked-user-pool-id", {
      DeviceKey: "mocked-device-key",
      DeviceGroupKey: "mocked-device-group-key",
    }, "mocked-access-token");

    expect(result).toEqual({
      deviceKey: "mocked-device-key",
      deviceGroupKey: "mocked-device-group-key",
      randomPassword: "mocked-random-password",
    });

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(ConfirmDeviceCommand).toHaveBeenCalledWith({
      AccessToken: "mocked-access-token",
      DeviceKey: "mocked-device-key",
      DeviceSecretVerifierConfig: {
        Salt: "AAAAAAAA",
        PasswordVerifier: "AAAAAAAAAA==",
      },
    });
  });

  test("should return undefined if SRPClient throws an error", async () => {
    (SRPClient as Mock).mockImplementationOnce(() => new Error("SRP error"));

    const result = await getNewDeviceMetatada("mocked-user-pool-id", {
      DeviceKey: "mocked-device-key",
      DeviceGroupKey: "mocked-device-group-key",
    });

    expect(result).toBeUndefined();
  });

  test("should return undefined if Cognito client throws an error", async () => {
    mocks.send.mockImplementationOnce(() => {
      throw new Error("Cognito error")
    });

    const result = await getNewDeviceMetatada("mocked-user-pool-id", {
      DeviceKey: "mocked-device-key",
      DeviceGroupKey: "mocked-device-group-key",
    }, "mocked-access-token");

    expect(result).toBeUndefined();
  });

  test("should handle undefined DeviceKey and DeviceGroupKey", async () => {
    const result = await getNewDeviceMetatada("mocked-user-pool-id", {
      // DeviceKey and DeviceGroupKey are undefined
    }, "mocked-access-token");

    expect(result).toEqual({
      deviceKey: "",
      deviceGroupKey: "",
      randomPassword: "mocked-random-password",
    });

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(ConfirmDeviceCommand).toHaveBeenCalledWith({
      AccessToken: "mocked-access-token",
      DeviceKey: "",
      DeviceSecretVerifierConfig: {
        Salt: "AAAAAAAA",
        PasswordVerifier: "AAAAAAAAAA==",
      },
    });
  });
});
