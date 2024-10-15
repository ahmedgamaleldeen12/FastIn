import { sign } from './../../../shared/models/sign';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from 'src/app/core/http/http.service';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root',
})
export abstract class SignService extends HttpService {
  constructor() {
    super();
  }
  getLocationGps(locationGps: any): Observable<any> {
    return this.postReqWithUrl(this.serverUrl + 'WorkCenters/LocationProofValidation', locationGps);
  }

  IsMobileUserHasAcceptedFace(mobileUserId: any) {
    return this.getReqWithUrl(this.serverUrl + `MobileUserFaceRegistration/IsMobileUserHasAcceptedFace/${mobileUserId}`);
  }

  saveSign(signData: sign) {
    return this.postReqWithUrl(this.serverUrl + 'EmployeeAttendanceLogs/AddMobileSign', signData);
  }
}
