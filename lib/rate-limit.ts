import { prisma } from "./prisma";

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const now = new Date();

  const existing = await prisma.rateLimitEntry.findUnique({ where: { key } });

  if (!existing) {
    await prisma.rateLimitEntry.create({
      data: { key, count: 1, windowStart: now },
    });
    return { allowed: true };
  }

  const windowAge = now.getTime() - existing.windowStart.getTime();

  if (windowAge > windowMs) {
    // Window expired, reset
    await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: 1, windowStart: now },
    });
    return { allowed: true };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((windowMs - windowAge) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  await prisma.rateLimitEntry.update({
    where: { key },
    data: { count: existing.count + 1 },
  });

  return { allowed: true };
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}