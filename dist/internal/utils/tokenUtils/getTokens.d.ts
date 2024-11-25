import { TokensType } from '../../../types/auth/internal';
import { GetCurrentSessionInput } from '../../../types/auth';
export declare const getTokens: (options?: GetCurrentSessionInput) => Promise<TokensType | null>;
