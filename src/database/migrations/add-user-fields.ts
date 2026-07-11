import { getDatabase } from "../mongodb.js";

export async function addMissingUserFields(): Promise<void> {
  const users = getDatabase().collection("users");

  const roleResult = await users.updateMany(
    { role: { $exists: false } },
    { $set: { role: "customer" } },
  );

  const statusResult = await users.updateMany(
    { status: { $exists: false } },
    { $set: { status: "active" } },
  );

  const blockedResult = await users.updateMany(
    { isBlocked: { $exists: false } },
    { $set: { isBlocked: false } },
  );

  console.log("User-field migration completed.", {
    rolesUpdated: roleResult.modifiedCount,
    statusesUpdated: statusResult.modifiedCount,
    blockedFlagsUpdated: blockedResult.modifiedCount,
  });
}