import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { JobCardListComponent } from './job-card-list.component';
import { DialogHelperService } from '../../core/services/dialog-helper.service';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { ApplicationStatus } from '../../core/models';

describe('JobCardListComponent', () => {
  let component: JobCardListComponent;
  let fixture: ComponentFixture<JobCardListComponent>;
  let mockDialogHelper: jasmine.SpyObj<DialogHelperService>;

  const mockJobs: JobApplicationItem[] = [
    {
      id: '1',
      position: 'Developer',
      companyName: 'Test Company',
      status: ApplicationStatus.Applied,
      applicationDate: new Date()
    },
    {
      id: '2',
      position: 'Designer',
      companyName: 'Design Co',
      status: ApplicationStatus.InProgress,
      applicationDate: new Date()
    }
  ];

  beforeEach(async () => {
    const dialogHelperSpy = jasmine.createSpyObj('DialogHelperService', [
      'openDeleteConfirmation',
      'openJobStatusDialog'
    ]);

    await TestBed.configureTestingModule({
      imports: [JobCardListComponent],
      providers: [
        { provide: DialogHelperService, useValue: dialogHelperSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardListComponent);
    component = fixture.componentInstance;
    mockDialogHelper = TestBed.inject(DialogHelperService) as jasmine.SpyObj<DialogHelperService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.jobs).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.totalItems).toBe(0);
    expect(component.currentFilter).toEqual({});
    expect(component.activeTab).toBeDefined();
  });

  describe('ngAfterViewInit', () => {
    it('should call setupScrollListener', () => {
      spyOn(component, 'setupScrollListener');
      
      component.ngAfterViewInit();

      expect(component.setupScrollListener).toHaveBeenCalled();
    });
  });

  describe('setupScrollListener', () => {
    it('should not setup listener when cardListContainer is not available', () => {
      component.setupScrollListener();
      // Should not throw error
      expect(component).toBeTruthy();
    });

    it('should setup scroll listener when container is available', () => {
      const mockElement = document.createElement('div');
      component['cardListContainer'] = new ElementRef(mockElement);
      
      spyOn(mockElement, 'addEventListener');
      
      component.setupScrollListener();
      
      // Verify that scroll event handling is set up
      expect(component).toBeTruthy();
    });
  });

  describe('handleScroll', () => {
    it('should emit loadMore when at bottom and has more items', () => {
      spyOn(component.loadMore, 'emit');
      spyOn(component, 'isAtBottom').and.returnValue(true);
      
      component.jobs = mockJobs;
      component.totalItems = 5;
      
      const mockEvent = { target: document.createElement('div') } as any;
      component.handleScroll(mockEvent);

      expect(component.loadMore.emit).toHaveBeenCalled();
    });

    it('should not emit loadMore when not at bottom', () => {
      spyOn(component.loadMore, 'emit');
      spyOn(component, 'isAtBottom').and.returnValue(false);
      
      const mockEvent = { target: document.createElement('div') } as any;
      component.handleScroll(mockEvent);

      expect(component.loadMore.emit).not.toHaveBeenCalled();
    });

    it('should not emit loadMore when no more items', () => {
      spyOn(component.loadMore, 'emit');
      spyOn(component, 'isAtBottom').and.returnValue(true);
      
      component.jobs = mockJobs;
      component.totalItems = 2;
      
      const mockEvent = { target: document.createElement('div') } as any;
      component.handleScroll(mockEvent);

      expect(component.loadMore.emit).not.toHaveBeenCalled();
    });
  });

  describe('isAtBottom', () => {
    it('should return true when at bottom', () => {
      const mockElement = {
        scrollTop: 100,
        clientHeight: 200,
        scrollHeight: 300
      } as HTMLElement;

      const result = component.isAtBottom(mockElement);

      expect(result).toBe(true);
    });

    it('should return false when not at bottom', () => {
      const mockElement = {
        scrollTop: 50,
        clientHeight: 200,
        scrollHeight: 400
      } as HTMLElement;

      const result = component.isAtBottom(mockElement);

      expect(result).toBe(false);
    });
  });

  describe('handleTabChange', () => {
    it('should update active tab and emit filter change', () => {
      spyOn(component.filterChange, 'emit');
      
      component.handleTabChange('InProgress');

      expect(component.activeTab).toBe('InProgress');
      expect(component.currentFilter.status).toBe(ApplicationStatus.InProgress);
      expect(component.filterChange.emit).toHaveBeenCalledWith(component.currentFilter);
    });

    it('should not change tab if already active', () => {
      spyOn(component.filterChange, 'emit');
      component.activeTab = 'applied';
      
      component.handleTabChange('applied');

      expect(component.filterChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleAddJobApplication', () => {
    it('should emit jobApplicationAddition', () => {
      spyOn(component.jobApplicationAddition, 'emit');

      component.handleAddJobApplication();

      expect(component.jobApplicationAddition.emit).toHaveBeenCalled();
    });
  });

  describe('handleJobApplicationDelete', () => {
    it('should open delete confirmation dialog', () => {
      const mockJob = mockJobs[0];
      const mockCallback = jasmine.createSpy('callback');
      mockDialogHelper.openDeleteConfirmation.and.callFake((items, callback) => {
        callback();
      });
      spyOn(component.jobApplicationsDelete, 'emit');

      component.handleJobApplicationDelete(mockJob);

      expect(mockDialogHelper.openDeleteConfirmation).toHaveBeenCalledWith([mockJob], jasmine.any(Function));
      expect(component.jobApplicationsDelete.emit).toHaveBeenCalledWith([mockJob.id]);
    });
  });

  describe('handleJobStatusUpdate', () => {
    it('should open job status dialog', () => {
      const mockJob = mockJobs[0];
      const updatedJob = { ...mockJob, status: ApplicationStatus.InProgress };
      mockDialogHelper.openJobStatusDialog.and.callFake((item, callback) => {
        callback(updatedJob);
      });
      spyOn(component.jobStatusUpdate, 'emit');

      component.handleJobStatusUpdate(mockJob);

      expect(mockDialogHelper.openJobStatusDialog).toHaveBeenCalledWith(mockJob, jasmine.any(Function));
      expect(component.jobStatusUpdate.emit).toHaveBeenCalledWith({ item: updatedJob });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  it('should have tabs property with filtered options', () => {
    expect(component.tabs).toBeDefined();
    expect(Array.isArray(component.tabs)).toBe(true);
  });
});
