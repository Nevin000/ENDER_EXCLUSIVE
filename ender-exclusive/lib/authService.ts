/**
 * lib/authService.ts
 *
 * Unified Authentication Service - Single source of truth for role & status validation.
 * All login flows MUST call validateUserAccess() before granting session.
 *
 * Enforces:
 *  - role: "admin" | "user"
 *  - status: "active" (suspended accounts are blocked)
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// ─── Types ────────────────────────────────────────────────

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "suspended" | "banned";

export interface UserRecord {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
}

export interface ValidationResult {
  valid: boolean;
  record: UserRecord | null;
  error: ValidationError | null;
}

export type ValidationError =
  | "USER_NOT_FOUND"
  | "WRONG_ROLE"
  | "ACCOUNT_SUSPENDED"
  | "FIRESTORE_ERROR";

// ─── Core Validation Function ─────────────────────────────

/**
 * Fetches Firestore user document and validates role AND status.
 *
 * @param uid - Firebase Auth UID
 * @param expectedRole - "admin" | "user"
 * @returns ValidationResult with record and any error
 */
export async function validateUserAccess(
  uid: string,
  expectedRole: UserRole
): Promise<ValidationResult> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { valid: false, record: null, error: "USER_NOT_FOUND" };
    }

    const data = userSnap.data() as UserRecord;

    // Validate status first
    if (data.status && data.status !== "active") {
      return { valid: false, record: data, error: "ACCOUNT_SUSPENDED" };
    }

    // Validate role
    if (data.role !== expectedRole) {
      return { valid: false, record: data, error: "WRONG_ROLE" };
    }

    return { valid: true, record: data, error: null };
  } catch (err) {
    console.error("[AuthService] Firestore validation error:", err);
    return { valid: false, record: null, error: "FIRESTORE_ERROR" };
  }
}

/**
 * Fetches Firestore user document without role validation.
 * Used by AuthContext to determine current user role & status.
 */
export async function fetchUserRecord(uid: string): Promise<UserRecord | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    return userSnap.data() as UserRecord;
  } catch (err) {
    console.error("[AuthService] fetchUserRecord error:", err);
    return null;
  }
}

// ─── Error Message Helpers ────────────────────────────────

export function getCustomerLoginError(error: ValidationError, role?: UserRole): string {
  switch (error) {
    case "WRONG_ROLE":
      // ⚠️ Security: Do NOT reveal that this is an admin account.
      // Return a generic invalid credentials message to prevent role enumeration.
      return "Invalid email or password. Please try again.";
    case "ACCOUNT_SUSPENDED":
      return "Your account has been suspended. Please contact support.";
    case "USER_NOT_FOUND":
      // ⚠️ Security: Do NOT reveal whether the account exists or not.
      return "Invalid email or password. Please try again.";
    case "FIRESTORE_ERROR":
      return "Unable to verify account. Please try again.";
    default:
      return "Authentication failed. Please try again.";
  }
}

export function getAdminLoginError(error: ValidationError, role?: UserRole): string {
  switch (error) {
    case "WRONG_ROLE":
      return "This account does not have administrator privileges.";
    case "ACCOUNT_SUSPENDED":
      return "This admin account has been suspended. Please contact the system owner.";
    case "USER_NOT_FOUND":
      return "Admin account not found in the system.";
    case "FIRESTORE_ERROR":
      return "Unable to verify admin credentials. Please try again.";
    default:
      return "Admin authentication failed. Please try again.";
  }
}

// ─── Route Classification Helpers ────────────────────────

export const ADMIN_ROUTES = ["/admin"];
export const CUSTOMER_ACCOUNT_ROUTES = [
  "/cart",
  "/checkout",
  "/checkout-success",
  "/orders",
  "/profile",
  "/wishlist",
];

export const isAdminRoute = (pathname: string): boolean =>
  pathname === "/admin" || pathname.startsWith("/admin/");

export const isCustomerAccountRoute = (pathname: string): boolean =>
  CUSTOMER_ACCOUNT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
