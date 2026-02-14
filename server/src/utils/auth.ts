import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(payload: object) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expires = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined yet");
  }

  const options: SignOptions = {
    expiresIn: expires as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}
