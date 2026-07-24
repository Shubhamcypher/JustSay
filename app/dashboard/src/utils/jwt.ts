import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  id: string;
  email?: string;
  exp: number;
};

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
}