/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-24
 */

import sjcl from "sjcl-aws";
import type { BigInteger } from "./bigInteger";

const WEEK_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INFO_BITS = "Caldera Derived Key";
const PAD_HEX_STRING = "89ABCDEFabcdef";

// Helper function to pad time with 0
const padTime = (time: number) => time < 10 ? `0${time}` : time;

/**
 *
 */

export const getNowString = () => {
  const now = new Date();
  const weekDay = WEEK_NAMES[now.getUTCDay()];
  const month = MONTH_NAMES[now.getUTCMonth()];
  const day = now.getUTCDate();

  const hours = padTime(now.getUTCHours());
  const minutes = padTime(now.getUTCMinutes());
  const seconds = padTime(now.getUTCSeconds());
  const year = now.getUTCFullYear();

  // ddd MMM D HH:mm:ss UTC YYYY
  const dateNow = `${weekDay} ${month} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`;
  return dateNow;
};

/**
 *
 */

export const calculateSignature = (hkdf: string, userPoolId: string, username: string, secretBlock: string, dateNow: string) => {
  // TODO: remove try catch
  try {
    const mac = new sjcl.misc.hmac(hkdf);
    mac.update(sjcl.codec.utf8String.toBits(userPoolId));
    mac.update(sjcl.codec.utf8String.toBits(username));
    mac.update(sjcl.codec.base64.toBits(secretBlock));
    mac.update(sjcl.codec.utf8String.toBits(dateNow));
    return sjcl.codec.base64.fromBits(mac.digest());
  } catch (err: any) {
    throw new Error("Failed to calculate signature due to invalid input.");
  }
};

/**
 *
 */

export const padHex = (bigInt: BigInteger) => {
  let hashStr = bigInt.toString(16);
  const remainder = hashStr.length % 2;
  const indexOf = PAD_HEX_STRING.indexOf(hashStr[0])

  if (remainder === 1) hashStr = `0${hashStr}`;
  else if (indexOf !== -1) hashStr = `00${hashStr}`;
  return hashStr;
};

/**
 *
 */

export const hash = (str: string) => {
  const hashHex = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(str)
  );
  return `${new Array(64 - hashHex.length).join("0")}${hashHex}`;
};

/**
 *
 */

export const hexHash = (str: string) => hash(
  sjcl.codec.hex.toBits(str)
);

/**
 *
 */

export const computehkdf = (ikm: string, salt: string) =>
  sjcl.misc.hkdf(
    sjcl.codec.hex.toBits(ikm),
    128,
    sjcl.codec.hex.toBits(salt),
    INFO_BITS
  );

/**
 *
 */

export const getRandomBytes = (numBytes: number) => {
  const roundedBytes = Math.ceil(numBytes / 4);
  return sjcl.random.randomWords(roundedBytes, 0);
};

/**
 *
 */

export const getRandomString = () => {
  const randomBytes = getRandomBytes(40);
  return sjcl.codec.base64.fromBits(randomBytes);
}

/**
 *
 */

export const getHexFromBytes = (bytes: number) => {
  return sjcl.codec.hex.fromBits(bytes);
};

/**
 *
 */

export const getHashFromHex = (hex: string) => {
  const bitArray = sjcl.codec.hex.toBits(hex);
  const hashBitArray = sjcl.hash.sha256.hash(bitArray);
  const hashHex = sjcl.codec.hex.fromBits(hashBitArray);
  return hashHex;
};

/**
 *
 */

export const convertHexToBase64 = (hex: string) => {
  const bitArray = sjcl.codec.hex.toBits(hex);
  const base64String = sjcl.codec.base64.fromBits(bitArray);
  return base64String;
};
