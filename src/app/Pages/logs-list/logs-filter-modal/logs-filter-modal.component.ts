import { Component, Input, OnInit } from '@angular/core';
import { LogFilter } from 'src/app/shared/models/filter';
import {
  ModalController,
  NavParams,
  IonSelectOption,
  IonSelect,
  IonLabel,
  IonItem,
  IonDatetime,
  IonIcon,
  IonCol,
  IonRow,
  IonContent,
  IonModal,
  IonButton,
  IonButtons,
  IonDatetimeButton,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { BaseClass } from 'src/app/base/components/base-component';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-logs-filter-modal',
  templateUrl: './logs-filter-modal.component.html',
  styleUrls: ['./logs-filter-modal.component.scss'],
  standalone: true,
  imports: [IonDatetimeButton,
    IonHeader,
    IonToolbar,
    IonTitle, IonModal, IonContent, IonRow, IonCol, IonButtons, TranslateModule, ReactiveFormsModule, FormsModule, CommonModule, IonSelectOption, IonSelect, IonLabel, IonItem, IonDatetime, IonButton, IonIcon],
  // imports: [CommonModule, FormsModule, IonicModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LogsFilterModalComponent implements OnInit {
  maxData: any = new Date().getFullYear() + 3;
  // filter: LogFilter = {}; // remove this
  @Input() filter: LogFilter = {};
  statuslist: any = [{ id: 1, nameEn: 'In', nameAr: 'دخول' }, { id: 2, nameEn: 'Out', nameAr: 'خروج' }];

  constructor(
    public modalController: ModalController,
    private base: BaseClass,
    public localize: TranslationService,
    // public navParams: NavParams
  ) {
    // debugger;
    // this.filter = this.navParams.get('filter');
    // console.log('===>', this.filter);
  }

  ngOnInit() { }

  apply() {
    const formData = { dismissed: true, filter: this.filter };
    this.modalController.dismiss(formData);
  }

  async resetFilter() {
    let start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let end = new Date();
    let employeeID = JSON.parse(
      (await this.base.storage.get('inquiry-claims')).value!
    ).UserId;
    this.filter = {
      startDate: start.toLocaleDateString('en-US'),
      endDate: end.toLocaleDateString('en-US'),
      employeeId: employeeID,
    };
    this.apply();
  }

  close() {
    // const formData = {};
    // this.modalController.dismiss(formData);

    this.modalController.dismiss();
  }
}
