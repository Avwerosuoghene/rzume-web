import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomSearchInputComponent } from '../../../components/custom-search-input/custom-search-input.component';
import { FilterDropdownComponent } from '../../../components/filter-dropdown/filter-dropdown.component';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { JobAddDialogComponent } from '../../../components/job-add-dialog/job-add-dialog.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { AddJobDialogData, DialogCloseResponse, FilterOption, InfoDialogData } from '../../../core/models';
import { LayoutStateService, MockDataService } from '../../../core/services';
import { ColumnDefinition, StatHighlight } from '../../../core/models/interface/dashboard.models';
import { JOB_FILTER_OPTIONS, JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { ComponentType } from '@angular/cdk/portal';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CustomSearchInputComponent, FilterDropdownComponent, CustomTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  statHighLights: Array<StatHighlight> = [];
  searchText: string = '';
  filterOptions: Array<FilterOption> = JOB_FILTER_OPTIONS;

  data: any[] = [];
  columns: Array<ColumnDefinition> = JOB_TABLE_COLUMNS;
  totalPages: number = PAGINATION_DEFAULTS.totalPages;
  currentPage: number = PAGINATION_DEFAULTS.currentPage;
  itemsPerPage: number = PAGINATION_DEFAULTS.itemsPerPage;
  totalItems: number = PAGINATION_DEFAULTS.totalItems;
  selectedItems: Array<any> = [];
  loaderIsActive: boolean = false;
  destroy$ = new Subject<void>();


  constructor(private mockDataService: MockDataService, private utilityService: LayoutStateService, private dialog: MatDialog) {

  }


  ngOnInit(): void {
    this.initiateStats();
    this.fetchData(this.currentPage);
    this.initiateGlobalLoader();
  }

  get buttonDisabled() {
    return (
      this.loaderIsActive);
  }

  initiateGlobalLoader() {
    this.utilityService.headerLoader
      .pipe(takeUntil(this.destroy$))
      .subscribe(loaderStatus => {
        this.loaderIsActive = loaderStatus;
      });
  }

  handleChangeInItemPerPage(event: number): void {
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


  addNewApplicationEntry() {
    const dialogData: AddJobDialogData = {
      isEditing: false
    }
    const jobAdditionDialog = this.openDialog<JobAddDialogComponent, AddJobDialogData>(
      JobAddDialogComponent,
      dialogData,
      { disableClose: true }
    );
    jobAdditionDialog.afterClosed().subscribe(response => this.handleOnCloseJobDialog(response))
  }

  handleOnCloseJobDialog(response?: DialogCloseResponse): void {
    if (!response) return

    const dialogData: InfoDialogData = {
      infoMessage: response?.message,
      statusIcon: response?.applicationStat
    }
    this.openDialog<InfoDialogComponent, InfoDialogData>(InfoDialogComponent, dialogData);

  }

  openDialog<ComponentName, DialogData>(component: ComponentType<ComponentName>, dialogData: DialogData, options?: MatDialogConfig<DialogData>): MatDialogRef<ComponentName> {
    return this.dialog.open(component, {
      data: dialogData,
      backdropClass: "blurred",
      ...options
    });
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

  initiateLocalLoader(loaderState: boolean) {
    this.loaderIsActive = loaderState;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
