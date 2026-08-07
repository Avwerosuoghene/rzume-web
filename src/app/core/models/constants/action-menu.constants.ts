// view/download/rename/delete sourced from Figma "Parent action modal" (node 1314:2597, file
// KoCnQn3cT8mZ5Yi75bhxOJ); edit/changeStatus/addDocument added by the user directly — see
// plan-action-menu-component.md's 2026-08-07 addendum for provenance. changeStatus has no
// dedicated icon — it reuses edit's.
export const ACTION_TYPES = {
  VIEW: 'view',
  DOWNLOAD: 'download',
  RENAME: 'rename',
  DELETE: 'delete',
  EDIT: 'edit',
  CHANGE_STATUS: 'changeStatus',
  ADD_DOCUMENT: 'addDocument'
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

export const ACTION_TYPE_ICON_MAP: Record<ActionType, string> = {
  [ACTION_TYPES.VIEW]: '/assets/icons/actions/view.svg',
  [ACTION_TYPES.DOWNLOAD]: '/assets/icons/actions/download.svg',
  [ACTION_TYPES.RENAME]: '/assets/icons/actions/rename.svg',
  [ACTION_TYPES.DELETE]: '/assets/icons/actions/delete.svg',
  [ACTION_TYPES.EDIT]: '/assets/icons/actions/edit.svg',
  [ACTION_TYPES.CHANGE_STATUS]: '/assets/icons/actions/edit.svg',
  [ACTION_TYPES.ADD_DOCUMENT]: '/assets/icons/actions/add-document.svg'
};

// Default label per action type — a caller only needs to override ActionMenuItem.label when it
// wants more specific wording than this (e.g. "Download document" instead of "Download").
export const ACTION_TYPE_LABEL_MAP: Record<ActionType, string> = {
  [ACTION_TYPES.VIEW]: 'View',
  [ACTION_TYPES.DOWNLOAD]: 'Download',
  [ACTION_TYPES.RENAME]: 'Rename',
  [ACTION_TYPES.DELETE]: 'Delete',
  [ACTION_TYPES.EDIT]: 'Edit',
  [ACTION_TYPES.CHANGE_STATUS]: 'Change Status',
  [ACTION_TYPES.ADD_DOCUMENT]: 'Add Document'
};
