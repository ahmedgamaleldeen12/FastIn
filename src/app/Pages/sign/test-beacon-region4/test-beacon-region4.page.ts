import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonProgressBar, IonItemDivider, IonLabel, IonSpinner, IonCard, IonCardContent, IonButton, IonFab, ModalController, Platform, AlertController, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonFabButton } from '@ionic/angular/standalone';
import { IBeacon, IBeaconDelegate } from '@awesome-cordova-plugins/ibeacon/ngx';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SignService } from '../services/sign.service';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { BaseClass } from 'src/app/base/components/base-component';
import { AndroidPermissionResponse, AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { TestBeaconRegionItemPage } from "../test-beacon-region-item/test-beacon-region-item.page";
import { addIcons } from 'ionicons';
import { closeOutline, pauseSharp, playSharp } from 'ionicons/icons';


@Component({
  selector: 'app-test-beacon-region4',
  templateUrl: './test-beacon-region4.page.html',
  styleUrls: ['./test-beacon-region4.page.scss'],
  standalone: true,
  imports: [IonButtons, IonProgressBar, IonItemDivider, IonLabel, IonSpinner, IonCard, IonCardContent, IonButton, IonFab, IonFabButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, TranslateModule, TestBeaconRegionItemPage],
  providers: [IBeacon, AndroidPermissions]
})
export class TestBeaconRegion4Page implements OnInit {
  beaconsList = [];
  scanStatusSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  scaningIndex: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  beaconData = [];
  beaconUuid!: String;
  scanStatus: boolean = false;
  private delegate: IBeaconDelegate | undefined = undefined;
  public beaconRegion: any = null;
  public iosDevice: boolean = false;
  result: any = {};
  showworkcenter: boolean = false;
  workCenters: any = {};
  locationTest: any = {
    lat: 30, lng: 30,
    mobileUserId: null,
    typeId: 2,
    workCenterId: null
  };

  constructor(
    private readonly ibeacon: IBeacon,
    private readonly platform: Platform,
    private modalCtrl: ModalController,
    public service: SignService,
    public localize: TranslationService,
    public base: BaseClass,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController
  ) {
    addIcons({ closeOutline, pauseSharp, playSharp });

    this.platform.ready().then(() => {

      this.requestLocPermissoin();
      this.getDevices();
    });
  }

  async getDevices() {
    let claims = JSON.parse((await this.base.storage.get('inquiry-claims')).value!);
    this.locationTest.mobileUserId = claims.UserId;
    this.service.getLocationGps(this.locationTest).subscribe(result => {
      this.beaconsList = result.beacons;
      if (result.beacons !== null && result.beacons.length > 0) {
        this.scanStatus = true;
        this.scanStatusSubject.next(true);
      }
      else {
        this.scanStatus = true;
        this.scanStatusSubject.next(true);
      }
    });
  }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    await this.askBluetoothPermissionsIfneeded();

    this.locationTest.workCenterId = null;
    this.beaconsList = [];
  }
  requestLocPermissoin(): void {
    if (this.platform.is('ios')) {
      this.iosDevice = true;
      // this.ibeacon.requestAlwaysAuthorization();
    }
  }

  async askBluetoothPermissionsIfneeded() {
    const permissions = [
      this.androidPermissions.PERMISSION.BLUETOOTH,
      this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
      this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
      this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
    ];
  
    const results = await Promise.all(
      permissions.map(permission => this.androidPermissions.checkPermission(permission))
    );
  
    const hasAllPermissions = results.every(result => result.hasPermission);
  
    if (!hasAllPermissions) {
      this.androidPermissions.requestPermissions(permissions);
    }
  }
  
  onScanClicked(): void {
    if (!this.scanStatus) {
      this.scanStatus = true;
      this.scanStatusSubject.next(true);
      this.scaningIndex.next(0);
    } else {
      this.scanStatus = false;
      this.scanStatusSubject.next(false);
      this.scaningIndex.next(150);
    }
  }

  selectBeacon(beacon: any) {
    this.scanStatus = false;
    this.scanStatusSubject.next(false);
    this.modalCtrl.dismiss({ data: beacon });
  }


  close() {
    this.scanStatus = false;
    this.beaconsList = [];
    this.scanStatusSubject.next(false);
    this.modalCtrl.dismiss({ data: null });
  }

  testBtn() {
    this.base.toastSuccess("beacons detected", false);
  }

  finishedScanning(event: any) {
    this.scanStatus = false;
    this.scanStatusSubject.next(false);
  }

}
