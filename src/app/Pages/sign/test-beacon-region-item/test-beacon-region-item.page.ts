import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonItem, IonLabel, IonItemDivider, IonIcon } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IBeacon, IBeaconDelegate, IBeaconPluginResult } from '@awesome-cordova-plugins/ibeacon/ngx';
import { BaseClass } from 'src/app/base/components/base-component';
import { pairwise } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-test-beacon-region-item',
  templateUrl: './test-beacon-region-item.page.html',
  styleUrls: ['./test-beacon-region-item.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonItem, IonLabel, IonItemDivider, CommonModule, FormsModule, TranslateModule]
})
export class TestBeaconRegionItemPage implements OnInit {
  scanStatusValue = false;
  @Input() scanStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Input() beacon: any;
  @Input() beaconIndex: any;
  @Input() lastIndex: any;
  @Input() scaningIndex: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  @Input() iosDevice: boolean = false;

  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() selectBeaconScan: EventEmitter<any> = new EventEmitter();

  beaconData: [] = [];
  private delegate!: IBeaconDelegate;
  public beaconRegion: any = null;
  result: any = {};
  startTime = 0;
  endTime = 1000;
  scannig = false;
  timeScannig = 5000;
  counter = 0;

  constructor(
    private readonly ibeacon: IBeacon,
    private changeRef: ChangeDetectorRef,
    private base: BaseClass,
  ) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {
    this.startTime = (this.beaconIndex) * this.timeScannig;
    this.endTime = (this.startTime + this.timeScannig) - 2;
    this.startScanningTime();
    this.endScanningTime();
    this.scanStatus.subscribe(response => {
      this.scanStatusValue = response;
    });
    this.scaningIndex.pipe(pairwise()).subscribe(([previous, current]) => {
      if (this.scanStatusValue == false) {
        this.scannig = false;
        this.stopScanning();
        this.disableDebugLogs();
        this.finished.emit(true);
      }
      else if (previous !== current && current == this.beaconIndex && this.counter !== 0) {
        this.scanningInTime();
      }
    });
  }

  scanningInTime() {
    this.scannig = true;
    this.enableDebugLogs();
    this.startScanning();
    this.scaningIndex.next(this.beaconIndex);

    setTimeout(() => {
      this.scannig = false;
      this.stopScanning();
      this.disableDebugLogs();
      this.scaningIndex.next(this.beaconIndex + 1);
      if ((this.beaconIndex + 1) == this.lastIndex && this.scanStatusValue == true) {
        this.finished.emit(true);
      }
    }, (this.timeScannig - 2));

  }

  startScanningTime() {
    setTimeout(() => {
      this.counter++;
      this.scannig = true;
      this.enableDebugLogs();
      this.startScanning();
      this.scaningIndex.next(this.beaconIndex);
    }, this.startTime);
  }

  endScanningTime() {
    setTimeout(() => {
      this.scannig = false;
      this.stopScanning();
      this.disableDebugLogs();
      this.scaningIndex.next(this.beaconIndex + 1);
      if ((this.beaconIndex + 1) == this.lastIndex && this.scanStatusValue == true) {
        this.finished.emit(true);
      }
    }, this.endTime);
  }

  enableDebugLogs(): void {
    this.ibeacon.enableDebugLogs();
  }

  disableDebugLogs(): void {
    this.ibeacon.disableDebugLogs();
  }

  stopScanning(): void {
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion).then(async () => { }).catch((error: any) => { });
  }

  startScanning() {
    this.beacon.active = false;
    this.delegate = this.ibeacon.Delegate();
    this.ibeacon.setDelegate(this.delegate);
    this.ibeacon.isBluetoothEnabled().then((data) => { if (!data) { this.ibeacon.enableBluetooth() } });
    this.beaconRegion = this.ibeacon.BeaconRegion(this.beacon.beaconNameEn, this.beacon.uuid);
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion)
      .then((res) => { })
      .catch((error: any) => { });

    this.delegate.didRangeBeaconsInRegion()
      .subscribe(async (pluginResult: IBeaconPluginResult) => {
        this.result = pluginResult;
        if (pluginResult.beacons.length > 0) {
          this.beaconData = pluginResult.beacons as any;
          this.changeRef.detectChanges();
          let data = this.beaconData.find(a => a['uuid'] == this.beacon.uuid.toLowerCase());

          if (data !== null && data !== undefined) {
            this.beacon.rssi = data['rssi'];
            this.beacon.minor = data['minor'];
            this.beacon.major = data['major'];
            this.beacon.accuracy = data['accuracy'];
            this.beacon.TX = data['tx'];
            this.beacon.active = true;
          }
          let element: HTMLElement = document.getElementById('testinIds') as HTMLElement;
          element.click();
        }
        else { }
      },
        (error: any) => {
          console.error(`Failure during ranging: `, error);
          alert("Failure during ranging" + error);
        });
  }

  testBtn() {
    this.base.toastSuccess("beacons detected", false);
  }

  selectBeacon() {
    this.selectBeaconScan.emit(this.beacon);
  }
}
