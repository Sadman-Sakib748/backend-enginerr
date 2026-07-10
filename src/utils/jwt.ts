// utils/jwt.ts (Alternative)
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AppError } from './helpers';

interface TokenPayload {
  id: string;
  role: string;
}

class JWTService {
  private readonly secret: string;
  private readonly signOptions: SignOptions;
  private readonly verifyOptions: VerifyOptions;

  constructor() {
    this.secret = process.env.JWT_SECRET || '';
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    this.signOptions = {
      expiresIn: (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'],
      algorithm: 'HS256',
    } as SignOptions; // Type assertion to fix exactOptionalPropertyTypes

    this.verifyOptions = {
      algorithms: ['HS256'],
    };
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, this.signOptions);
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, this.verifyOptions);
      return decoded as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload | null;
    } catch (error) {
      return null;
    }
  }
}

export const jwtService = new JWTService();