import { Component, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { CoreModules } from '../../../core/modules/core-modules';
import { CustomSearchInputComponent } from '../../../components/custom-search-input/custom-search-input.component';
import { FilterDropdownComponent } from '../../../components/filter-dropdown/filter-dropdown.component';
import { FilterOption } from '../../../core/models/interface/utilities-interface';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CustomSearchInputComponent, FilterDropdownComponent, CustomTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  statHighLights: Array<{ description: string, value: number }> = [];
  searchText: string = '';
  filterOptions: Array<FilterOption> = [];

  data: any[] = [];
  columns: { header: string, field: string }[] = [];
  totalPages: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  selectedItems: Array<any> = [];


  constructor(private mockDataService: MockDataService) {

  }


  ngOnInit(): void {
    this.initiateStats();
    this.setFilterOptions();
    this.fetchData(1);
    this.setupColumns();
  }

  handleChangeInItemPerPage(event: any): void {
  console.log(event);
  this.itemsPerPage = event;

  }

  handlePageChanged(page: number) {
    this.currentPage = page;
  }

  fetchData(page: number): void {
    this.mockDataService.getOrders(page, this.itemsPerPage).subscribe(response => {

      this.data = response.data.data;
      this.totalItems = response.data.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    });
  }



  initiateStats() {
    this.statHighLights.push(
      {
        description: 'Total Job Application',
        value: 20
      },
      {
        description: 'Total Interviews',
        value: 2
      },
      {
        description: 'Total Rejections',
        value: 305
      },
      {
        description: 'Total Offers',
        value: 3
      }
    )
  }

  setFilterOptions() {
    this.filterOptions.push(
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    )
  }

  setupColumns(): void {
    this.columns = [
      { header: 'Select', field: 'select' },
      { header: 'Order ID', field: 'order_id' },
      { header: 'Order Item ID', field: 'order_item_id' },
      { header: 'Product ID', field: 'product_id' },
      { header: 'Shipping Limit Date', field: 'shipping_limit_date' },
      { header: 'Seller ID', field: 'seller_id' },
      { header: 'Price', field: 'price' },
      { header: 'Freight Value', field: 'freight_value' }
    ];
  }


  handleFilterChange(filterValue: string): void {
    console.log('Filter value:', filterValue);
  }

  onSearch(event: any) {
    console.log(event);
  }



  handleSelectionChanged(event: any) {
    this.selectedItems = event;
  }

}
