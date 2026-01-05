import { 
  FormInputConfig, 
  FormInputSelectConfig, 
  FormInputDateConfig 
} from '../models/interface/form-input.interface';
import { FormInputType } from '../models/enums/form-input.enums';
import { SelectOption } from '../models/interface/form-input.interface';

interface BaseConfigOptions {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  rows?: number;
  showPasswordToggle?: boolean;
}

export class FormInputConfigHelper {
  
  private static createBaseConfig(
    type: FormInputType,
    options: BaseConfigOptions,
    defaultPlaceholder: string,
    defaultRequired: boolean = false
  ): FormInputConfig {
    return {
      id: options.id,
      label: options.label,
      type,
      placeholder: options.placeholder ?? defaultPlaceholder,
      required: options.required ?? defaultRequired,
      disabled: options.disabled ?? false,
      readonly: options.readonly,
      maxLength: options.maxLength,
      minLength: options.minLength,
      pattern: options.pattern,
      rows: options.rows,
      showPasswordToggle: options.showPasswordToggle
    };
  }

  static email(options: Omit<BaseConfigOptions, 'rows'>): FormInputConfig {
    return this.createBaseConfig(FormInputType.EMAIL, options, 'Enter your email', true);
  }

  static password(options: Omit<BaseConfigOptions, 'rows'>): FormInputConfig {
    return this.createBaseConfig(FormInputType.PASSWORD, options, 'Enter your password', true);
  }

  static text(options: BaseConfigOptions): FormInputConfig {
    return this.createBaseConfig(
      FormInputType.TEXT, 
      options, 
      `Enter ${options.label.toLowerCase()}`
    );
  }

  static url(options: Omit<BaseConfigOptions, 'rows'>): FormInputConfig {
    return this.createBaseConfig(FormInputType.URL, options, 'Enter URL');
  }

  static number(options: Omit<BaseConfigOptions, 'rows'>): FormInputConfig {
    return this.createBaseConfig(FormInputType.NUMBER, options, 'Enter number');
  }

  static tel(options: Omit<BaseConfigOptions, 'rows'>): FormInputConfig {
    return this.createBaseConfig(FormInputType.TEL, options, 'Enter phone number');
  }

  static textarea(options: BaseConfigOptions): FormInputConfig {
    return this.createBaseConfig(
      FormInputType.TEXTAREA, 
      options, 
      `Enter ${options.label.toLowerCase()}`
    );
  }

  static select(options: {
    id: string;
    label: string;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
  }): FormInputSelectConfig {
    return {
      id: options.id,
      label: options.label,
      type: FormInputType.SELECT,
      options: options.options,
      placeholder: options.placeholder,
      required: options.required ?? false,
      disabled: options.disabled ?? false
    };
  }

  static date(options: {
    id: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    min?: Date;
    max?: Date;
  }): FormInputDateConfig {
    return {
      id: options.id,
      label: options.label,
      type: FormInputType.DATE,
      placeholder: options.placeholder ?? 'Select date',
      required: options.required ?? false,
      disabled: options.disabled ?? false,
      min: options.min,
      max: options.max
    };
  }
}
