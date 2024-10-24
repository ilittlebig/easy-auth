/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-24
 */

import sjcl from "sjcl-aws";
import {
  padHex,
  hexHash,
  hash,
  computehkdf,
  getRandomString,
  getRandomBytes,
  getHexFromBytes,
  getHashFromHex,
} from "./utils";
import bigInt, { type BigInteger } from "./bigInteger";

const INIT_N = "" +
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
  "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
  "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
  "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D" +
  "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F" +
  "83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
  "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B" +
  "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9" +
  "DE2BCBF6955817183995497CEA956AE515D2261898FA0510" +
  "15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64" +
  "ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7" +
  "ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B" +
  "F12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
  "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31" +
  "43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF";

export class SRPClient {
  private poolName: string;

  private N: BigInteger;
  private g: BigInteger;
  private k: BigInteger;

  public saltToHashDevices: string;
  public verifierDevices: string;
  public randomPassword: string;

  private smallAValue: BigInteger | undefined;
  private largeAValue: BigInteger | undefined;
  private UValue: BigInteger | undefined;

  constructor(poolName: string) {
    this.poolName = poolName;

    this.N = bigInt(INIT_N, 16);
    this.g = bigInt("2", 16);
    this.k = bigInt(
      hexHash(`00${this.N.toString(16)}0${this.g.toString(16)}`),
      16
    );

    this.saltToHashDevices = "";
    this.verifierDevices = "";
    this.randomPassword = "";
  }

  /**
   *
   */

  generateRandomSmallA = () => {
    this.smallAValue = bigInt(
      sjcl.codec.hex.fromBits(sjcl.random.randomWords(8, 0)),
      16
    ).mod(this.N);

    if (!this.smallAValue) throw new Error("Failed to generate smallAValue");
    return this.smallAValue.toString(16);
  };

  /**
   *
   */

  calculateA = (a = this.generateRandomSmallA()) => {
    this.largeAValue = this.g.modPow(bigInt(a, 16), this.N);

    const isAModNZero = this.largeAValue
      .mod(this.N)
      .isZero();

    if (isAModNZero) throw new Error("Illegal parameter. A mod N cannot be 0.");
    return this.largeAValue.toString(16);
  };

  /**
   *
   */

  calculateU = (A: BigInteger, B: BigInteger) => bigInt(
    hexHash(`${padHex(A)}${padHex(B)}`),
    16
  );

  /**
   *
   */

  getPasswordAuthenticationKey = (username: string, password: string, serverBValue: string, salt: string) => {
    let _serverBValue = bigInt(serverBValue, 16);
    let _salt = bigInt(salt, 16);

    const isBModNZero = _serverBValue.mod(this.N).isZero();
    if (isBModNZero) throw new Error("B cannot be zero.");

    if (!this.largeAValue) throw new Error("largeAValue is undefined");

    this.UValue = this.calculateU(
      this.largeAValue,
      _serverBValue
    );

    const isUValueZero = this.UValue.isZero();
    if (isUValueZero) throw new Error("U cannot be zero.");

    const usernamePassword = `${this.poolName}${username}:${password}`;
    const usernamePasswordHash = hash(usernamePassword);

    const hexHashString = `${padHex(_salt)}${usernamePasswordHash}`;
    const xValue = bigInt(hexHash(hexHashString), 16);

    const gModPowXN = this.g.modPow(xValue, this.N);
    const intValue2 = _serverBValue.subtract(
      this.k.multiply(gModPowXN)
    );

    if (!this.smallAValue) throw new Error("smallAValue is undefined");

    const UValueMulX = this.UValue.multiply(xValue);
    const sValue = intValue2.modPow(
      this.smallAValue.add(UValueMulX),
      this.N
    ).mod(this.N);

    const hkdf = computehkdf(
      padHex(sValue),
      padHex(this.UValue)
    );
    return hkdf;
  };

  /**
   *
   */

  generateHashDevice = (deviceGroupKey: string, username: string) => {
    this.randomPassword = getRandomString();
    const combinedString = `${deviceGroupKey}${username}:${this.randomPassword}`;
    const hashedString = hash(combinedString)

    const randomBytes = getRandomBytes(16);
    const hexRandom = getHexFromBytes(randomBytes);

    this.saltToHashDevices = padHex(
      bigInt(hexRandom, 16)
    );

    return new Promise((_, reject) => {
      (async () => {
        try {
          const exponentHex = getHashFromHex(this.saltToHashDevices + hashedString);
          const exponent = bigInt(exponentHex, 16);

          const result = this.g.modPow(exponent, this.N);
          this.verifierDevices = padHex(result);
        } catch (error) {
          reject(error);
        }
      })();
		});
  }
}
