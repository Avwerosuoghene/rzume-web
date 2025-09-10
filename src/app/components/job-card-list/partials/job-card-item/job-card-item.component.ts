import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplicationItem } from '../../../../core/models/interface/job-application.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-job-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './job-card-item.component.html',
  styleUrls: ['./job-card-item.component.scss']
})
export class JobCardItemComponent {
  @Input() job!: JobApplicationItem;
}
