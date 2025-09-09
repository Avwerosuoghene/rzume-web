import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { RouterModules } from '../../core/modules/router-modules';
import { BODY_SCROLL_DEFAULT, BODY_SCROLL_LOCK, MOBILE_BREAKPOINT } from '../../core/models';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideBarComponent, RouterModules],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  sidebarOpen = false;
  isMobileView = window.innerWidth < MOBILE_BREAKPOINT;

  ngOnInit() {
    this.updateLayout();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateLayout();
  }

  toggleSidebar() {
    if (this.isMobileView) {
      this.sidebarOpen = !this.sidebarOpen;
      this.lockScroll(this.sidebarOpen);
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.lockScroll(false);
  }

  updateLayout() {
    this.isMobileView = window.innerWidth < MOBILE_BREAKPOINT;
    if (!this.isMobileView) {
      this.closeSidebar(); 
    }
  }

  lockScroll(lock: boolean) {
    document.body.style.overflow = lock ? BODY_SCROLL_LOCK : BODY_SCROLL_DEFAULT;
  }
}