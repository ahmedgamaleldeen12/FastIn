import { HttpServiceBaseService } from 'src/app/base/services/http-service-base.service';
import { ConfigService } from './../config/config.service';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/internal/operators/timeout';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export abstract class HttpService  extends HttpServiceBaseService{
  private readonly  configService = inject(ConfigService) ;
  public serverUrl = this.configService.HOST_API;
  public Timeout = 300000;
  http = inject(HttpClient)
  constructor() { 
    super();
  }
  getAttendanceStatus(url: string, data?: any) {
    return this.http
      .get(this.serverUrl + this.baseUrl + url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  /* Post */
  postReq(url: string, data: any) {
    // return this.http.post(this.serverUrl + this.baseUrl + url, data);

    return this.http
      .post(this.serverUrl + this.baseUrl + url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  postReqWithUrl(url: string, data: any) {
    return this.http
      .post(url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }
  /* Get  */
  getReq(url: string, data?: any) {
    return this.http
      .get(this.serverUrl + this.baseUrl + url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }
  getReqWithUrl(url: string, data?: any) {
    return this.http
      .get(url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }
  /* Get Paged */
  getPaged(url: string, data: any): Observable<any> {
    return this.http
      .post(this.serverUrl + this.baseUrl + url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  /* Get With Query Parameters */
  getQueryReq(url: string, params?: any) {
    return this.http
      .get(this.serverUrl + this.baseUrl + url, { params })
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  /* Post With Query Parameters */
  postQueryReq(url: string, params?: any, data?: any) {
    // // console.log('serverUrl', this.serverUrl + this.baseUrl + url);
    return this.http
      .post(this.serverUrl + this.baseUrl + url, data, { params })
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }
  /* Get With Url Parameter  */
  getHeaderReq(url: string, data: string) {
    return this.http
      .get(this.serverUrl + this.baseUrl + url + '/' + data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  /* Put Lookup */

  putReq(url: string, data?: any) {
    return this.http
      .put(this.serverUrl + this.baseUrl + url, data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  /* Delete Lookup */
  deleteReq(url: string, data?: any) {
    return this.http
      .delete(this.serverUrl + this.baseUrl + url + '/' + data)
      .pipe(catchError(this.handleError()), timeout(this.Timeout));
  }

  private handleError() {
    return (error: any): Observable<any> => {
      const message = this.getErrorMessage(error);
      if (message) {
        // console.log('alert error: ', message);
        // this.alertService.openAlert(message);
      }
      return throwError(message);
    };
  }

  getErrorMessage(error : any): string {
    let message = '';
    if (error.status === 400) {
      const errors: Array<any> = error.error.errors;
      if (errors instanceof Object) {
        Object.keys(errors).forEach((key:any) => {
          message += errors[key][0] + '\n';
        });
      } else if (typeof error.error.data === 'string') {
        // the error is validation error BadRequest('error message')
        message = error.error.data;
      } else {
        message = 'Bad Request';
      }
    } else if (error.status === 500) {
      // console.log('error.status',error);

      message = error.error.data;
      // message = 'Unexpected error happened.';
    } else {
      message = error.error.data;
    }

    return message;
  }
}
