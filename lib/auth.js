import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  if (secret === "fallback-secret-do-not-use-in-production") {
    throw new Error("JWT_SECRET is set to the insecure default. Generate a real secret: openssl rand -base64 64");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters. Generate a strong secret: openssl rand -base64 64");
  }
  return new TextEncoder().encode(secret);
}

const JWT_ISSUER = "pandharpur-wari-seva";
const JWT_AUDIENCE = "pandharpur-wari-admin";
const TOKEN_EXPIRY = "24h";
const COOKIE_NAME = "session";

export async function createToken(payload) {
  const secret = getSecret();
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
  return token;
}

export async function verifyToken(token) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(maxAge = 86400) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export { COOKIE_NAME };
