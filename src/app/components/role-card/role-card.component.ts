import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModules } from '../../core/modules';
import { Role } from '../../core/models/interface/role.models';
import { AttachedDocument, DocumentItem, ACTION_TYPES, ActionType } from '../../core/models';
import { DocumentItemComponent } from '../../pages/main/profile-management/document-item/document-item.component';
import { expandCollapseAnimation } from '../../core/animations/expand-collapse-animation';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [CommonModule, AngularMaterialModules, DocumentItemComponent],
  templateUrl: './role-card.component.html',
  styleUrl: './role-card.component.scss',
  animations: [expandCollapseAnimation]
})
export class RoleCardComponent {
  @Input() role!: Role;
  @Output() editRole = new EventEmitter<Role>();
  @Output() delete = new EventEmitter<Role>();
  @Output() deleteDocument = new EventEmitter<{ role: Role; documentId: string }>();

  // View and download both just get the user to the file, so download is redundant here —
  // excluded rather than removed from DocumentItemComponent's action set, which Profile
  // Management's own document list still uses.
  readonly excludedDocumentActions: ActionType[] = [ACTION_TYPES.DOWNLOAD];

  readonly documentFilenameTruncateLimit = 18;

  isExpanded = false;

  toDocumentItem(document: AttachedDocument): DocumentItem {
    const { documentUrl, ...rest } = document;
    return { ...rest, url: documentUrl };
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get documentCountLabel(): string {
    const count = this.role.documents.length;
    return `${count} document${count === 1 ? '' : 's'}`;
  }

  onEditRole(): void {
    this.editRole.emit(this.role);
  }

  onDelete(): void {
    this.delete.emit(this.role);
  }

  // Removing a document is destructive and needs an API call + role-state sync, so this doesn't
  // own the flow itself. It emits for the parent to route into
  // DialogHelperService.openDeleteRoleDocumentConfirmation(), the same way "Remove Role" above
  // hands off to DialogHelperService rather than calling RoleService directly from this component.
  onDeleteDocument(documentId: string): void {
    this.deleteDocument.emit({ role: this.role, documentId });
  }
}
