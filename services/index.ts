/**
 * Services index - barrel export
 */
export { apiClient } from './api';
export { getCampusEnumValues } from './campuses';
export { createFoundItem, getFoundItemById, getFoundItems } from './foundItems';
export type { CreateFoundItemPayload } from './foundItems';
export { createLostItem, getLostItemById, getLostItems } from './lostItems';
export type { CreateLostItemPayload } from './lostItems';

