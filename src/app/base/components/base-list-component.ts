import { Directive, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { BaseService } from '../services/base.service';
import * as moment from 'moment';
import { AttendanceFilter } from 'src/app/shared/models/attendanceFilter';
import { LoadingService } from 'src/app/core/loader/loader.service';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { HttpService } from 'src/app/core/http/http.service';
export class Notification {
  date!: Date;
  notification: any[] = [];
}

@Directive()
export abstract class BaseListComponent implements OnInit {
  protected subList!: Subscription;
  protected subInitiList!: Subscription;
  mainUrl!: string;
  filter: any;
  list: any[] = [];
  newList: any[] = [];
  dayDate = new Date();

  opt: any = {
    limit: 10,
    offset: 1,
    sortDirection: 'ascending',
    sortField: 'id',
  };

  maximumPages = 1;
  currentCount = 0;
  totalCount = 0;
  maxDate: any = new Date(
    new Date().setFullYear(new Date().getFullYear() + 3)
  ).toISOString();
  sortTypeId = 0;
  ascSortType = false;
  filtringDto: AttendanceFilter = {};

  constructor(
    private BaseService: BaseService,
    private Toast: ToastController,
    public loader: LoadingService,
    private Route: Router,
    private Localize: TranslationService
  ) {}

  abstract get Service(): HttpService;

  ngOnInit(): void {}

  Redirect() {
    const currentRoute = this.Route.url;
    const index = currentRoute.lastIndexOf('/');
    const str = currentRoute.substring(0, index);
    this.Route.navigate([str]);
  }

  resetCountAndData(): void {
    this.list = [];
    this.totalCount = 0;
    this.currentCount = 0;
    this.opt.offset = 1;
    this.maximumPages = 1;
  }

  resetCountAndDataforMonthly(): void {
    this.list = [];
    this.totalCount = 0;
    this.currentCount = 0;
    this.opt.offset = 1;
    this.opt.limit = 31;
    this.maximumPages = 1;
  }

  calculateDiff(fromDate: any, toDate: any) {
    toDate = new Date(toDate);
    fromDate = new Date(fromDate);
    return (
      Math.floor(
        (Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) -
          Date.UTC(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate()
          )) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  }

  groupingByCreateDate(): any[] {
    let newList: any[] = [];
    let nestedList: Array<any> = this.list;

    let data = new Set(
      this.list.map((item) =>
        moment(item?.createdDate).format('YYYY-MM-DD').toString()
      )
    );
    data.forEach((date) => {
      newList.push({
        date: date,
        notification: nestedList.filter(
          (i) => moment(i?.createdDate).format('YYYY-MM-DD') === date
        ),
      });
    });

    return newList;
  }

  loadTableData(event?: any, withoutConcat?: boolean) {
    // debugger;
    if (this.opt.offset > this.maximumPages) {
      return false;
    }

    this.loader.show();
    this.subList = this.BaseService.getGridData(
      this.mainUrl,
      this.filter,
      this.opt
    ).subscribe({
      next: (res: any) => {
        // debugger;
        if (res) {
          console.log("==========Before res===============>", res);
          this.dayDate = this.filter.dayDate === undefined
              ? new Date()
              : new Date(this.filter.dayDate);

          this.list = withoutConcat
            ? res?.data.list
            : this.list.concat(res?.data.list);

          this.newList = this.groupingByCreateDate();

          if (res.data.list == undefined) {
            this.currentCount = 0;
            this.totalCount = 0;
            this.maximumPages = 0;
          } else {
            this.currentCount = this.currentCount + res.data.list.length;
            this.totalCount = res.data.count;
            this.maximumPages = res.data.pageSize;
          }
        }
        this.loader.hide();
        console.log("==========After res===============>", res);
      },
      error: (error) => {
        this.loader.hide();
        this.toastError(error, false);
      },
    });

    if (event) {
      event.target.complete();
    }

    return false;
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.resetCountAndData();
      this.loadTableData();
      event.target.complete();
    }, 2000);
  }

  loadData(event?: any) {
    this.opt.offset++;
    this.loadTableData(event);
    if (this.currentCount >= this.totalCount) {
      event.target.disabled = true;
    }
  }

  async toastSuccess(
    message: any,
    translate: boolean = true,
    position: number = 0
  ) {
    const toast = await this.Toast.create({
      message: translate
        ? this.Localize.translate.instant('message.' + message)
        : message,
      animated: true,
      duration: 3000,
      position: position == 0 ? 'top' : position == 1 ? 'bottom' : 'middle',
      color: 'success',
      cssClass: 'text-center',
    });
    toast.present();
  }

  async toastError(
    message: any,
    translate: boolean = true,
    position: number = 0,
    duration: number = 3000
  ) {
    const toast = await this.Toast.create({
      message: translate
        ? this.Localize.translate.instant('message.' + message)
        : message,
      animated: true,
      duration: duration,
      position: position == 0 ? 'top' : position == 1 ? 'bottom' : 'middle',
      color: 'danger',
      cssClass: 'text-center',
    });
    toast.present();
  }

  async toastInformation(
    message: any,
    translate: boolean = true,
    position: number = 0
  ) {
    const toast = await this.Toast.create({
      message: translate
        ? this.Localize.translate.instant('message.' + message)
        : message,
      animated: true,
      duration: 3000,
      position: position == 0 ? 'top' : position == 1 ? 'bottom' : 'middle',
      color: 'favorite',
      cssClass: 'text-center',
    });
    toast.present();
  }

  delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
