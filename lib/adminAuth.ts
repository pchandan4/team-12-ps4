import { cookies, headers } from "next/headers";
import { ADMIN_PASSCODE } from "./env";
import { hashPasscode } from "./auth";

export const ADMIN_COOKIE = "deskbot_admin";

export async function getExpectedAdminHash(): Promise<string> {
  return hashPasscode(`admin:${ADMIN_PASSCODE}`);
}

/**
 * Checks whether the current request is from an authorized IT Administrator.
 * Supports both Cookie check (UI admin mode) and Authorization/x-admin-passcode header (API/tool check).
 */
export async function isUserAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE)?.value;
  const expected = await getExpectedAdminHash();

  if (adminCookie && adminCookie === expected) {
    return true;
  }

  const headerList = await headers();
  const headerCode = headerList.get("x-admin-passcode");
  if (headerCode && headerCode.trim() === ADMIN_PASSCODE) {
    return true;
  }

  return false;
}

