import { SessionStorageData } from "../models";

export class SessionStorageUtil {
  static setItem<K extends keyof SessionStorageData>(key: K, value: SessionStorageData[K]): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static getItem<K extends keyof SessionStorageData>(key: K): SessionStorageData[K] | null {
    const item = sessionStorage.getItem(key);
    return item ? (JSON.parse(item) as SessionStorageData[K]) : null;
  }

  static removeItem<K extends keyof SessionStorageData>(key: K): void {
    sessionStorage.removeItem(key);
  }
}
