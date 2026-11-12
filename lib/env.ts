import "server-only";

/**
 * Reads an environment variable and stops with a clear message if it is missing.
 * All keys are read on the server only. They never reach the browser.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing environment variable ${name}. Add it to .env.local.`
    );
  }
  return value.trim();
}

export function getOptionalEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
export const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE?.trim() || process.env.APP_PASSCODE?.trim() || "admin123";
