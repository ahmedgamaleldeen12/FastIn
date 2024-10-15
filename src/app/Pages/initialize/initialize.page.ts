import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonFooter ,LoadingController, Platform } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/auth/token.service';
import { BaseClass } from 'src/app/base/components/base-component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslationService } from 'src/app/core/localization/translation.service';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.page.html',
  styleUrls: ['./initialize.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule ,IonFooter, TranslateModule ],
  providers:[]
})
export class InitializePage implements OnInit {
  year: number = new Date().getFullYear();
  refreshtokenCounter = 0;
  loadingController = inject(LoadingController)
  authService = inject(AuthService)
  router = inject(Router)
  tokenService = inject(TokenService)
  base = inject(BaseClass)
  Platform = inject(Platform)

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.checkStorage();
    }, 1000);
  }

  async checkStorage() {
    const token = await this.base.storage.get('inquiry-token');
    const validToken = await this.authService.validateToken(token.value);
    if (token.value == null) {
      this.router.navigate(['/login']);
    } else if (!validToken && this.refreshtokenCounter == 0) {
      this.tokenService.GetAllPrimaryKey().subscribe(
        (res) => {this.refreshtokenCounter++;this.checkStorage();},
        (error) => {this.router.navigate(['/login']);}
      );
    } else {
      if (this.router.url.indexOf('/initial') !== -1) {
        this.router.navigate(['/sign']);
      }
    }
  }

}
