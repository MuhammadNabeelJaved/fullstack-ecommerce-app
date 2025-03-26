import { Document } from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    avatar: string;
    refreshToken?: string;
    isAccountVerified: boolean;
    verificationCode: string | null;
    verificationCodeExpires: Date | null;
    cart: any[];
    genrateVerificationCode(): Promise<string>;
    isPasswordCorrect(password: string): Promise<boolean>;
    isVerificationCodeCorrect(code: string): Promise<boolean>;
    isVerificationCodeExpired(): Promise<boolean>;
    genrateAccessToken(): Promise<string>;
    genrateRefreshToken(): Promise<string>;
}

export default IUser; 