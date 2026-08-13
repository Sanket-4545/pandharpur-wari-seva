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
const JWT_AUDIENCE = "pandharpur-wari-volunteer";
const TOKEN_EXPIRY = "24h";
const VOLUNTEER_COOKIE_NAME = "vol_session";

export async function createVolunteerToken(payload) {
  const secret = getSecret();
  const token = await new SignJWT({
    volunteerId: payload.volunteerId,
    email: payload.email,
    name: payload.name,
    type: "volunteer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
  return token;
}

export async function verifyVolunteerToken(token) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (payload.type !== "volunteer") return null;
    return {
      volunteerId: payload.volunteerId,
      email: payload.email,
      name: payload.name,
      type: payload.type,
    };
  } catch (error) {
    console.error("[VOLUNTEER JWT VERIFY ERROR]", error);
    return null;
  }
}

export function getVolunteerSessionCookieOptions(maxAge = 86400) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: VOLUNTEER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export { VOLUNTEER_COOKIE_NAME };
