import { FormInputType, FormInputSize } from '../enums/form-input.enums';

export interface FormInputConfig {
  id: string;
  label: string;
  type: FormInputType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  size?: FormInputSize;
  rows?: number; // For textarea
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  errorMessages?: Record<string, string>;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormInputSelectConfig extends FormInputConfig {
  options: SelectOption[];
  multiple?: boolean;
}

export interface FormInputDateConfig extends FormInputConfig {
  min?: Date;
  max?: Date;
}
