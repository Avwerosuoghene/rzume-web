import { Component, Input, forwardRef, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { FloatingLabelDirective } from '../../core/directives';
import { 
  FormInputConfig, 
  SelectOption, 
  FormInputSelectConfig, 
  FormInputDateConfig 
} from '../../core/models/interface/form-input.interface';
import { FormInputType } from '../../core/models/enums/form-input.enums';
import { DEFAULT_ERROR_MESSAGES, FORM_INPUT_DEFAULTS } from '../../core/models/constants/form-input.constants';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModules,
    FloatingLabelDirective
  ],
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  constructor(private cdr: ChangeDetectorRef) {}
  @Input() config!: FormInputConfig;
  @Input() control?: AbstractControl | null;

  value: any = '';
  disabled = false;
  touched = false;

  readonly FormInputType = FormInputType;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.validateConfig();
  }

  ngAfterViewInit(): void {
    this.setupControlValueSync();
    this.cdr.detectChanges();
  }

  private setupControlValueSync(): void {
    if (!this.control) return;
    this.syncInitialValueFromControl();
    this.subscribeToControlChanges();
  }

  private syncInitialValueFromControl(): void {
    const initialValue = this.control?.value;
    const hasInitialValue = initialValue !== null && initialValue !== undefined && initialValue !== '';
    if (hasInitialValue) {
      this.value = initialValue;
      // Trigger change detection to update the DOM and floating label
      setTimeout(() => this.cdr.detectChanges(), 0);
    }
  }

  private subscribeToControlChanges(): void {
    this.control?.valueChanges?.subscribe(value => {
      if (value !== this.value) {
        this.value = value;
      }
    });
  }

  get selectConfig(): FormInputSelectConfig {
    return this.config as FormInputSelectConfig;
  }

  get dateConfig(): FormInputDateConfig {
    return this.config as FormInputDateConfig;
  }

  get isSelect(): boolean {
    return this.config.type === FormInputType.SELECT;
  }

  get isTextarea(): boolean {
    return this.config.type === FormInputType.TEXTAREA;
  }

  get isDate(): boolean {
    return this.config.type === FormInputType.DATE;
  }

  get textareaRows(): number {
    return this.config.rows || FORM_INPUT_DEFAULTS.ROWS_DEFAULT;
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors || !this.control.touched) {
      return '';
    }

    const errors = this.control.errors;
    const errorKey = Object.keys(errors)[0];

    if (this.config.errorMessages && this.config.errorMessages[errorKey]) {
      return this.config.errorMessages[errorKey];
    }

    return DEFAULT_ERROR_MESSAGES[errorKey] || 'Invalid input';
  }

  get hasError(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(event: Event | any): void {
    let newValue: any;
    
    // Handle Material datepicker event
    if (event.value !== undefined) {
      newValue = event.value;
    } else {
      // Handle regular input/select/textarea events
      const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      newValue = target.value;
    }
    
    this.value = newValue;
    
    // Update parent control if it exists
    if (this.control) {
      this.control.setValue(newValue);
      this.control.markAsDirty();
    }
    
    this.onChange(this.value);
    this.markAsTouched();
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  private validateConfig(): void {
    if (!this.config) {
      throw new Error('FormInputComponent: config is required');
    }
    if (!this.config.id) {
      throw new Error('FormInputComponent: config.id is required');
    }
    if (!this.config.label) {
      throw new Error('FormInputComponent: config.label is required');
    }
    if (!this.config.type) {
      throw new Error('FormInputComponent: config.type is required');
    }
  }
}
