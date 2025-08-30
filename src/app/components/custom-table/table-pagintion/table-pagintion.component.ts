import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules';

@Component({
  selector: 'app-table-pagintion',
  standalone: true,
  imports: [AngularMaterialModules],
  templateUrl: './table-pagintion.component.html',
  styleUrl: './table-pagintion.component.scss'
})
export class TablePagintionComponent {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 5;

  @Output() itemsPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  pageSizeOptions: number[] = [5, 10, 20, 50];

  triggerItemsPerPageChange(event: any): void {
    this.itemsPerPageChanged.emit(+event.target.value);
  }

  triggerPageChange(page: number): void {
    this.pageChanged.emit(page);
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

    return [...new Set(pages)].sort((a, b) => a - b);
  }
}
