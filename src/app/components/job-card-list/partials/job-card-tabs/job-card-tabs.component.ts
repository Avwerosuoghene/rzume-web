import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterOption } from '../../../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-card-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card-tabs.component.html',
  styleUrls: ['./job-card-tabs.component.scss']
})
export class JobCardTabsComponent {
  @Input() tabs: FilterOption[] = [];
  @Input() activeTab: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tab: FilterOption) {
    this.activeTab = tab.value;
    this.tabChange.emit(tab.value);
  }
}
