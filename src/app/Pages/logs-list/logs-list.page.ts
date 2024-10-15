import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaseClass } from 'src/app/base/components/base-component';
import { HttpService } from 'src/app/core/http/http.service';
import { LogFilter } from 'src/app/shared/models/filter';
import { Log } from 'src/app/shared/models/log';
import { LogSort } from 'src/app/shared/models/log-sort';
import {
  IonInfiniteScroll,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { BaseService } from 'src/app/base/services/base.service';
import { LoadingService } from 'src/app/core/loader/loader.service';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { OverPageModalService } from 'src/app/shared/@ui-components/over-page-modal/over-page-modal.service';
import { BaseListComponent } from 'src/app/base/components/base-list-component';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogService } from './services/log.service';
import { LogsFilterModalComponent } from './logs-filter-modal/logs-filter-modal.component';
import { CommonModule } from '@angular/common';
import { LogsListListItemComponent } from './logs-list-list-item/logs-list-list-item.component';
import { HeaderSortAreaPage } from 'src/app/shared/@ui-components/header-sort-area/header-sort-area.page';
import { statsChartOutline, calendarClearOutline, closeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  NavParams,
  IonSelectOption,
  IonSelect,
  IonLabel,
  IonItem,
  IonDatetime,
  IonButton,
  IonIcon,
  IonButtons,
  IonCol,
  IonRow,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-logs-list',
  templateUrl: './logs-list.page.html',
  styleUrls: ['./logs-list.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LogsListListItemComponent,
    LogsFilterModalComponent,
    HeaderSortAreaPage,
    IonIcon,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LogsListPage extends BaseListComponent implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  override mainUrl = 'EmployeeAttendanceLogs/GetAllPagedMobile';
  override list: Log[] = [];

  override filter: LogFilter = {
    startDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toLocaleDateString('en-US'),
    endDate: new Date().toLocaleDateString('en-US'),
    logTypeId: [],
    employeeId: null,
  };

  sort = new LogSort();
  @ViewChild('filterContent', { read: TemplateRef })
  filterContent!: TemplateRef<any>;

  get Service(): HttpService {
    return this.logService;
  }

  constructor(
    private base: BaseClass,
    private logService: LogService,
    public modalController: ModalController,
    private baseService: BaseService,
    private toast: ToastController,
    private load: LoadingService,
    private route: Router,
    public localize: TranslationService,
    public modal: OverPageModalService
  ) {
    super(baseService, toast, load, route, localize);
    addIcons({ statsChartOutline, calendarClearOutline, closeCircleOutline });
  }

  override async ngOnInit() {
    // debugger
    console.log('==========Before filter===============>', this.filter);

    this.filter.employeeId = JSON.parse(
      (await this.base.storage.get('inquiry-claims')).value!
    ).UserId;
    this.opt.sortDirection = this.sort.direction;
    this.opt.sortField = this.sort.column;

    console.log('==========After filter===============>', this.filter);
    this.resetCountAndData();
    super.loadTableData();
  }

  sortData(data: any) {
    if (data !== null && data !== undefined) {
      this.opt.sortField = 'timeEntry';
      this.opt.sortDirection = data.direction;
    }
    this.toggleInfiniteScroll();
    this.resetCountAndData();
    this.loadTableData();
  }

  async openModal() {
    // debugger;
    const modal = await this.presentModal();
    const data = await (await modal.onWillDismiss()).data;
    // debugger;
    if (data !== null && data !== undefined && data.dismissed == true) {
      this.filter = data.filter;
      this.toggleInfiniteScroll();
      this.resetCountAndData();
      this.loadTableData();
    }
  }

  // async presentModal() {
  //   const modal = await this.modalController.create({
  //     component: LogsFilterModalComponent,
  //     cssClass: 'logs-filter-modal',
  //     showBackdrop: true,
  //     componentProps: {
  //       filter: this.filter,
  //     },
  //   });

  //   await modal.present();
  //   return modal;
  // }

  async presentModal() {
    // Convert dates to ISO 8601 format
    const filter = {
      ...this.filter,
      startDate: this.convertToISO8601(this.filter.startDate!),
      endDate: this.convertToISO8601(this.filter.endDate!)
    };

    const modal = await this.modalController.create({
      component: LogsFilterModalComponent,
      cssClass: 'logs-filter-modal',
      showBackdrop: true,
      componentProps: { filter }
    });

    await modal.present();
    return modal;
  }

  convertToISO8601(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
  }


  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = false;
  }

  ionViewWillLeave() {
    if (this.subList) {
      this.subList.unsubscribe();
    }
  }
}
