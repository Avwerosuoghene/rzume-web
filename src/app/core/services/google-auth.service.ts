import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  constructor() { }

  static loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-js')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-js';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.head.appendChild(script);
    });
  }


}
