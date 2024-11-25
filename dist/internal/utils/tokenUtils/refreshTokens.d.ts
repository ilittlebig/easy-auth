import { TokensType } from '../../../types/auth/internal';
export declare const refreshTokens: ({ tokens, username }: {
    tokens: TokensType;
    username: string;
}) => Promise<TokensType | null>;
