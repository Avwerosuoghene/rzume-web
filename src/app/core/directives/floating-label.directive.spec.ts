import { ElementRef, RendererFactory2 } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FloatingLabelDirective } from './floating-label.directive';

describe('FloatingLabelDirective', () => {
  const containers: HTMLElement[] = [];

  function createDirective(hostHtml: string, targetSelector: string): {
    directive: FloatingLabelDirective;
    target: HTMLElement;
    formField: HTMLElement;
  } {
    const container = document.createElement('div');
    container.innerHTML = hostHtml;
    document.body.appendChild(container);
    containers.push(container);

    const target = container.querySelector(targetSelector) as HTMLElement;
    const renderer = TestBed.inject(RendererFactory2).createRenderer(null, null);
    const directive = new FloatingLabelDirective(new ElementRef(target), renderer);

    return { directive, target, formField: container.querySelector('.form-field') as HTMLElement };
  }

  afterEach(() => {
    containers.forEach(container => container.remove());
    containers.length = 0;
  });

  describe('with a text input', () => {
    const html = `
      <div class="form-field">
        <label>Name</label>
        <div class="input-wrapper"><input class="form-input" /></div>
      </div>`;

    it('should not add has-value when the input is empty', fakeAsync(() => {
      const { directive, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      expect(formField.classList.contains('has-value')).toBe(false);
    }));

    it('should add has-value once the input has non-whitespace text', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      (target as HTMLInputElement).value = 'hello';
      directive.onValueChange();

      expect(formField.classList.contains('has-value')).toBe(true);
    }));

    it('should not treat whitespace-only text as a value', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      (target as HTMLInputElement).value = '   ';
      directive.onValueChange();

      expect(formField.classList.contains('has-value')).toBe(false);
    }));

    it('should remove has-value when the input is cleared', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      (target as HTMLInputElement).value = 'hello';
      directive.onValueChange();
      expect(formField.classList.contains('has-value')).toBe(true);

      (target as HTMLInputElement).value = '';
      directive.onValueChange();
      expect(formField.classList.contains('has-value')).toBe(false);
    }));

    it('should detect a value set without any DOM event (e.g. FormInputComponent\'s [value] property binding reacting to a parent patchValue()) via ngDoCheck', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);
      expect(formField.classList.contains('has-value')).toBe(false);

      // Angular's [value]="value" property binding sets the DOM property directly, the same
      // way a programmatic FormControl.patchValue() flows through — neither dispatches a real
      // input/change event, so the existing @HostListener-only detection never re-runs.
      (target as HTMLInputElement).value = 'hello';
      directive.ngDoCheck();

      expect(formField.classList.contains('has-value')).toBe(true);
    }));

    it('should re-check on blur after a short delay', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'input');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      (target as HTMLInputElement).value = 'hello';
      directive.onBlur();
      expect(formField.classList.contains('has-value')).toBe(false);

      tick(10);
      expect(formField.classList.contains('has-value')).toBe(true);
    }));
  });

  describe('with a select that has a disabled placeholder option', () => {
    const html = `
      <div class="form-field">
        <label>Role</label>
        <div class="input-wrapper">
          <select class="form-input form-select">
            <option value="" disabled selected>Select a role</option>
            <option value="dev">Developer</option>
            <option value="pm">Product Manager</option>
          </select>
        </div>
      </div>`;

    it('should always report has-value, since a native select cannot hide its rendered option text like an input placeholder', fakeAsync(() => {
      const { directive, formField } = createDirective(html, 'select');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      expect(formField.classList.contains('has-value')).toBe(true);
    }));
  });

  describe('with a select with no placeholder option', () => {
    const html = `
      <div class="form-field">
        <label>Role</label>
        <div class="input-wrapper">
          <select class="form-input form-select">
            <option value="dev">Developer</option>
            <option value="pm">Product Manager</option>
          </select>
        </div>
      </div>`;

    it('should report has-value once a real option is selected', fakeAsync(() => {
      const { directive, target, formField } = createDirective(html, 'select');
      directive.ngOnInit();
      directive.ngAfterViewInit();
      tick(100);

      (target as HTMLSelectElement).value = 'pm';
      directive.onValueChange();

      expect(formField.classList.contains('has-value')).toBe(true);
    }));
  });

  describe('without an ancestor .form-field', () => {
    it('should not throw when no .form-field ancestor exists', fakeAsync(() => {
      const { directive, target } = createDirective('<input class="form-input" />', 'input');
      directive.ngOnInit();

      expect(() => {
        directive.ngAfterViewInit();
        tick(100);
        (target as HTMLInputElement).value = 'hello';
        directive.onValueChange();
      }).not.toThrow();
    }));
  });
});
