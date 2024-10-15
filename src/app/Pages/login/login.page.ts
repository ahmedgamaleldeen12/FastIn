import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol,
  IonLabel,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
  IonCheckbox,AlertController
} from '@ionic/angular/standalone';
import { LoginModel } from 'src/app/shared/models/login';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { BaseClass } from 'src/app/base/components/base-component';
import { TokenService } from 'src/app/core/auth/token.service';
import { SessionManager } from 'src/app/core/guards/session-manager';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { personOutline, bagOutline, eyeOff, eye } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  standalone: true,
  imports: [
    IonIcon,
    IonContent,
    IonInput,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonRow,
    IonCol,
    IonLabel,
    TranslateModule,
    IonItem,
    IonButton,
    ReactiveFormsModule,
    IonCheckbox,
  ],
  providers: [BaseClass],
})
export class LoginPage implements OnInit {
  passwordToggleIcon = 'eye-off';
  showPassword = false;
  form!: FormGroup;
  model: LoginModel = { rememberMe: true, isMobileBrowser: true };
  router = inject(Router);
  authService = inject(AuthService);
  tokenService = inject(TokenService);
  base = inject(BaseClass);
  alertController = inject(AlertController);

  constructor() {
    addIcons({ personOutline, bagOutline, eyeOff, eye });
  }

  ngOnInit() {
    this.form = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      rememberMe: new FormControl(true),
      isMobileBrowser: new FormControl(true),
    });
  }

  ionViewWillEnter() {
    this.form.get('userName')?.setValue('');
    this.form.get('password')?.setValue('');
  }

  async login() {
    this.base.showLoader();

    const userName = this.form.get('userName')?.value;
    const password = this.form.get('password')?.value;
    const rememberMe = this.form.get('rememberMe')?.value;

    if (!userName || !password) {
      this.base.hideLoader();
      return;
    }

    this.authService.login(this.form.value).subscribe(
      (result: any) => {
        this.base.hideLoader();
        if (result.data && result.data.token) {
          const claims = SessionManager.parseJwt(result.data.token);
          this.tokenService.storeTokens(result.data, claims, rememberMe);
          debugger;
          this.router.navigate(['./sign']);
        }
      },
      (error) => {
        this.base.hideLoader();
        this.base.toastError(error, false);
      }
    );
  }

  togglePasswordType() {
    this.showPassword = !this.showPassword;
    this.passwordToggleIcon = this.showPassword ? 'eye-off' : 'eye';
  }
}
