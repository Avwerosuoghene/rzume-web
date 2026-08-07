import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { RolesComponent } from './roles.component';
import { RoleCardComponent } from '../../../components/role-card/role-card.component';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { RoleService } from '../../../core/services/role.service';
import { RoleStateService } from '../../../core/services/role-state.service';
import { APIResponse } from '../../../core/models';
import { IconStat } from '../../../core/models/enums';
import { ROLE_ERROR_MESSAGES } from '../../../core/models/constants/role.constants';
import { Role } from '../../../core/models/interface/role.models';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let dialogHelperServiceSpy: jasmine.SpyObj<DialogHelperService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let roleStateService: RoleStateService;

  const okResponse = <T>(data: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });

  const role = (id: string): Role => ({
    id,
    title: 'UIUX Designer',
    industryName: 'Technology',
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);
    dialogHelperServiceSpy = jasmine.createSpyObj('DialogHelperService', ['openAddRoleDialog', 'openInfoDialog', 'openDeleteRoleConfirmation']);
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['getRoles', 'getRoleStats']);
    roleServiceSpy.getRoles.and.returnValue(of(okResponse({ count: 0, roles: [] })));

    await TestBed.configureTestingModule({
      imports: [RolesComponent, RoleCardComponent, MatIconModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        RoleStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    roleStateService = TestBed.inject(RoleStateService);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call roleService.getRoles() on init', () => {
    fixture.detectChanges();
    expect(roleServiceSpy.getRoles).toHaveBeenCalled();
  });

  it('should never call roleService.getRoleStats() (stats are derived client-side, see roles-api-gap)', () => {
    fixture.detectChanges();
    expect(roleServiceSpy.getRoleStats).not.toHaveBeenCalled();
  });

  it('should render app-empty-state when roles$ emits an empty array', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('should render one RoleCardComponent per role in roles$ and hide the empty state', () => {
    fixture.detectChanges();
    roleStateService.setRoles([role('1'), role('2')]);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
    expect(cards).toHaveSize(2);
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should render a newly created role reactively after roleState.addRole fires', () => {
    fixture.detectChanges();
    roleStateService.addRole(role('1'));
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
    expect(cards).toHaveSize(1);
  });

  it('should show a loading indicator and hide the empty state while loading$ is true', () => {
    fixture.detectChanges();
    roleStateService.setLoading(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="roles-loading"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should render createdCount/maxAllowed from stats$ in the limit bar', () => {
    fixture.detectChanges();
    roleStateService.setRoles([role('1')]);
    fixture.detectChanges();

    const limitText = fixture.nativeElement.querySelector('.role-limit-text')?.textContent ?? '';
    expect(limitText).toContain('1');
    expect(limitText).not.toContain('0 /');
  });

  it('should open the shared error modal (IconStat.failed) when getRoles() fails, matching the app-wide error convention', () => {
    roleServiceSpy.getRoles.and.returnValue(throwError(() => new Error('network down')));

    fixture.detectChanges();

    expect(dialogHelperServiceSpy.openInfoDialog).toHaveBeenCalledWith(IconStat.failed, ROLE_ERROR_MESSAGES.LOAD_FAILED);
  });

  it('should open the delete confirmation when a role card emits delete', () => {
    fixture.detectChanges();
    const targetRole = role('1');
    roleStateService.setRoles([targetRole]);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(RoleCardComponent));
    card.triggerEventHandler('delete', targetRole);

    expect(dialogHelperServiceSpy.openDeleteRoleConfirmation).toHaveBeenCalledWith(targetRole, jasmine.any(Function));
  });

});
