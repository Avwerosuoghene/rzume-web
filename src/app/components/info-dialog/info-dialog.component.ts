import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InfoDialogData, IconStat } from '../../core/models';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {

  infoIcon!: IconStat;
  infoMessage!: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public infoDialogData: InfoDialogData
  ) {
    this.infoIcon = this.infoDialogData.statusIcon;
    this.infoMessage = this.infoDialogData.infoMessage;
    console.log(this.infoMessage);

    if (this.infoIcon === 'close' && (this.infoMessage === undefined || this.infoMessage === '')) this.infoMessage = 'Something went wrong';

  }




}
