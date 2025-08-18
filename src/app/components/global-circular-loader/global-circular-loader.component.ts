import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-circular-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-circular-loader.component.html',
  styleUrl: './global-circular-loader.component.scss'
})
export class GlobalCircularLoaderComponent {
  @Input() isLoading: boolean = false;

}
