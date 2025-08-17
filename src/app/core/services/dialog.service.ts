import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openDialog<ComponentName, DialogData>(component: ComponentType<ComponentName>, dialogData: DialogData, options?: MatDialogConfig<DialogData>): MatDialogRef<ComponentName> {
    return this.dialog.open(component, {
      data: dialogData,
      backdropClass: "blurred",
      ...options
    });
  }
}
