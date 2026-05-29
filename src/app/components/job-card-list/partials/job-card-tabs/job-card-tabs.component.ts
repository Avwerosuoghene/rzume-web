import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FilterOption } from '../../../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-card-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card-tabs.component.html',
  styleUrls: ['./job-card-tabs.component.scss']
})
export class JobCardTabsComponent implements OnInit {
  @Input() tabs: FilterOption[] = [];
  @Input() activeTab: string = '';
  @Input() disabled = false;
  @Output() tabChange = new EventEmitter<string>();

  ngOnInit(): void {
    if (!this.activeTab && this.tabs.length > 0) {
      this.activeTab = this.tabs[0].value;
    }
  }

  selectTab(tab: FilterOption) {
    if (this.disabled) return;
    this.activeTab = tab.value;
    this.tabChange.emit(tab.value);
  }

  trackByValue(index: number, tab: FilterOption): string {
    return tab.value;
  }
}
