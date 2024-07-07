import { Component, Inject, InjectionToken, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogData } from '../../core/models/dialog-models';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {

  infoIcon: string = 'done';
  infoMessage!: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public infoDialogData: InfoDialogData
  ) {
    this.infoMessage = this.infoDialogData.infoMessage;
  }




}
