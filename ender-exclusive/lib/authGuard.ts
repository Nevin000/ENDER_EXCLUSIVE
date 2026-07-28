// /lib/authGuard.ts

export type UserRole = "admin" | "user" | null;

/**
 * Checks if the given role is an admin.
 */
export const isAdminRole = (role: string | null | undefined): boolean => {
  return role === "admin";
};

/**
 * Checks if the given role is a regular user.
 */
export const isUserRole = (role: string | null | undefined): boolean => {
  return role === "user";
};

/**
 * Checks if a pathname is an admin route (/admin/*).
 */
export const isAdminRoute = (pathname: string): boolean => {
  return pathname === "/admin" || pathname.startsWith("/admin/");
};

/**
 * Checks if a pathname is a customer route.
 */
export const isCustomerRoute = (pathname: string): boolean => {
  return !isAdminRoute(pathname);
};

/**
 * Customer account routes that require regular user authorization.
 */
export const CUSTOMER_ACCOUNT_ROUTES = [
  "/cart",
  "/checkout",
  "/checkout-success",
  "/orders",
  "/profile",
  "/wishlist",
];

export const isCustomerAccountRoute = (pathname: string): boolean => {
  return CUSTOMER_ACCOUNT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
};
