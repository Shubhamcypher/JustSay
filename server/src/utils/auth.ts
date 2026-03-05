import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

const SALT_ROUNDS = 10;

const accessExpiresIn: SignOptions["expiresIn"] =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";

const refreshExpiresIn: SignOptions["expiresIn"] =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";


// =====================
// PASSWORD
// =====================
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}




// =====================
// ACCESS TOKEN
// =====================
export function generateAccessToken(payload: object) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET missing");

  return jwt.sign(payload, secret, { expiresIn: accessExpiresIn });
}

// =====================
// REFRESH TOKEN
// =====================
export function generateRefreshToken(payload: object) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET missing");

  return jwt.sign(payload, secret, { expiresIn: refreshExpiresIn });
}

// =====================
// VERIFY TOKENS
// =====================
export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
}
