import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PolicyDialogData } from '../../core/models/interface/dialog-models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

@Component({
  selector: 'app-policy-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './policy-dialog.component.html',
  styleUrl: './policy-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyDialogComponent implements OnInit {
  processedContent: SafeHtml = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PolicyDialogData,
    private dialogRef: MatDialogRef<PolicyDialogComponent>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.processedContent = this.sanitizer.bypassSecurityTrustHtml(this.data.content);
  }

  onClose(): void {
    this.dialogRef.close({
      status: DialogCloseStatus.Cancelled
    });
  }
}
