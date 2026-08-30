const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_MAX_AGE = 86400;

function generateToken() {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function validateCsrfRequest(request) {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}

export function setCsrfCookie(response) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(CSRF_COOKIE, generateToken(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_MAX_AGE,
  });
}

export function clearCsrfCookie(response) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(CSRF_COOKIE, "", {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export { CSRF_COOKIE, CSRF_HEADER };
