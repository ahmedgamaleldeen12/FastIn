import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Platform } from '@ionic/angular/standalone';
import { IonicStorageService } from '../storage/ionic-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  langs = ['en', 'fr'];
  lang :any;
  currentLanguage = new BehaviorSubject<string>('en');
  private renderer!: Renderer2;


  public currentLang: any;
  public multiLang: boolean = false;
  // flLang:any;
  // slLang:any;
  
  constructor(
    public translate: TranslateService,
    private rendererFactory: RendererFactory2,
    private platform: Platform,
    private storage: IonicStorageService,
    @Inject(DOCUMENT) private doc : any 
  ) {
    this.checkLanguageInStorage();
  }
  async checkLanguageInStorage() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    const currentLang = await (await this.storage.get('language')).value;
    this.lang = (currentLang != null && currentLang != "") ? currentLang : 'en';
    this.setLanguage(this.lang)
  }

  async setDefaultLanguage() {
    this.translate.addLangs(['en', 'fr', 'ar']);
    const currentLang = await (await this.storage.get('language')).value;
    this.lang = (currentLang != null && currentLang != "") ? currentLang : 'en';
    await this.storage.set('language',this.lang);
    this.translate.setDefaultLang(this.lang);
    this.translate.use(this.lang === undefined ? 'en' : this.lang);
    document.body.classList.remove('lang-en', 'lang-ar');
    this.setAppDirection();
  }
  setAppDirection(): void {
    const platform = this.platform.is('desktop');
    // if this is a desktop app change the direction of the styles
    // if (platform) {
    if (this.lang === 'ar') {
      this.doc.dir = 'rtl';
      document.body.classList.add('lang-ar');

    } else {
      this.doc.dir = 'ltr';
      document.body.classList.add('lang-en');
    }
    // }
  }

  useLanguage(lang: string): void {
    this.translate.setDefaultLang(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }

  setLanguage(lang: string) {
    this.currentLanguage.next(lang);
    this.lang = lang;
    this.setAppDirection();
    this.translate.use(lang);
  }
  isEnglish(): boolean {
    const currentLang = this.translate.currentLang;
    if (currentLang === 'en') {
      return true;
    } else {
      return false;
    }
  }

  // async currentOrgLanguage() {
  //   let Organizations_data = await this.storage.getObject('organization');
  //   if (Organizations_data != null) {
  //     let flLang = Organizations_data['primaryLanguage'];
  //     this.flLang = flLang;
  //     let slLang = Organizations_data['secondaryLanguage'];
  //     this.slLang = slLang;
  //     if (slLang != null && slLang != "") {
  //       this.multiLang = true;
  //     }
  //     else {
  //       this.multiLang = false;
  //     }
  //     if (slLang != null && slLang != "")
  //     {
  //       this.currentLang = this.lang.toLowerCase() == slLang.toLowerCase() ?
  //       "Sl" : this.lang.toLowerCase() == flLang.toLowerCase() ? "Fl" : "";
  //     }
      
  //   }
  //   else{
  //     this.currentLang = "Fl";
  //   }

  // }
}
