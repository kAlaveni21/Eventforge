import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'eventforge_jwt_secret_key_2026_super_secure';
  return jwt.sign({ userId, role }, secret, {
    expiresIn: '30d',
  });
};
