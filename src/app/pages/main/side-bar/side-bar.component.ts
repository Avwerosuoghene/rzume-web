import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModules } from '../../../core/modules/router-modules';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../core/services/config.service';
import { MatIconModule } from '@angular/material/icon';
import { SideBarElement } from '../../../core/models';
import { getBaseRoutes, getFeatureRoutes } from '../../../core/helpers/dashboard.utils';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModules, MatIconModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent implements OnInit {
  constructor(private configService: ConfigService, private cdr: ChangeDetectorRef) { }
  @Output() closeSidebar = new EventEmitter<void>();
  sideBarElements: Array<SideBarElement> = [];

  ngOnInit(): void {
    this.initializeSideBarNavs();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  onClose(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeSidebar.emit();
  }

  private initializeSideBarNavs(): void {
    const baseRoutes = getBaseRoutes();
    const featureRoutes = getFeatureRoutes(this.configService);

    this.sideBarElements = [...baseRoutes, ...featureRoutes];
  }

}
