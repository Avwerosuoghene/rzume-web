import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { RouterModules } from '../../core/modules/router-modules';
import { BODY_SCROLL_DEFAULT, BODY_SCROLL_LOCK, MOBILE_BREAKPOINT } from '../../core/models/constants/shared.constants';
import { UiStateService } from '../../core/services/ui-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideBarComponent, RouterModules],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  sidebarOpen = false;
  isMobileView = false;
  subscriptions = new Subscription();
  private isInitialized = false;

  constructor(
    private uiState: UiStateService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.updateLayout();
    this.initiateSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isInitialized = true;
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  initiateSubscriptions() {
    this.subscriptions.add(
      this.uiState.isMobile$.subscribe(isMobile => {
        this.isMobileView = isMobile;
      })
    );
  }

  @HostListener('window:resize')
  onResize() {
    this.updateLayout();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.lockScroll(this.sidebarOpen);
  }

  closeSidebar() {
    this.ngZone.run(() => {
      if (!this.isInitialized) {
        setTimeout(() => this.closeSidebar(), 50);
        return;
      }
      console.log('Main component closeSidebar called');
      this.sidebarOpen = false;
      this.lockScroll(false);
      this.cdr.detectChanges();
    });
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