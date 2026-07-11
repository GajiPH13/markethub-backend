import {
  USER_ROLES,
  USER_STATUSES,
  type UserRole,
  type UserStatus,
} from "./user.types.js";

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLES.some((role) => role === value)
  );
}

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === "string" &&
    USER_STATUSES.some((status) => status === value)
  );
}