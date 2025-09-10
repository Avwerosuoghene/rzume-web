import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplicationItem } from '../../../../core/models/interface/job-application.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-job-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './job-card-item.component.html',
  styleUrls: ['./job-card-item.component.scss']
})
export class JobCardItemComponent {
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
}
