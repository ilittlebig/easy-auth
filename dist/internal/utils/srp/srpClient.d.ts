import { BigInteger } from './bigInteger';
export declare class SRPClient {
    private poolName;
    private N;
    private g;
    private k;
    saltToHashDevices: string;
    verifierDevices: string;
    randomPassword: string;
    private smallAValue;
    private largeAValue;
    private UValue;
    constructor(poolName: string);
    /**
     *
     */
    generateRandomSmallA: () => string;
    /**
     *
     */
    calculateA: (a?: string) => string;
    /**
     *
     */
    calculateU: (A: BigInteger, B: BigInteger) => BigInteger;
    /**
     *
     */
    getPasswordAuthenticationKey: (username: string, password: string, serverBValue: string, salt: string) => any;
    /**
     *
     */
    generateHashDevice: (deviceGroupKey: string, username: string) => Promise<unknown>;
}
