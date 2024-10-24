declare function BigInteger(a?: string, b?: number): void;
declare namespace BigInteger {
    var ZERO: any;
    var ONE: any;
}
declare function bnToString(b: any): string;
declare function bnNegate(): BigInteger;
declare function bnAbs(): BigInteger;
declare function bnCompareTo(a: any): number;
declare function bnBitLength(): number;
declare function bnMod(a: any): BigInteger;
declare function bnEquals(a: any): boolean;
declare function bnAdd(a: any): BigInteger;
declare function bnSubtract(a: any): BigInteger;
declare function bnMultiply(a: any): BigInteger;
declare function bnDivide(a: any): BigInteger;
declare function bnModPow(e: any, m: any, callback?: any): BigInteger;
declare function bnIsZero(): boolean;
export declare type BigInteger = {
    toString: typeof bnToString;
    negate: typeof bnNegate;
    abs: typeof bnAbs;
    compareTo: typeof bnCompareTo;
    bitLength: typeof bnBitLength;
    mod: typeof bnMod;
    equals: typeof bnEquals;
    add: typeof bnAdd;
    subtract: typeof bnSubtract;
    multiply: typeof bnMultiply;
    divide: typeof bnDivide;
    modPow: typeof bnModPow;
    isZero: typeof bnIsZero;
};
declare const bigInt: (str?: string, radix?: number) => BigInteger;
export default bigInt;
