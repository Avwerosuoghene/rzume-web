import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { JobApplicationItem } from '../../../../core/models/interface/job-application.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { COPY_SUCCESS_MESSAGE, SNACKBAR_CLOSE_LABEL, SNACKBAR_DURATION } from '../../../../core/models';

@Component({
  selector: 'app-job-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
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

  triggerApplicationEdit(item: JobApplicationItem): void {
    this.edit.emit(item);
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
