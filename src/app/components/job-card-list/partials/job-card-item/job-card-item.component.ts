import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { JobApplicationItem } from '../../../../core/models/interface/job-application.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActionMenuComponent } from '../../../action-menu/action-menu.component';
import { COPY_SUCCESS_MESSAGE, SNACKBAR_CLOSE_LABEL, SNACKBAR_DURATION, ActionMenuItem, ACTION_TYPES } from '../../../../core/models';

@Component({
  selector: 'app-job-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ActionMenuComponent],
  templateUrl: './job-card-item.component.html',
  styleUrls: ['./job-card-item.component.scss']
})
export class JobCardItemComponent {
  clipboard = inject(Clipboard);
  snackBar = inject(MatSnackBar);

  @Input() job!: JobApplicationItem;

  @Output() edit = new EventEmitter<JobApplicationItem>();
  @Output() delete = new EventEmitter<JobApplicationItem>();
  @Output() statusChange = new EventEmitter<JobApplicationItem>();
  @Output() view = new EventEmitter<JobApplicationItem>();

  readonly jobActions: ActionMenuItem[] = [
    { key: ACTION_TYPES.EDIT, callback: () => this.triggerApplicationEdit(this.job) },
    { key: ACTION_TYPES.CHANGE_STATUS, callback: () => this.triggerStatusChange(this.job) },
    { key: ACTION_TYPES.DELETE, label: 'Remove', callback: () => this.triggerDelete(this.job) }
  ];

  triggerApplicationEdit(item: JobApplicationItem): void {
    this.edit.emit(item);
  }

  triggerView(item: JobApplicationItem): void {
    this.view.emit(item);
  }

  triggerDelete(item: JobApplicationItem): void {
    this.delete.emit(item);
  }

  triggerStatusChange(item: JobApplicationItem): void {
    this.statusChange.emit(item);
  }


  copyLink(link?: string): void {
    if (!link) return;
    this.clipboard.copy(link);
    this.snackBar.open(COPY_SUCCESS_MESSAGE, SNACKBAR_CLOSE_LABEL, { duration: SNACKBAR_DURATION });
  }
}
