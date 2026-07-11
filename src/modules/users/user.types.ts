import type { ObjectId } from "mongodb";
import type {
  AccountStatus,
  BaseDocument,
  UserRole,
} from "../../shared/types/common.types.js";

export interface UserDocument extends BaseDocument {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  status: AccountStatus;
  isBlocked: boolean;
  phone?: string | null;
  address?: string | null;
  sellerProfileId?: ObjectId | null;
}
