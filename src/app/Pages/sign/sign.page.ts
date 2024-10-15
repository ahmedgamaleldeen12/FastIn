import { locationCoordinates } from './../../shared/models/locationCoordinates';
import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild, ViewContainerRef, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { ModalController, NavController, Platform, IonSegmentButton, IonButton, IonCard, IonCardContent, IonLabel, IonRow, IonCol, IonImg, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonSegment, IonItem, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { SignService } from './services/sign.service';
import { BaseClass } from 'src/app/base/components/base-component';
import { OverPageSideModalService } from 'src/app/shared/@ui-components/over-page-side-modal/over-page-side-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { CameraDirection, CameraResultType, CameraSource, Camera, } from '@capacitor/camera';
import { TestBeaconRegion4Page } from './test-beacon-region4/test-beacon-region4.page';
import { Geolocation } from '@capacitor/geolocation';
import { logOutOutline, personCircleOutline, saveOutline, camera, menuOutline, bluetoothOutline, locateOutline, fingerPrintOutline, languageOutline, locate } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { LocationProofEnum } from 'src/app/shared/Enums/Enums';
import { FaceApiService } from 'src/app/shared/services/face-api.service';
import { FaceRegistrationService } from '../face-registration/face-registration.service';
import { sign } from 'src/app/shared/models/sign';
const apiKey = 'AIzaSyCForRkLjxQyDp82eGfZ8YLXLV8F-CFal0';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.page.html',
  styleUrls: ['./sign.page.scss'],
  standalone: true,
  imports: [IonSegmentButton, IonButton, IonCard, IonCardContent, IonLabel, IonRow, IonCol, IonImg, IonFab, IonFabButton, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule, TranslateModule, IonSegment, IonItem],
  providers: [BaseClass],
})
export class SignPage implements OnInit {
  signInColor: string = 'success';
  signOutColor: string = '';
  GPSColor: string = '';
  BeaconColor: string = 'primary';
  typeSelect: any = 2; //Beacon = 2 or Gps = 0
  signData: sign = {
    logTypeId: 1, // value = 2 ==> out     value = 1 ==> In
  };
  form!: FormGroup;
  beacons: any[] = [];
  imageTest: string = '';
  activated = false;
  currentLocation = {
    active: false,
    nameFl: 'Enable Location First!',
  };
  signUserStatus = 3; //  Accepted = 0  Waiting = 1  Rejected = 2  NotFound=3
  address: any;
  beaconInfo: any;
  locationProofEnum = LocationProofEnum;
  locationType: any;
  timeZone = new Date();
  isCamera: boolean = true;
  claims: any;
  employeNumber: any;
  employeeFirstName: any;
  @ViewChild('menu', { static: true }) menu!: TemplateRef<any>;



  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef;
  result: string = '';
  isDetecting: boolean = false;
  detectionIntervalId: any;
  imageBase64: string = '';



  http = inject(HttpClient);
  private readonly faceRegistrationservice = inject(FaceRegistrationService)
  faceApiService = inject(FaceApiService);
  constructor(
    private navCtrl: NavController,
    public platform: Platform,
    private router: Router,
    public modalController: ModalController,
    public service: SignService,
    public base: BaseClass,
    public modal: OverPageSideModalService
  ) {
    addIcons({ personCircleOutline, menuOutline, bluetoothOutline, locateOutline, fingerPrintOutline, locate, camera, saveOutline, logOutOutline, languageOutline });
  }

  async ngOnInit() {
    this.claims = JSON.parse((await this.base.storage.get('inquiry-claims')).value!);
    if (this.claims) {
      this.employeNumber = this.claims.EmployeeNumber;
      this.employeeFirstName = this.claims.EmployeeFirstName;
      this.signData.mobileUserId = this.claims.UserId;
    }
  }

  async ionViewWillEnter() {
    await this.IsMobileUserHasAcceptedFace();

    this.base.loader.hide();
    this.locationType = this.typeSelect;
    if (this.locationType !== this.locationProofEnum['beacon']) {
      await this.locateUser(false);
    }
    this.imageTest = '';
    this.beaconInfo = null;
    if (this.faceApiService.capturedImage != null && this.faceApiService.capturedImage != undefined) {
      this.imageTest = this.faceApiService.capturedImage;
      this.signData.imagePath = this.faceApiService.capturedImage;
      this.faceApiService.capturedImage = undefined;
    }
  }

  async IsMobileUserHasAcceptedFace() {
    if (this.claims && this.claims.UserId) {
      this.service.IsMobileUserHasAcceptedFace(this.claims.UserId).subscribe(
        (res: any) => { this.signUserStatus = res.data; }
      );
    } else {
      console.error('UserId is undefined');
    }
  }

  async onSubmit() {
    if (this.signUserStatus == 1) {
      this.base.toastError('AdminDidnotAcceptYourOrderYet', true);
      return null;
    } else if (this.signUserStatus == 3) {
      this.base.toastError('YouShouldRegisterFaceIdFirst', true);
      return null;
    }
    if (this.isCamera && this.imageTest == '') {
      this.base.toastError('ImageisRequired', true);
      return false;
    }
    this.activated = false;
    this.saveSign();
    return false;
  }

  async saveSign() {
    this.activated = false;
    this.base.showLoader();
    let timeZone2 = moment.tz.guess();
    if (timeZone2.includes('/')) {
      timeZone2 = timeZone2.split('/')[1];
    }

    this.signData.timeZone = timeZone2;
    this.signData.typeId = this.typeSelect;

    if (this.typeSelect == 2) {
      this.signData.beaconId = this.beaconInfo.id;
    }

    this.faceRegistrationservice.getOneFaceCroppedForLogs(this.signData.imagePath!).then((res) => {
      if (typeof res === 'number') {
        this.base.toastError('There are ' + res + ' in This Image', false);
        this.ionViewWillEnter();
      } else {
        this.service.saveSign(this.signData).subscribe(
          (res) => {
            this.base.hideLoader();
            this.base.toastSuccess(res.data, true);
            this.ionViewWillEnter();
          },
          (error) => {
            this.base.hideLoader();
            this.base.toastError(error, true);
            this.ionViewWillEnter();
          }
        );
      }
    })
  }

  // async takePicture() {
  //   this.IsMobileUserHasAcceptedFace();
  //   const capturedPhoto = await Camera.getPhoto({
  //     resultType: CameraResultType.Base64,
  //     source: CameraSource.Camera,
  //     quality: 40,
  //     direction: CameraDirection.Front,
  //   });
  //   this.imageTest = 'data:image/jpeg;base64,' + capturedPhoto.base64String;
  //   this.signData.imagePath = capturedPhoto.base64String;
  // }

  async RunlocationAccuracy(save: boolean) {
    try {
      this.activated = false;
      this.base.showLoader();
      await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.locatLocationUser(save);
    } catch (error) {
      this.base.hideLoader();
      alert('Please Enable location first to continue');
      this.currentLocation.nameFl = 'Enable Location First!';
      this.currentLocation.active = false;
      this.activated = false;
    }
  }

  async locateUser(save: boolean) {
    await this.RunlocationAccuracy(save);
  }

  async locatLocationUser(save: boolean) {
    try {
      const geoPosition = await Geolocation.getCurrentPosition();
      const coordinates: locationCoordinates = {
        lat: geoPosition.coords.latitude,
        lng: geoPosition.coords.longitude,
      };
      console.log('==========AFTER===============>', coordinates);
      this.signData.locationLatitude = coordinates.lat.toString();
      this.signData.locationLongitude = coordinates.lng.toString();
      this.base.hideLoader();
      this.checkValidLocationAndBeacons(false);
      if (save) {
        this.saveSign();
      }
    } catch (error) {
      this.base.hideLoader();
      alert('Please Enable location first to continue');
      this.currentLocation.active = false;
      this.activated = false;
    }
  }

  async checkValidLocationAndBeacons(isBeacon: boolean) {
    this.activated = false;
    this.currentLocation.active = false;
    this.currentLocation.nameFl = 'Enable Location First!';
    let locationTest = {
      lat: isBeacon ? 30 : this.signData.locationLatitude,
      lng: isBeacon ? 30 : this.signData.locationLongitude,
      mobileUserId: this.claims.UserId,
      typeId: this.typeSelect,
    };
    this.base.showLoader();
    if (!isBeacon) {
      this.signData.beaconId = undefined;
      this.getAddressFromCoordinates(
        locationTest.lat,
        locationTest.lng
      ).subscribe((result) => {
        // this.address = result.results[0].formatted_address;
        this.currentLocation.nameFl = result.results[0].formatted_address;
      });
    }
    this.service.getLocationGps(locationTest).subscribe(
      (result) => {
        this.base.hideLoader();
        console.log('result of send location', result)
        this.currentLocation.active = result.inLocation;
        if (
          this.currentLocation.nameFl == 'Enable Location First!' ||
          this.currentLocation.nameFl.trim() === ''
        ) {
          this.address = result.address;
          this.currentLocation.nameFl = result.address.display_name;
          if (result.address.display_name.trim() == '' && !result.inLocation) {
            this.currentLocation.nameFl = 'Your location is not verified';
          }
          if (result.address.display_name.trim() == '' && result.inLocation) {
            this.currentLocation.nameFl = 'Your location is verified';
          }
        }
        if (!result.inLocation && result.typeId == 1) {
          this.base.toastError('Yourlocationisnotverified', true);
        }
        if (!isBeacon && result.inLocation) {
          this.activated = true;
        }
        this.beacons = result.beacons;
      },
      (error) => {
        alert('an error Happened!');
        this.base.hideLoader();
      }
    );
  }
  getAddressFromCoordinates(lat: any, lng: any): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    return this.http.get(url);
  }
  async showBeaconModal() {
    const modal = await this.modalController.create({
      component: TestBeaconRegion4Page,
      animated: true,
      showBackdrop: false,
    });
    modal.present();
    const data = (await modal.onWillDismiss()).data.data;
    if (data !== null && data !== undefined) {
      this.beaconInfo = data;
      this.signData.beaconId = this.beaconInfo.id;
      this.activated = true;
      console.log('this.beaconInfo', this.beaconInfo);
    } else {
      this.beaconInfo = null;
      this.signData.beaconId = undefined;
      this.activated = false;
    }
  }

  close() {
    this.navCtrl.pop();
  }

  getTimezoneName(): string {
    return new Date()
      .toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'long' })
      .substring(4);
  }

  toggleColors(segment: string) {
    if (segment === 'signout') {
      this.signInColor = '';
      this.signOutColor = 'danger';
    } else {
      this.signOutColor = '';
      this.signInColor = 'success';
    }
  }

  toggleColors2(segment: string) {
    if (segment === 'GPS') {
      this.GPSColor = 'primary';
      this.BeaconColor = '';
      this.signInColor = 'success';
      this.signOutColor = '';
      this.signData.logTypeId = 1;
    } else {
      this.BeaconColor = 'primary';
      this.GPSColor = '';
    }
  }
  showModal() {
    this.modal.template = this.menu;
    this.modal.toggleShow();
  }

  toggleMenu() {
    this.modal.template = this.menu;
    this.modal.toggleShow();
  }

  navigate(link: string) {
    this.IsMobileUserHasAcceptedFace();
    if (link == '/face-registration' && this.signUserStatus == 1) {
      this.base.toastError('AdminDidnotAcceptYourOrderYet', true);
      this.toggleMenu();
      return false;
    } else if (link == '/face-registration' && this.signUserStatus == 0) {
      this.base.toastError('YouAlreadyHaveAFaceId', true);
      this.toggleMenu();
      return false;
    }
    this.router.navigate([link]);
    this.toggleMenu();
    return false;
  }
  openCameraPage() {
    this.router.navigate(['/liveness-camera']);
  }
  async logOut() {
    this.base.storage.clear();
    this.toggleMenu();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  test(e: any) {
    console.log(e);
  }

}

















