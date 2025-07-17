import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutStateService {

  headerLoader = new Subject<boolean>();

  constructor() { }
}
