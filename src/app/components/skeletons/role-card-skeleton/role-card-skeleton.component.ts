import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ROLE_LIMIT } from '../../../core/models/constants/role.constants';

@Component({
  selector: 'app-role-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-card-skeleton.component.html',
  styleUrl: './role-card-skeleton.component.scss'
})
export class RoleCardSkeletonComponent {
  readonly placeholders = Array.from({ length: ROLE_LIMIT });
}
