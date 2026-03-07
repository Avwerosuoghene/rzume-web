import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableSkeletonComponent } from './table-skeleton.component';

describe('TableSkeletonComponent', () => {
  let component: TableSkeletonComponent;
  let fixture: ComponentFixture<TableSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table skeleton structure', () => {
    const compiled = fixture.nativeElement;
    const tableContainer = compiled.querySelector('.table-container');
    const skeletonTable = compiled.querySelector('.skeleton-table');
    
    expect(tableContainer).toBeTruthy();
    expect(skeletonTable).toBeTruthy();
  });

  it('should render header row with correct elements', () => {
    const compiled = fixture.nativeElement;
    const headerRow = compiled.querySelector('.skeleton-header');
    const headerCells = compiled.querySelectorAll('.skeleton-header-cell');
    const checkbox = compiled.querySelector('.skeleton-checkbox');
    const actions = compiled.querySelector('.skeleton-actions');
    
    expect(headerRow).toBeTruthy();
    expect(headerCells.length).toBe(5);
    expect(checkbox).toBeTruthy();
    expect(actions).toBeTruthy();
  });

  it('should render 5 data rows', () => {
    const compiled = fixture.nativeElement;
    const dataRows = compiled.querySelectorAll('.skeleton-row:not(.skeleton-header)');
    
    expect(dataRows.length).toBe(5);
  });

  it('should render correct elements in data rows', () => {
    const compiled = fixture.nativeElement;
    const firstDataRow = compiled.querySelector('.skeleton-row:not(.skeleton-header)');
    const cells = firstDataRow.querySelectorAll('.skeleton-cell');
    const statusCell = firstDataRow.querySelector('.skeleton-status');
    
    expect(cells.length).toBe(5);
    expect(statusCell).toBeTruthy();
  });

  it('should render pagination skeleton', () => {
    const compiled = fixture.nativeElement;
    const pagination = compiled.querySelector('.skeleton-pagination');
    const paginationInfo = compiled.querySelector('.skeleton-pagination-info');
    const pageButtons = compiled.querySelectorAll('.skeleton-page-btn');
    
    expect(pagination).toBeTruthy();
    expect(paginationInfo).toBeTruthy();
    expect(pageButtons.length).toBe(5);
  });

  it('should have shimmer animation on skeleton elements', () => {
    const compiled = fixture.nativeElement;
    const skeleton = compiled.querySelector('.skeleton');
    const styles = getComputedStyle(skeleton);
    
    expect(styles.animation).toContain('shimmer');
  });

  it('should have responsive table with min-width', () => {
    const compiled = fixture.nativeElement;
    const skeletonTable = compiled.querySelector('.skeleton-table');
    const styles = getComputedStyle(skeletonTable);
    
    expect(styles.minWidth).toBe('800px');
  });
});
