import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, RoleDocument } from '../../core/models/interface/role.models';
import { DocumentItem } from '../../core/models';
import { DocumentItemComponent } from '../../pages/main/profile-management/document-item/document-item.component';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [CommonModule, DocumentItemComponent],
  templateUrl: './role-card.component.html',
  styleUrl: './role-card.component.scss'
})
export class RoleCardComponent {
  @Input() role!: Role;

  toDocumentItem(document: RoleDocument): DocumentItem {
    const { documentUrl, ...rest } = document;
    return { ...rest, url: documentUrl };
  }
}
