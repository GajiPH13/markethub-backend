import type { ObjectId } from "mongodb";
import type {
  BaseDocument,
  NotificationType,
} from "../../shared/types/common.types.js";
export interface NotificationDocument extends BaseDocument {
  recipientId: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedResourceId?: ObjectId | null;
  relatedResourceType?: string | null;
  isRead: boolean;
  readAt?: Date | null;
}
