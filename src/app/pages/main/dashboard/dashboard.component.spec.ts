import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { JobApplicationService } from '../../../core/services/job-application.service';
import { JobApplicationStateService } from '../../../core/services/job-application-state.service';
import { ScreenManagerService } from '../../../core/services/screen-manager.service';
import { SearchStateService } from '../../../core/services/search-state.service';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { JobApplicationItem, JobApplicationFilter } from '../../../core/models/interface/job-application.models';
import { ApplicationStatus } from '../../../core/models/enums/shared.enums';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockJobApplicationService: jasmine.SpyObj<JobApplicationService>;
  let mockJobApplicationStateService: jasmine.SpyObj<JobApplicationStateService>;
  let mockScreenManagerService: jasmine.SpyObj<ScreenManagerService>;
  let mockSearchStateService: jasmine.SpyObj<SearchStateService>;
  let mockDialogHelperService: jasmine.SpyObj<DialogHelperService>;

  const mockJobApplications: JobApplicationItem[] = [
    {
      id: '1',
      position: 'Frontend Developer',
      companyName: 'Tech Corp',
      status: ApplicationStatus.Applied,
      applicationDate: new Date()
    },
    {
      id: '2',
      position: 'Backend Developer',
      companyName: 'Dev Inc',
      status: ApplicationStatus.InProgress,
      applicationDate: new Date()
    }
  ];

  const mockApiResponse = {
    success: true,
    data: {
      items: mockJobApplications,
      totalCount: 2,
      totalPages: 1,
      pageNumber: 1,
      pageSize: 10
    }
  };

  const mockStatsResponse = {
    success: true,
    data: {
      totalApplications: { description: 'Total', value: 10 },
      applied: { description: 'Applied', value: 5 },
      inProgress: { description: 'In Progress', value: 3 },
      rejected: { description: 'Rejected', value: 2 }
    }
  };

  beforeEach(async () => {
    const jobApplicationServiceSpy = jasmine.createSpyObj('JobApplicationService', [
      'getApplications',
      'getStats',
      'deleteApplication'
    ]);
    const jobApplicationStateServiceSpy = jasmine.createSpyObj('JobApplicationStateService', [
      'getApplications'
    ]);
    const screenManagerServiceSpy = jasmine.createSpyObj('ScreenManagerService', [], {
      isMobile$: of(false)
    });
    const searchStateServiceSpy = jasmine.createSpyObj('SearchStateService', ['updateFilter', 'updateSearchTerm'], {
      filter$: of({})
    });
    const dialogHelperServiceSpy = jasmine.createSpyObj('DialogHelperService', [
      'openAddApplicationDialog',
      'openEditApplicationDialog',
      'updateApplication'
    ]);

    // Setup default return values
    jobApplicationServiceSpy.getApplications.and.returnValue(of(mockApiResponse));
    jobApplicationServiceSpy.getStats.and.returnValue(of(mockStatsResponse));
    jobApplicationStateServiceSpy.getApplications.and.returnValue(of({ 
      items: [], 
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false
    }));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: JobApplicationService, useValue: jobApplicationServiceSpy },
        { provide: JobApplicationStateService, useValue: jobApplicationStateServiceSpy },
        { provide: ScreenManagerService, useValue: screenManagerServiceSpy },
        { provide: SearchStateService, useValue: searchStateServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    
    mockJobApplicationService = TestBed.inject(JobApplicationService) as jasmine.SpyObj<JobApplicationService>;
    mockJobApplicationStateService = TestBed.inject(JobApplicationStateService) as jasmine.SpyObj<JobApplicationStateService>;
    mockScreenManagerService = TestBed.inject(ScreenManagerService) as jasmine.SpyObj<ScreenManagerService>;
    mockSearchStateService = TestBed.inject(SearchStateService) as jasmine.SpyObj<SearchStateService>;
    mockDialogHelperService = TestBed.inject(DialogHelperService) as jasmine.SpyObj<DialogHelperService>;
    
    // Don't trigger detectChanges here to test initial state
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.data).toEqual([]);
    expect(component.statHighLights).toEqual([]);
    expect(component.selectedItems).toEqual([]);
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(10);
  });

  it('should load job applications on init', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(mockJobApplicationService.getApplications).toHaveBeenCalled();
    expect(mockJobApplicationService.getStats).toHaveBeenCalled();
  });

  it('should update component state when loading applications', () => {
    // Setup mock data for this test
    const mockPaginatedResponse = {
      items: mockJobApplications,
      totalCount: 2,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
    mockJobApplicationStateService.getApplications.and.returnValue(of(mockPaginatedResponse));
    
    component.loadUserAppliedJobs();

    expect(component.data.length).toBe(2);
    expect(component.totalItems).toBe(2);
    expect(component.totalPages).toBe(1);
    expect(component.currentPage).toBe(1);
  });

  it('should handle filter changes', () => {
    const newFilter: JobApplicationFilter = { status: ApplicationStatus.Applied };
    
    component.handleFilterChange(newFilter);

    expect(mockSearchStateService.updateFilter).toHaveBeenCalled();
  });

  it('should handle page changes', () => {
    component.currentPage = 1; // Set initial page
    component.handlePageChanged(2);

    expect(component.currentPage).toBe(2);
    expect(mockJobApplicationService.getApplications).toHaveBeenCalledWith({
      page: 2,
      pageSize: component.itemsPerPage
    });
  });

  it('should not reload when page is the same', () => {
    component.currentPage = 2;
    mockJobApplicationService.getApplications.calls.reset();

    component.handlePageChanged(2);

    expect(mockJobApplicationService.getApplications).not.toHaveBeenCalled();
  });

  it('should handle items per page change', () => {
    component.itemsPerPage = 10; // Set initial value
    component.handleChangeInItemPerPage(20);

    expect(component.itemsPerPage).toBe(20);
    expect(component.currentPage).toBe(1);
    expect(mockJobApplicationService.getApplications).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20
    });
  });

  it('should reload dashboard data', () => {
    mockJobApplicationService.getApplications.calls.reset();
    mockJobApplicationService.getStats.calls.reset();

    component.reloadDashboardData();

    expect(mockJobApplicationService.getApplications).toHaveBeenCalled();
    expect(mockJobApplicationService.getStats).toHaveBeenCalled();
  });

  it('should handle job application addition', () => {
    component.addNewApplicationEntry();

    expect(mockDialogHelperService.openAddApplicationDialog).toHaveBeenCalled();
  });

  it('should handle job application deletion', () => {
    const idsToDelete = ['1', '2'];
    mockJobApplicationService.deleteApplication.and.returnValue(of({ success: true, statusCode: 200, message: 'Success', data: true }));
    spyOn(component, 'reloadDashboardData');

    component.handleDeleteApplications(idsToDelete);

    expect(mockJobApplicationService.deleteApplication).toHaveBeenCalledWith({ ids: idsToDelete });
    expect(component.reloadDashboardData).toHaveBeenCalled();
  });

  it('should handle selection changes', () => {
    const selectedItems = [mockJobApplications[0]];

    component.handleSelectionChanged(selectedItems);

    expect(component.selectedItems).toEqual(selectedItems);
  });

  it('should handle job status updates', () => {
    const updatedJob = { ...mockJobApplications[0], status: ApplicationStatus.InProgress };
    
    component.handleStatusUpdate({ item: updatedJob });

    expect(mockDialogHelperService.updateApplication).toHaveBeenCalledWith(updatedJob, jasmine.any(Function));
  });

  it('should handle load more', () => {
    component.itemsPerPage = 10; // Set initial value
    const initialItemsPerPage = component.itemsPerPage;
    
    component.handleLoadMore();
    
    expect(component.itemsPerPage).toBe(15); // 10 + 5
    expect(mockJobApplicationService.getApplications).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', () => {
    mockJobApplicationService.getApplications.and.returnValue(
      throwError({ error: 'API Error' })
    );

    component.loadUserAppliedJobs();

    expect(component.isLoading).toBe(false);
  });

  it('should handle search changes', () => {
    const searchTerm = 'test search';
    
    component.handleSearchChange(searchTerm);

    expect(mockSearchStateService.updateSearchTerm).toHaveBeenCalledWith(searchTerm);
  });

  it('should handle job application updates', () => {
    const jobData = mockJobApplications[0];
    
    component.updateJobApplication(jobData);

    expect(mockDialogHelperService.openEditApplicationDialog).toHaveBeenCalledWith(jobData, jasmine.any(Function));
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
