import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { ProfileManagementService } from './profile-management.service';
import { Resume } from '../models/interface/profile.models';
import { SelectOption } from '../models/interface/form-input.interface';
import { APIResponse } from '../models';
import { DialogCloseStatus } from '../models/enums/dialog.enums';
import { MainRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { PROFILE_TABS } from '../models/constants/profile.constants';

@Injectable({
  providedIn: 'root'
})
export class DocumentHelperService {
  private resumesSubject = new BehaviorSubject<Resume[]>([]);
  public resumes$: Observable<Resume[]> = this.resumesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor(private profileService: ProfileManagementService) { }

  fetchResumes(): void {
    this.isLoadingSubject.next(true);
    this.profileService.getResumes()
      .pipe(finalize(() => this.isLoadingSubject.next(false)))
      .subscribe({
        next: (response: APIResponse<Resume[]>) => {
          if (response.success && response.data) {
            this.setResumes(response.data);
          }
        },
        error: () => {}
      });
  }

  setResumes(resumes: Resume[]): void {
    this.resumesSubject.next(resumes);
  }

  getResumes(): Resume[] {
    return this.resumesSubject.value;
  }

  clearResumes(): void {
    this.resumesSubject.next([]);
  }

  getSelectOptions(excludeIds: string[] = []): SelectOption[] {
    const all = this.getResumes();
    const options: SelectOption[] = all
      .filter(r => !excludeIds.includes(r.id))
      .map(r => ({ value: r.id, label: r.fileName }));

    if (!options.length) {
      options.push({ value: 'upload-resume', label: '+ Upload Document' });
    }

    return options;
  }

  handleSelection(
    event: Event,
    router: Router,
    dialogRef: { close(result?: unknown): void },
    onSelect?: (resumeId: string) => void
  ): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'upload-resume') {
      router.navigate(
        [`/${RootRoutes.main}/${MainRoutes.profileManagement}`],
        { queryParams: { tab: PROFILE_TABS.DOCUMENTS } }
      );
      dialogRef.close({ status: DialogCloseStatus.Cancelled });
      return;
    }

    onSelect?.(value);
  }
}
