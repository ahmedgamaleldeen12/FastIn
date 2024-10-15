import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addMoileUserFaceRegistration } from 'src/app/shared/models/addMoileUserFaceRegistration';
import { Camera, CameraDirection, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
import { BaseClass } from 'src/app/base/components/base-component';
import { Router } from '@angular/router';
import { FaceRegistrationService } from './face-registration.service';

@Component({
  selector: 'app-face-registration',
  templateUrl: './face-registration.page.html',
  styleUrls: ['./face-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FaceRegistrationPage implements OnInit {
  model: addMoileUserFaceRegistration = {} as addMoileUserFaceRegistration;
  options: ImageOptions = { resultType: CameraResultType.DataUrl, source: CameraSource.Camera, quality:80 , direction: CameraDirection.Front };
  base = inject(BaseClass);
  service = inject(FaceRegistrationService);
  router = inject(Router);
  claims: any;

  constructor() { }

  async ngOnInit() {
    this.claims = JSON.parse((await this.base.storage.get('inquiry-claims')).value!);
    this.model.mobileUserId = JSON.parse((await this.base.storage.get('inquiry-claims')).value!).UserId;
  }

  async ionViewWillEnter() {
    await Camera.getPhoto(this.options).then(async (result) => {
      this.model.mobileUserImagePath = result.dataUrl;
      await this.service.getOneFaceCropped(this.model.mobileUserImagePath!).then(async (res) => {
        if (typeof res === "string") {
          this.model.mobileUserImagePath = res;
          await this.sendImg();
          this.forwardBack();
        } else {
          this.base.toastError('there is ' + res + ' faces in the Image', false);
          this.forwardBack();
        }
      })
    }).catch(() => {
      this.forwardBack();
    });
  }

  async sendImg() {
    this.base.showLoader();
    this.service.MobileUserFaceIdRegistration(this.model).subscribe(
      (res: any) => {
        this.base.hideLoader();
        this.base.toastSuccess(res.data, true);
        this.forwardBack();
      },
      (error: any) => {
        this.base.hideLoader();
        this.forwardBack();
        this.base.toastError(error.data, true);
      }
    );
  }

  forwardBack(): void {
    this.router.navigate(['/sign']);
  }

  ionViewWillLeave() {
    this.model.mobileUserImagePath = '';
  }

}
