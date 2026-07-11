import type { BaseDocument } from "../../shared/types/common.types.js";
export interface CategoryDocument extends BaseDocument {
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
}
