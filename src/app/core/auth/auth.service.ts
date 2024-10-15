import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { APIURL } from '../Apis/api';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";


@Injectable({
  providedIn: 'root'
})
export abstract class AuthService extends HttpService {
  private readonly Router = inject(Router);

  get baseUrl(): string {
    return 'Accounts/';
  }

  public userProfile: UserProfile = { claims: null, isManager: false, organizationData: null };

  login(loginData: any): Observable<any> {
    return this.postReq(APIURL.login, loginData);
  }

  redirectToLogin(): void {
    this.Router.navigate(['/login']);
  }

  changePassword(model: any): Observable<any> {
    return this.http.post(this.serverUrl + APIURL.changePassword, model);
  }

  forgetPassword(model: any) {
    return this.http.post(this.serverUrl + APIURL.forgetPassword, model);
  }

  getOrganiztionByCode(orgCode: any): Observable<any> {
    return this.http.get(`${this.serverUrl}Organizations/GetOrganizationWithHostsByCode/${orgCode}`);
  }

  OrganizationCount(): Observable<any> {
    return this.http.get(`${this.serverUrl}Organizations/OrganizationCount`);
  }

  setHost(hostUrl: any) {
    this.serverUrl = hostUrl;
  }

  checkToken(myRawToken: any) {

    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(myRawToken);
    const expirationDate = helper.getTokenExpirationDate(myRawToken);
    const isExpired = helper.isTokenExpired(myRawToken);
  }
  validateToken(token: any) {
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    const isExpired = helper.isTokenExpired(token);
    if (!isExpired) {
      this.userProfile.claims = decodedToken;
    }
    return !isExpired;
  }
}

interface UserProfile {
  isManager: boolean,
  organizationData: any,
  claims: any
}
