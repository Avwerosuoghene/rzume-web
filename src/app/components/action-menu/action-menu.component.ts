import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModules } from '../../core/modules';
import { ActionType, ActionMenuItem, ActionMenuVariant, ACTION_TYPE_ICON_MAP, ACTION_TYPE_LABEL_MAP } from '../../core/models';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, AngularMaterialModules],
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss']
})
export class ActionMenuComponent {
  @Input() actions: ActionMenuItem[] = [];
  @Input() variant: ActionMenuVariant = 'icons';

  iconFor(key: ActionType): string {
    return ACTION_TYPE_ICON_MAP[key];
  }

  labelFor(action: ActionMenuItem): string {
    return action.label ?? ACTION_TYPE_LABEL_MAP[action.key];
  }
}
