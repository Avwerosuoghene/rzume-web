import { FormInputConfigHelper } from './form-input-config.helper';
import { FormInputType } from '../models/enums/form-input.enums';

describe('FormInputConfigHelper', () => {
  describe('email', () => {
    it('should build an email config with the default placeholder and required=true', () => {
      const config = FormInputConfigHelper.email({ id: 'email', label: 'Email' });

      expect(config).toEqual(jasmine.objectContaining({
        id: 'email',
        label: 'Email',
        type: FormInputType.EMAIL,
        placeholder: 'Enter your email',
        required: true,
        disabled: false
      }));
    });

    it('should respect an explicit placeholder and required override', () => {
      const config = FormInputConfigHelper.email({ id: 'email', label: 'Email', placeholder: 'you@company.com', required: false });

      expect(config.placeholder).toBe('you@company.com');
      expect(config.required).toBe(false);
    });
  });

  describe('password', () => {
    it('should build a password config with the default placeholder and required=true', () => {
      const config = FormInputConfigHelper.password({ id: 'pw', label: 'Password' });

      expect(config.type).toBe(FormInputType.PASSWORD);
      expect(config.placeholder).toBe('Enter your password');
      expect(config.required).toBe(true);
    });
  });

  describe('text', () => {
    it('should derive the default placeholder from the lowercased label', () => {
      const config = FormInputConfigHelper.text({ id: 'name', label: 'Full Name' });

      expect(config.type).toBe(FormInputType.TEXT);
      expect(config.placeholder).toBe('Enter full name');
      expect(config.required).toBe(false);
    });
  });

  describe('url / number / tel', () => {
    it('should build a url config with its default placeholder', () => {
      expect(FormInputConfigHelper.url({ id: 'site', label: 'Website' }).placeholder).toBe('Enter URL');
    });

    it('should build a number config with its default placeholder', () => {
      expect(FormInputConfigHelper.number({ id: 'age', label: 'Age' }).placeholder).toBe('Enter number');
    });

    it('should build a tel config with its default placeholder', () => {
      expect(FormInputConfigHelper.tel({ id: 'phone', label: 'Phone' }).placeholder).toBe('Enter phone number');
    });
  });

  describe('textarea', () => {
    it('should derive the default placeholder from the lowercased label like text()', () => {
      const config = FormInputConfigHelper.textarea({ id: 'bio', label: 'Bio' });

      expect(config.type).toBe(FormInputType.TEXTAREA);
      expect(config.placeholder).toBe('Enter bio');
    });
  });

  describe('select', () => {
    it('should build a select config with the given options', () => {
      const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
      const config = FormInputConfigHelper.select({ id: 'industry', label: 'Industry', options });

      expect(config.type).toBe(FormInputType.SELECT);
      expect(config.options).toBe(options);
      expect(config.required).toBe(false);
      expect(config.disabled).toBe(false);
    });

    it('should leave placeholder undefined when none is given (no default, unlike other input types)', () => {
      const config = FormInputConfigHelper.select({ id: 'industry', label: 'Industry', options: [] });
      expect(config.placeholder).toBeUndefined();
    });
  });

  describe('date', () => {
    it('should build a date config with the default placeholder', () => {
      const config = FormInputConfigHelper.date({ id: 'dob', label: 'Date of Birth' });

      expect(config.type).toBe(FormInputType.DATE);
      expect(config.placeholder).toBe('Select date');
      expect(config.required).toBe(false);
    });

    it('should pass through min/max dates when given', () => {
      const min = new Date('2020-01-01');
      const max = new Date('2024-01-01');
      const config = FormInputConfigHelper.date({ id: 'dob', label: 'Date of Birth', min, max });

      expect(config.min).toBe(min);
      expect(config.max).toBe(max);
    });
  });

  describe('explicit false is preserved, not overridden by the default (nullish-coalescing behavior)', () => {
    it('should keep required=false explicitly on a normally-required input type', () => {
      const config = FormInputConfigHelper.email({ id: 'email', label: 'Email', required: false });
      expect(config.required).toBe(false);
    });
  });
});
