import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ConfigService } from '../../core/services/config.service';
import { GOOGLE_SCRIPT_ERROR } from '../../core/models';

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


  constructor(private cdr: ChangeDetectorRef, private authService: AuthenticationService, private configService: ConfigService) {
  }


  ngOnInit(): void {
    this.authService.loadGoogleScript().catch(this.handleScriptError);
  }

  handleScriptError = (err: any): void => {
    console.error(GOOGLE_SCRIPT_ERROR, err);
  };

  initiateGoogleSignup() {
    this.toggleLoader(true);
    this.createGoogleWrapper().click();
  }



  createGoogleWrapper = () => {
    const googleLoginWrapper = document.createElement('div');
    googleLoginWrapper.style.display = 'none';
    googleLoginWrapper.classList.add('custom-google-button');
    document.body.appendChild(googleLoginWrapper);
    google.accounts.id.initialize({
      client_id: this.configService.apiUrls.googleAuth,
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

  toggleLoader(loaderIsActive:boolean) {
    this.loaderIsActive = loaderIsActive;
    this.cdr.detectChanges();
  }

  get isGoogleBtnDisabled(): boolean {
    return this.loaderIsActive;
  }
}
