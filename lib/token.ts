import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
const ttlSeconds = Number(process.env.TOKEN_TTL_SECONDS || "3600");

export type AccessTokenPayload = {
  sessionId: string;
  paid: true;
};

export async function signAccessToken(payload: AccessTokenPayload) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

  if (payload?.paid !== true || typeof payload?.sessionId !== "string") {
    throw new Error("Invalid token payload");
  }

  return payload as unknown as AccessTokenPayload;
}

