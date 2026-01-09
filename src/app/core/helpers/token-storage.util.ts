const TOKEN_KEY = 'authToken';
const STORAGE_TYPE_KEY = 'authStorageType';

export class TokenStorageUtil {
  
  static setToken(token: string, persistSession: boolean): void {
    const storage = persistSession ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_TYPE_KEY, persistSession ? 'local' : 'session');
  }

  static getToken(): string | null {
    const storageType = localStorage.getItem(STORAGE_TYPE_KEY);
    
    if (storageType === 'local') {
      return localStorage.getItem(TOKEN_KEY);
    } else if (storageType === 'session') {
      return sessionStorage.getItem(TOKEN_KEY);
    }
    
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}
