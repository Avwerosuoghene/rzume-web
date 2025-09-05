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
  @Input() title: string = 'No Applications Yet';
  @Input() message: string = 'You haven\'t added any job applications yet. Click the button below to get started!';
  @Input() icon: string = 'work_outline';
  @Input() showAction: boolean = true;
  @Input() actionText: string = 'Add First Application';

   @Output() actionButtonClickedEvent = new EventEmitter<void>();

  actionButtonClicked() {
    this.actionButtonClickedEvent.emit();
  }
}
