import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { ProfileManagementService } from './profile-management.service';
import { Resume } from '../models/interface/profile.models';
import { APIResponse } from '../models';

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
}
