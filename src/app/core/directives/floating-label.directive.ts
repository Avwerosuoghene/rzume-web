import { Directive, ElementRef, HostListener, Renderer2, OnInit, AfterViewInit } from '@angular/core';
import { CssClass, ElementTag, EmptyValue, TIMING } from '../models';



@Directive({
  selector: '[appFloatingLabel]',
  standalone: true
})
export class FloatingLabelDirective implements OnInit, AfterViewInit {
  private formField: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.formField = this.el.nativeElement.closest(`.${CssClass.FORM_FIELD}`);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkValue(), TIMING.IMMEDIATE_CHECK);
    setTimeout(() => this.checkValue(), TIMING.DELAYED_CHECK);
  }

  @HostListener('input')
  @HostListener('change')
  @HostListener('focus')
  @HostListener('click')
  onValueChange(): void {
    this.checkValue();
  }

  @HostListener('blur')
  onBlur(): void {
    setTimeout(() => this.checkValue(), TIMING.BLUR_DELAY);
  }

  private checkValue(): void {
    if (!this.formField) return;

    const element = this.el.nativeElement;
    const hasValue = this.elementHasValue(element);

    this.updateLabelState(hasValue);
  }

  private elementHasValue(element: HTMLElement): boolean {
    return element.tagName === ElementTag.SELECT
      ? this.selectHasValue(element as HTMLSelectElement)
      : this.inputHasValue(element as HTMLInputElement | HTMLTextAreaElement);
  }

  private selectHasValue(select: HTMLSelectElement): boolean {
    if (this.selectHasPlaceholder(select)) {
      return true;
    }

    const value = select.value;
    
    if (this.isValidValue(value)) {
      return true;
    }

    return this.hasSelectedOption(select);
  }

  private selectHasPlaceholder(select: HTMLSelectElement): boolean {
    if (select.options.length === 0) {
      return false;
    }
    
    const firstOption = select.options[0];
    return firstOption?.disabled && 
           (!firstOption.value || firstOption.value === EmptyValue.EMPTY_STRING);
  }

  private inputHasValue(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    return !!(input.value && input.value.trim().length > 0);
  }

  private isValidValue(value: string): boolean {
    return value !== EmptyValue.EMPTY_STRING 
      && value !== null 
      && value !== undefined 
      && value !== EmptyValue.NULL_STRING;
  }

  private hasSelectedOption(select: HTMLSelectElement): boolean {
    if (select.selectedIndex < 0) {
      return false;
    }

    const selectedOption = select.options[select.selectedIndex];
    return !!(selectedOption?.value && selectedOption.value !== EmptyValue.EMPTY_STRING);
  }

  private updateLabelState(hasValue: boolean): void {
    if (!this.formField) return;

    if (hasValue) {
      this.renderer.addClass(this.formField, CssClass.HAS_VALUE);
    } else {
      this.renderer.removeClass(this.formField, CssClass.HAS_VALUE);
    }
  }
}
