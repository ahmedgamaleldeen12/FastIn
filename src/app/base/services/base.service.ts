import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService extends HttpService {
  get baseUrl(): string {
    return '';
  }

  getGridData(mainUrl: string, filter?: any, loadOpts?: any) {
    return this.postQueryReq(mainUrl, loadOpts, filter);
  }
}
