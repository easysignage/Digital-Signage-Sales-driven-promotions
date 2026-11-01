// Settings come from .env (see .env.example). Missing or bad values stop the app at startup
// rather than surfacing later as confusing API errors.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the real environment.
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return value;
}

function number(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number, got "${raw}".`);
  return value;
}

// Media and display tags are stored lower-cased by the API, so address them that way.
const tag = (name: string, fallback: string) => (process.env[name]?.trim() || fallback).toLowerCase();

export const config = {
  apiKey: required("EASYSIGNAGE_API_KEY"),
  baseURL: process.env.EASYSIGNAGE_BASE_URL?.trim() || undefined,
  promoTag: tag("PROMO_TAG", "promo"),
  screenTag: tag("SCREEN_TAG", "automation"),
  threshold: number("THRESHOLD", 100),
  port: number("PORT", 3000),
};
