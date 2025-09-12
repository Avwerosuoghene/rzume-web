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
  @Output() tabChange = new EventEmitter<string>();

  ngOnInit(): void {
    this.selectTab(this.tabs[0]);
  }

  selectTab(tab: FilterOption) {
    this.activeTab = tab.value;
    this.tabChange.emit(tab.value);
  }
}
