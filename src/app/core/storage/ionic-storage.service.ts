import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
@Injectable({
  providedIn: 'root',
})
export class IonicStorageService {
  constructor() {}
  async set(key: string, value?: any) {
    if (value !== null && value !== undefined) {
      value = encodeURI(value);
      await Preferences.set({ key, value });
    }
  }
  async setObject(key: string, value?: any) {
    await Preferences.set({
      key,
      value: encodeURIComponent(JSON.stringify(value)),
    });
  }

  async get(key: string) {
    const result = await Preferences.get({ key });
    result.value =
      result.value !== null && result.value !== ''
        ? decodeURI(result.value)
        : result.value;
    return result;
  }

  async getObject(key: string) {
    const ret = await Preferences.get({ key });
    return JSON.parse(decodeURIComponent(ret.value!));
  }
  async removeItem(key: string) {
    await Preferences.remove({ key });
  }

  async keys() {
    const { keys } = await Preferences.keys();
    return keys;
  }

  async clear() {
    await Preferences.clear();
  }
}
