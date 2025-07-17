import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { AuthenticationService } from '../../core/services/authentication.service';

declare let google: any;

@Component({
  selector: 'app-google-sign-in',
  templateUrl: './google-sign-in.component.html',
  styleUrl: './google-sign-in.component.scss',
  standalone: true,
  imports: [CircularLoaderComponent],
})

export class GoogleSignInComponent implements OnInit {

  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() tokenEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() googleBtnText!: string;
  loaderIsActive: boolean = false;


  constructor(private cdr: ChangeDetectorRef, private authService: AuthenticationService) {
  }


  ngOnInit(): void {
    this.authService.loadGoogleScript().then(() => {
    }).catch(err => {
      console.error('Google API script loading error:', err);
    });

  }

  initiateGoogleSignup() {
    this.loaderIsActive = true;
    this.createGoogleWrapper().click();
  }



  createGoogleWrapper = () => {
    const googleLoginWrapper = document.createElement('div');
    googleLoginWrapper.style.display = 'none';
    googleLoginWrapper.classList.add('custom-google-button');
    document.body.appendChild(googleLoginWrapper);
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      ux_mode: 'popup',
      callback: (token: string) => {
        this.tokenEmitter.emit(token);

      },
    });
    google.accounts.id.renderButton(googleLoginWrapper, {
      type: 'icon',
      width: 200,
    });

    const googleLoginWrapperButton = googleLoginWrapper.querySelector(
      'div[role=button]'
    ) as HTMLElement;

    return {
      click: () => {
        googleLoginWrapperButton?.click();
      },
    };
  };

  turnOffLoader() {
    this.loaderIsActive = false;
    this.cdr.detectChanges();
  }

  get isGoogleBtnDisabled(): boolean {
    return this.loaderIsActive;
  }
}
