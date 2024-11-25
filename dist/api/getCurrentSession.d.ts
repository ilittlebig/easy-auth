import { GetCurrentSessionInput } from '../types/auth/inputs';
export declare const getCurrentSession: (options?: GetCurrentSessionInput) => Promise<{
    tokens: import('../types/auth/internal').TokensType;
    sub: any;
}>;
