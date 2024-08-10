import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  headerLoader = new Subject<boolean>();

  constructor() { }
}
