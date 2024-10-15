import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  HOST_API !: string ;
  constructor() { 
    this.HOST_API = environment.HOST_API;
  }

}
