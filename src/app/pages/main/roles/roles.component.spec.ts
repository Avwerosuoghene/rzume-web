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
import { SearchStateService } from '../../../core/services/search-state.service';
import { APIResponse } from '../../../core/models';
import { IconStat } from '../../../core/models/enums';
import { ROLE_ERROR_MESSAGES } from '../../../core/models/constants/role.constants';
import { Role } from '../../../core/models/interface/role.models';
import { RoleHelper } from '../../../core/helpers/role.helper';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let dialogHelperServiceSpy: jasmine.SpyObj<DialogHelperService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let roleStateService: RoleStateService;
  let searchStateService: SearchStateService;

  const okResponse = <T>(data: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });

  const role = (id: string, overrides: Partial<Role> = {}): Role => ({
    id,
    title: 'UIUX Designer',
    industryName: 'Technology',
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);
    dialogHelperServiceSpy = jasmine.createSpyObj('DialogHelperService', ['openAddRoleDialog', 'openInfoDialog', 'openDeleteRoleConfirmation', 'openDeleteRoleDocumentConfirmation', 'openEditRoleDialog']);
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['getRoles', 'getRoleStats']);
    roleServiceSpy.getRoles.and.returnValue(of(okResponse({ count: 0, roles: [] })));

    await TestBed.configureTestingModule({
      imports: [RolesComponent, RoleCardComponent, MatIconModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        RoleStateService,
        SearchStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    roleStateService = TestBed.inject(RoleStateService);
    searchStateService = TestBed.inject(SearchStateService);
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

  it('should split the Add Role button\'s label into an always-visible "Add" and a breakpoint-hidden " New Role" (mobile shows just "Add"), matching the desktop-actions/mobile-actions convention', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.add-role-btn') as HTMLElement;
    expect(button.textContent).toContain('Add');

    const fullLabel = button.querySelector('.add-role-btn-full-label');
    expect(fullLabel).toBeTruthy();
    expect(fullLabel!.textContent).toContain('New Role');
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

  it('should open the delete-document confirmation when a role card emits deleteDocument', () => {
    fixture.detectChanges();
    const targetRole = role('1');
    roleStateService.setRoles([targetRole]);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(RoleCardComponent));
    card.triggerEventHandler('deleteDocument', { role: targetRole, documentId: 'doc-1' });

    expect(dialogHelperServiceSpy.openDeleteRoleDocumentConfirmation).toHaveBeenCalledWith(targetRole, 'doc-1', jasmine.any(Function));
  });

  it('should open the edit-role dialog when a role card emits editRole', () => {
    fixture.detectChanges();
    const targetRole = role('1');
    roleStateService.setRoles([targetRole]);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(RoleCardComponent));
    card.triggerEventHandler('editRole', targetRole);

    expect(dialogHelperServiceSpy.openEditRoleDialog).toHaveBeenCalledWith(targetRole, jasmine.any(Function));
  });

  describe('search (page-aware search bar — see global-search plan)', () => {
    const uxRole = role('1', { title: 'UIUX Designer', industryName: 'Technology' });
    const backendRole = role('2', { title: 'Backend Engineer', industryName: 'Technology' });
    const salesRole = role('3', { title: 'Sales Lead', industryName: 'Retail' });

    beforeEach(() => {
      fixture.detectChanges();
      roleStateService.setRoles([uxRole, backendRole, salesRole]);
      fixture.detectChanges();
    });

    it('should show every role when the search term is empty', () => {
      const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
      expect(cards).toHaveSize(3);
    });

    it('should filter roles by title, case-insensitively', () => {
      searchStateService.updateSearchTerm('designer');
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
      expect(cards).toHaveSize(1);
      expect(cards[0].componentInstance.role).toEqual(uxRole);
    });

    it('should filter roles by industry, case-insensitively', () => {
      searchStateService.updateSearchTerm('RETAIL');
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
      expect(cards).toHaveSize(1);
      expect(cards[0].componentInstance.role).toEqual(salesRole);
    });

    it('should match either title or industry, showing all roles that match either field', () => {
      searchStateService.updateSearchTerm('technology');
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
      expect(cards).toHaveSize(2);
    });

    it('should show a "no roles match your search" empty state when the term matches nothing, distinct from the "no roles yet" state', () => {
      searchStateService.updateSearchTerm('nonexistent role title');
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('app-empty-state');
      expect(emptyState).not.toBeNull();
      expect(emptyState.textContent).toContain('No roles match your search');
      expect(fixture.debugElement.queryAll(By.directive(RoleCardComponent))).toHaveSize(0);
    });

    it('should show every role again once the search term is cleared', () => {
      searchStateService.updateSearchTerm('designer');
      fixture.detectChanges();
      searchStateService.updateSearchTerm('');
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(RoleCardComponent));
      expect(cards).toHaveSize(3);
    });

    it('should call searchStateService.updateSearchTerm when the desktop search box emits', () => {
      spyOn(searchStateService, 'updateSearchTerm');
      component.onSearchChange('backend');

      expect(searchStateService.updateSearchTerm).toHaveBeenCalledWith('backend');
    });
  });

  describe('role limit subtitle (must reflect the real, plan-derived limit — not a hardcoded number)', () => {
    // roleLimit is set from RoleHelper.getRoleLimit() in a field initializer, so the spy has to be
    // in place before the component (and therefore its constructor) is created — the shared
    // beforeEach's fixture is already too late for this.
    function createWithRoleLimit(limit: number) {
      TestBed.resetTestingModule();
      analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);
      dialogHelperServiceSpy = jasmine.createSpyObj('DialogHelperService', ['openAddRoleDialog', 'openInfoDialog', 'openDeleteRoleConfirmation', 'openDeleteRoleDocumentConfirmation', 'openEditRoleDialog']);
      roleServiceSpy = jasmine.createSpyObj('RoleService', ['getRoles', 'getRoleStats']);
      roleServiceSpy.getRoles.and.returnValue(of(okResponse({ count: 0, roles: [] })));
      spyOn(RoleHelper, 'getRoleLimit').and.returnValue(limit);

      TestBed.configureTestingModule({
        imports: [RolesComponent, RoleCardComponent, MatIconModule],
        providers: [
          { provide: AnalyticsService, useValue: analyticsServiceSpy },
          { provide: DialogHelperService, useValue: dialogHelperServiceSpy },
          { provide: RoleService, useValue: roleServiceSpy },
          RoleStateService,
          SearchStateService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RolesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }

    it('should state the actual configured limit, not a hardcoded word, when it differs from the old default of two', () => {
      createWithRoleLimit(5);

      const subtitle = fixture.nativeElement.querySelector('.active-roles-subtitle').textContent;
      expect(subtitle).toContain('5 roles');
      expect(subtitle.toLowerCase()).not.toContain('two');
    });

    it('should use the singular "role" when the limit is exactly 1', () => {
      createWithRoleLimit(1);

      const subtitle = fixture.nativeElement.querySelector('.active-roles-subtitle').textContent;
      expect(subtitle).toContain('1 role');
      expect(subtitle).not.toContain('1 roles');
    });
  });

});
