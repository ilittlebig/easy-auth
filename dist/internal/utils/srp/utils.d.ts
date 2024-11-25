import { BigInteger } from './bigInteger';
/**
 *
 */
export declare const getNowString: () => string;
/**
 *
 */
export declare const calculateSignature: (hkdf: string, userPoolId: string, username: string, secretBlock: string, dateNow: string) => any;
/**
 *
 */
export declare const padHex: (bigInt: BigInteger) => string;
/**
 *
 */
export declare const hash: (str: string) => string;
/**
 *
 */
export declare const hexHash: (str: string) => string;
/**
 *
 */
export declare const computehkdf: (ikm: string, salt: string) => any;
/**
 *
 */
export declare const getRandomBytes: (numBytes: number) => any;
/**
 *
 */
export declare const getRandomString: () => any;
/**
 *
 */
export declare const getHexFromBytes: (bytes: number) => any;
/**
 *
 */
export declare const getHashFromHex: (hex: string) => any;
/**
 *
 */
export declare const convertHexToBase64: (hex: string) => any;
