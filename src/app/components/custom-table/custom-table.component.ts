import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularMaterialModules],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.scss'
})
export class CustomTableComponent {
  @Input() data: any[] = [];
  @Input() columns: { header: string, field: string }[] = [];
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  itemsPerPage: number = 5;
  @Output() itemPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelectionChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();


  selectedItems: Array<any> = [];
  totalItems: number = 20;





  constructor() {

  }

  ngOnInit(): void { }



  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.itemPerPageChanged.emit(this.itemsPerPage);

  }


  onCheckboxChange(item: any, event: any): void {
    this.selectedItems = [];
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      const itemIndex = this.selectedItems.indexOf(item);
      this.selectedItems.splice(itemIndex, 1);
    }
    this.onSelectionChanged.emit(this.selectedItems);

  }





  onPageChange(page: number): void {
    this.currentPage = page;
    this.itemPerPageChanged.emit(this.currentPage);

  }



  getPageNumbers(): number[] {
    const pages = [];

    if (this.totalPages <= 4) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage === 1 || this.currentPage === 2) {
        pages.push(2, 3);
      } else if (this.currentPage === this.totalPages || this.currentPage === this.totalPages - 1) {
        pages.push(this.totalPages - 2, this.totalPages - 1);
      } else {
        pages.push(this.currentPage, this.currentPage + 1);
        if (this.currentPage - 1 > 1) {
          pages.push(this.currentPage - 1);
        }
      }

      if (!pages.includes(this.totalPages)) {
        pages.push(this.totalPages);
      }
    }

    // Remove duplicates and sort
    return [...new Set(pages)].sort((a, b) => a - b);
  }

  toggleAllSelections(event: any) {
    this.selectedItems = [];

    this.data.forEach(item => {
      this.selectedItems.push(item);
      item.selected = !item.selected
    });
    this.onSelectionChanged.emit(this.selectedItems);

  }

  isAllSelected(): boolean {
    return this.data.every(item => item.selected);
  }




}
