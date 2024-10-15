import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular/standalone';
import { ConfigService } from '../config/config.service';
import { IonicStorageService } from '../storage/ionic-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly JWT_TOKEN = 'inquiry-token';
  private readonly REFRESH_TOKEN = 'inquiry-refresh_token';

  constructor(
    private http: HttpClient,
    public platform: Platform,
    private router: Router,

    private configService: ConfigService,
    private Storage: IonicStorageService,
    public localize: TranslateService
  ) { }

  async refreshToken() {
    let serverUrl = this.configService.HOST_API;
    let tokens: Tokens = {
      token: (await this.getJwtToken()).value!,
      refreshToken: (await this.getRefreshToken()).value!,
      isMobileBrowser:
        this.platform.is('desktop') || this.platform.is('mobileweb')
          ? true
          : false,
      rememberMe:
        (await this.Storage.get('rememberMe')).value == 'true' ? true : false,
    };

    let refreshtokens: Tokens = await this.http
      .post<Tokens>(
        serverUrl + 'Accounts/RefreshTokenForMobile/refresh-token',
        tokens
      )
      .toPromise() as Tokens;
    this.storeJwtToken(refreshtokens?.token ?? '');
    return refreshtokens;
  }


  getJwtToken() {
    return this.Storage.get(this.JWT_TOKEN);
  }
  getRefreshToken() {
    return this.Storage.get(this.REFRESH_TOKEN);
  }
  storeJwtToken(jwt: string) {
    this.Storage.set(this.JWT_TOKEN, jwt);
  }

  GetAllPrimaryKey(): Observable<any> {
    let serverUrl = this.configService.HOST_API
    return this.http.get(serverUrl + ' UniversitySettings/GetAllPrimaryKey');
  }

  storeTokens(tokens: any, claims: any, rememberMe: any) {
    this.Storage.set('inquiry-claims', JSON.stringify(claims));
    this.Storage.set(this.JWT_TOKEN, tokens.token);
    this.Storage.set(this.REFRESH_TOKEN, tokens.refreshToken);
    this.Storage.set('rememberMe', rememberMe);
  }

  removeTokens() {
    this.Storage.removeItem('inquiry-claims');
    this.Storage.removeItem(this.JWT_TOKEN);
    this.Storage.removeItem(this.REFRESH_TOKEN);
    this.Storage.removeItem('rememberMe');
  }

  async isLoggedIn()  {
    const token = (await this.getJwtToken()).value
    return !!token ;
  }
}


export class Tokens {
  token?: string;
  refreshToken?: string;
  message?: string;
  errorType?: number;
  isMobileBrowser?: boolean;
  rememberMe?: boolean;
}

export class storageUpdateParameters {
  currentToken?: string;
  userInquiryId?: string;
}
