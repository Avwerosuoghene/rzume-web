import { Directive, ElementRef, HostListener, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appFloatingLabel]',
  standalone: true
})
export class FloatingLabelDirective implements OnInit {
  private formField: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.formField = this.el.nativeElement.closest('.form-field');
    
    this.checkValue();
  }

  @HostListener('input')
  @HostListener('change')
  onInputChange(): void {
    this.checkValue();
  }

  @HostListener('blur')
  onBlur(): void {
    this.checkValue();
  }

  private checkValue(): void {
    if (!this.formField) return;

    const input = this.el.nativeElement as HTMLInputElement;
    const hasValue = input.value && input.value.trim().length > 0;

    if (hasValue) {
      this.renderer.addClass(this.formField, 'has-value');
    } else {
      this.renderer.removeClass(this.formField, 'has-value');
    }
  }
}
