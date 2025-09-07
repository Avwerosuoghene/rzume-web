import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() icon: string | undefined;
  @Input() showAction: boolean | undefined;
  @Input() actionText: string | undefined;

   @Output() actionButtonClickedEvent = new EventEmitter<void>();

  actionButtonClicked() {
    this.actionButtonClickedEvent.emit();
  }
}
