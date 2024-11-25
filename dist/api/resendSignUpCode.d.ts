import { AuthCodeDeliveryDetails, ResendSignUpCodeInput } from '../types/auth';
export declare const resendSignUpCode: (input: ResendSignUpCodeInput) => Promise<AuthCodeDeliveryDetails>;
