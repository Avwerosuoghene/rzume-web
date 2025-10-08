export enum ElementTag {
  SELECT = 'SELECT',
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA'
}

export enum CssClass {
  FORM_FIELD = 'form-field',
  HAS_VALUE = 'has-value'
}

export enum EmptyValue {
  EMPTY_STRING = '',
  NULL_STRING = 'null'
}

export const TIMING = {
  IMMEDIATE_CHECK: 0,
  DELAYED_CHECK: 100,
  BLUR_DELAY: 10
} as const;