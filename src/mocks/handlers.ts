import { authHandlers } from "./auth/handlers";
import { itemHandlers } from "./items/handlers";

export const handlers = [
  ...authHandlers,
  ...itemHandlers,
];