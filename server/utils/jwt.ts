import jwt from 'jsonwebtoken';
import { useRuntimeConfig } from '#imports';

interface TokenPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const config = useRuntimeConfig();
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h'
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const config = useRuntimeConfig();
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}; 