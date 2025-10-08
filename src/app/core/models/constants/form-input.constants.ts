import { FormInputType } from '../enums/form-input.enums';

export const FORM_INPUT_DEFAULTS = {
  PLACEHOLDER_PREFIX: 'Enter',
  ROWS_DEFAULT: 3,
  ROWS_MIN: 2,
  ROWS_MAX: 10
} as const;

export const INPUT_TYPE_ICONS: Record<FormInputType, string> = {
  [FormInputType.TEXT]: 'text_fields',
  [FormInputType.EMAIL]: 'email',
  [FormInputType.PASSWORD]: 'lock',
  [FormInputType.URL]: 'link',
  [FormInputType.TEL]: 'phone',
  [FormInputType.NUMBER]: 'numbers',
  [FormInputType.DATE]: 'calendar_today',
  [FormInputType.TEXTAREA]: 'note',
  [FormInputType.SELECT]: 'arrow_drop_down'
};

export const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minlength: 'Input is too short',
  maxlength: 'Input is too long',
  pattern: 'Invalid format',
  min: 'Value is too low',
  max: 'Value is too high'
};
