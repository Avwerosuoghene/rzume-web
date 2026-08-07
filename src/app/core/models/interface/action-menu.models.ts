import { ActionType } from '../constants/action-menu.constants';

export type ActionMenuVariant = 'icons' | 'menu';

export interface ActionMenuItem {
  key: ActionType;
  // Optional — defaults to ACTION_TYPE_LABEL_MAP[key] (see action-menu.constants.ts) when omitted.
  // Override only when a more specific wording is needed than the generic per-type default.
  label?: string;
  callback: () => void;
}
