import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from 'src/app/core/http/http.service';
import { LogFilter } from 'src/app/shared/models/filter';
import { LoadOptions } from 'src/app/shared/models/loadOpt';

@Injectable({
  providedIn: 'root'
})
export class LogService extends HttpService {

  get baseUrl(): string {
    return 'EmployeeAttedanceLogs/';
  }

  getLogs(filter?: LogFilter, loadOpts?: LoadOptions) {
    return this.postQueryReq('GetAllPagedMobile', loadOpts, filter);
  }
  
  override getAttendanceStatus(): Observable<any> {
    return this.http.get(this.serverUrl + 'EmployeeLogs/GetLogTypes');
  }
}
