import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormInputComponent } from './form-input.component';
import { FormInputConfig, FormInputSelectConfig } from '../../core/models/interface/form-input.interface';
import { FormInputType } from '../../core/models/enums/form-input.enums';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  const textConfig: FormInputConfig = {
    id: 'jobRole',
    label: 'Job Role',
    type: FormInputType.TEXT,
    required: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent, NoopAnimationsModule],
      providers: [provideNativeDateAdapter()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
  });

  function init(config: FormInputConfig, control?: FormControl): void {
    component.config = config;
    if (control) component.control = control;
    fixture.detectChanges();
  }

  describe('config validation', () => {
    it('should throw if no config is provided', () => {
      expect(() => fixture.detectChanges()).toThrowError('FormInputComponent: config is required');
    });

    it('should throw if config.id is missing', () => {
      component.config = { ...textConfig, id: '' };
      expect(() => fixture.detectChanges()).toThrowError('FormInputComponent: config.id is required');
    });

    it('should throw if config.label is missing', () => {
      component.config = { ...textConfig, label: '' };
      expect(() => fixture.detectChanges()).toThrowError('FormInputComponent: config.label is required');
    });

    it('should throw if config.type is missing', () => {
      component.config = { ...textConfig, type: undefined as unknown as FormInputType };
      expect(() => fixture.detectChanges()).toThrowError('FormInputComponent: config.type is required');
    });
  });

  describe('type discrimination getters', () => {
    it('should identify a select config', () => {
      init({ ...textConfig, type: FormInputType.SELECT } as FormInputSelectConfig);
      expect(component.isSelect).toBe(true);
      expect(component.isTextarea).toBe(false);
      expect(component.isDate).toBe(false);
    });

    it('should identify a textarea config', () => {
      init({ ...textConfig, type: FormInputType.TEXTAREA });
      expect(component.isTextarea).toBe(true);
    });

    it('should identify a date config', () => {
      init({ ...textConfig, type: FormInputType.DATE });
      expect(component.isDate).toBe(true);
    });

    it('should default textarea rows when not configured', () => {
      init({ ...textConfig, type: FormInputType.TEXTAREA });
      expect(component.textareaRows).toBe(3);
    });

    it('should use the configured textarea rows when provided', () => {
      init({ ...textConfig, type: FormInputType.TEXTAREA, rows: 6 });
      expect(component.textareaRows).toBe(6);
    });
  });

  describe('password field behavior', () => {
    it('should not show the password toggle by default', () => {
      init({ ...textConfig, type: FormInputType.PASSWORD });
      expect(component.showPasswordToggle).toBe(false);
    });

    it('should show the password toggle when explicitly enabled', () => {
      init({ ...textConfig, type: FormInputType.PASSWORD, showPasswordToggle: true });
      expect(component.showPasswordToggle).toBe(true);
    });

    it('should default to a password input type and switch to text when toggled', () => {
      init({ ...textConfig, type: FormInputType.PASSWORD });
      expect(component.currentInputType).toBe('password');

      component.togglePasswordVisibility();
      expect(component.currentInputType).toBe('text');
      expect(component.passwordVisibilityIcon).toBe('visibility');

      component.togglePasswordVisibility();
      expect(component.currentInputType).toBe('password');
      expect(component.passwordVisibilityIcon).toBe('visibility_off');
    });

    it('should return the config type unchanged for non-password fields', () => {
      init({ ...textConfig, type: FormInputType.EMAIL });
      expect(component.currentInputType).toBe(FormInputType.EMAIL);
    });
  });

  describe('with an externally-passed control (the [control] input)', () => {
    it('should sync the initial non-empty control value into the component', fakeAsync(() => {
      const control = new FormControl('Software Engineer');
      init(textConfig, control);
      tick(100);

      expect(component.value).toBe('Software Engineer');
    }));

    it('should not treat an empty string initial value as needing a sync', () => {
      const control = new FormControl('');
      init(textConfig, control);
      expect(component.value).toBe('');
    });

    it('should reflect subsequent external control value changes', () => {
      const control = new FormControl('');
      init(textConfig, control);

      control.setValue('Updated externally');

      expect(component.value).toBe('Updated externally');
    });

    it('should stop reacting to control value changes after the component is destroyed', () => {
      const control = new FormControl('initial');
      init(textConfig, control);

      fixture.destroy();
      control.setValue('after destroy');

      expect(component.value).toBe('initial');
    });

    it('should push value changes from user input back into the control', () => {
      const control = new FormControl('');
      init(textConfig, control);

      component.onValueChange({ target: { value: 'typed value' } } as unknown as Event);

      expect(control.value).toBe('typed value');
      expect(control.dirty).toBe(true);
    });

    it('should mark the control as touched exactly once', () => {
      const control = new FormControl('');
      init(textConfig, control);
      spyOn(control, 'markAsTouched').and.callThrough();

      component.markAsTouched();
      component.markAsTouched();

      expect(control.markAsTouched).toHaveBeenCalledTimes(1);
      expect(component.touched).toBe(true);
    });

    it('should report hasError only when the control is invalid and touched', () => {
      const control = new FormControl('', Validators.required);
      init(textConfig, control);

      expect(component.hasError).toBe(false);

      control.markAsTouched();
      fixture.detectChanges();

      expect(component.hasError).toBe(true);
    });

    it('should return an empty error message when untouched even if invalid', () => {
      const control = new FormControl('', Validators.required);
      init(textConfig, control);
      expect(component.errorMessage).toBe('');
    });

    it('should return the default error message for a known validator key', () => {
      const control = new FormControl('', Validators.required);
      init(textConfig, control);
      control.markAsTouched();

      expect(component.errorMessage).toBe('This field is required');
    });

    it('should prefer a config-supplied custom error message over the default', () => {
      const control = new FormControl('', Validators.required);
      init({ ...textConfig, errorMessages: { required: 'Job role cannot be empty' } }, control);
      control.markAsTouched();

      expect(component.errorMessage).toBe('Job role cannot be empty');
    });
  });

  describe('without a control (unbound usage)', () => {
    it('should never report an error', () => {
      init(textConfig);
      expect(component.hasError).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should still update its own value on user input without throwing', () => {
      init(textConfig);
      expect(() => component.onValueChange({ target: { value: 'typed' } } as unknown as Event)).not.toThrow();
      expect(component.value).toBe('typed');
    });
  });

  describe('ControlValueAccessor implementation', () => {
    it('writeValue should set the internal value', () => {
      init(textConfig);
      component.writeValue('written');
      expect(component.value).toBe('written');
    });

    it('registerOnChange callback should fire on user input', () => {
      init(textConfig);
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.onValueChange({ target: { value: 'new value' } } as unknown as Event);

      expect(onChangeSpy).toHaveBeenCalledWith('new value');
    });

    it('registerOnTouched callback should fire on markAsTouched', () => {
      init(textConfig);
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.markAsTouched();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('setDisabledState should set the disabled flag', () => {
      init(textConfig);
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
    });
  });

  describe('Material datepicker event shape', () => {
    it('should read .value directly for datepicker change events', () => {
      init({ ...textConfig, type: FormInputType.DATE });
      const date = new Date('2026-01-01');

      component.onValueChange({ value: date } as unknown as Event);

      expect(component.value).toBe(date);
    });
  });

  describe('focus/blur events', () => {
    it('should emit focus and blur outputs', () => {
      init(textConfig);
      const focusSpy = jasmine.createSpy('focus');
      const blurSpy = jasmine.createSpy('blur');
      component.focus.subscribe(focusSpy);
      component.blur.subscribe(blurSpy);

      component.onFocus();
      component.onBlur();

      expect(focusSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });
  });
});
